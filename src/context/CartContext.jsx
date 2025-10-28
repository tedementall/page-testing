// src/contexts/CartContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CartApi } from "../api/coreApi";
import { onUnauthorized } from "../api/http";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

/* ------------------------- helpers seguros ------------------------- */

function sanitizeQuantity(quantity) {
  const parsed = Number.parseInt(quantity, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pickImagesArray(product) {
  // Soporta: image_url: [ {url}|string ], images: [ ... ], image: string
  const raw =
    (Array.isArray(product?.image_url) && product.image_url) ||
    (Array.isArray(product?.images) && product.images) ||
    [];

  const images = raw
    .map((x) =>
      typeof x === "string" ? x : x?.url || x?.path || x?.src || ""
    )
    .filter(Boolean);

  const image = product?.image || images[0] || "";
  return { images, image };
}

function normalizeCartItem(item) {
  if (!item) return null;

  const product = item.product ?? {};
  const { images, image } = pickImagesArray(product);

  const quantity = sanitizeQuantity(item.quantity ?? 0);
  const price =
    toNumber(product.price) ||
    toNumber(product.price_value) ||
    toNumber(product.priceNumber) ||
    toNumber(item.price);

  const productId = item.product_id ?? product.id ?? null;

  return {
    id: item.id ?? `${productId ?? "item"}`,
    cartId: item.cart_id ?? null,
    productId,
    quantity,
    product: {
      id: productId,
      name: product.name ?? "",
      description: product.description ?? "",
      category: product.category ?? "",
      price,
      stock: product.stock ?? product.stock_quantity ?? null,
      images,
      image,
    },
    subtotal: price * quantity,
  };
}

function normalizeCart(cart) {
  if (!cart) {
    return { cartId: null, userId: null, items: [] };
  }
  const rawItems =
    (Array.isArray(cart.items) && cart.items) ||
    (Array.isArray(cart.cart_items) && cart.cart_items) ||
    [];

  const items = rawItems
    .map((ci) => normalizeCartItem(ci))
    .filter((x) => x && x.productId);

  return {
    cartId: cart.id ?? null,
    userId: cart.user_id ?? null,
    items,
  };
}

/* --------------------------- provider --------------------------- */

export function CartProvider({ children }) {
  const { status: authStatus } = useAuth();

  const [cartId, setCartId] = useState(() => CartApi.getStoredCartId());
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);

  // Guards / refs para evitar ráfagas
  const bootOnce = useRef(false);
  const lastAuthStatus = useRef(authStatus);
  const authThrottleRef = useRef(0);
  const inflightRefresh = useRef(null);
  const inflightEnsure = useRef(null);

  const applyCartState = useCallback((cartData) => {
    const normalized = normalizeCart(cartData);
    if (normalized.cartId) CartApi.setStoredCartId(normalized.cartId);
    setCartId(normalized.cartId);
    setUserId(normalized.userId);
    setItems(normalized.items);
    setError(null);
  }, []);

  const resetLocalCart = useCallback(() => {
    CartApi.clearStoredCartId();
    setCartId(null);
    setUserId(null);
    setItems([]);
  }, []);

  const handleCartError = useCallback(
    (err) => {
      if (err?.response?.status === 404) {
        resetLocalCart();
      }
      setError(err);
    },
    [resetLocalCart]
  );

  // Si el token expira (401), limpiamos estado local
  useEffect(() => {
    const unsub = onUnauthorized(() => {
      resetLocalCart();
    });
    return unsub;
  }, [resetLocalCart]);

  /* ---------------------- API wrappers con guard ---------------------- */

  const refreshCart = useCallback(
    async (targetCartId) => {
      const effectiveCartId =
        targetCartId ?? cartId ?? CartApi.getStoredCartId();

      if (!effectiveCartId) return null;

      // Evita refrescos concurrentes sobre el mismo id
      if (inflightRefresh.current) return inflightRefresh.current;

      setIsLoading(true);
      inflightRefresh.current = (async () => {
        try {
          const cart = await CartApi.getCart(effectiveCartId);
          if (cart) applyCartState(cart);
          return cart;
        } catch (err) {
          handleCartError(err);
          throw err;
        } finally {
          inflightRefresh.current = null;
          setIsLoading(false);
        }
      })();

      return inflightRefresh.current;
    },
    [applyCartState, cartId, handleCartError]
  );

  const ensureCartId = useCallback(async () => {
    if (cartId) return cartId;

    if (inflightEnsure.current) return inflightEnsure.current;
    setIsLoading(true);

    inflightEnsure.current = (async () => {
      try {
        const cart = await CartApi.ensureCart();
        if (cart) {
          applyCartState(cart);
          return cart.id ?? null;
        }
        return null;
      } catch (err) {
        handleCartError(err);
        throw err;
      } finally {
        inflightEnsure.current = null;
        setIsLoading(false);
      }
    })();

    return inflightEnsure.current;
  }, [applyCartState, cartId, handleCartError]);

  /* ---------------------- boot inicial (StrictMode safe) ---------------------- */

  useEffect(() => {
    if (bootOnce.current) return;
    bootOnce.current = true;

    let cancelled = false;
    (async () => {
      try {
        const existing = CartApi.getStoredCartId();
        if (existing) {
          if (!cancelled) await refreshCart(existing);
          return;
        }
        const ensuredId = await ensureCartId();
        if (!cancelled && ensuredId) await refreshCart(ensuredId);
      } catch (err) {
        if (!cancelled) console.error("Error inicializando el carrito", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ensureCartId, refreshCart]);

  /* ---------------------- cambios de autenticación ---------------------- */

  useEffect(() => {
    // Solo actuamos si el estado cambió realmente a uno estable
    if (
      authStatus !== "authenticated" &&
      authStatus !== "unauthenticated"
    ) {
      lastAuthStatus.current = authStatus;
      return;
    }

    if (authStatus === lastAuthStatus.current) return; // sin cambio real
    lastAuthStatus.current = authStatus;

    // Throttle para evitar doble efecto en StrictMode
    const now = Date.now();
    if (now - authThrottleRef.current < 800) return;
    authThrottleRef.current = now;

    // Reset y re-bootstrap suave
    (async () => {
      try {
        resetLocalCart();
        const id = await ensureCartId();
        if (id) await refreshCart(id);
      } catch (err) {
        console.error("Error actualizando carrito al cambiar autenticación", err);
      }
    })();
  }, [authStatus, ensureCartId, refreshCart, resetLocalCart]);

  /* ---------------------- acciones de carrito ---------------------- */

  const addItem = useCallback(
    async (productOrId, quantity = 1) => {
      const productId =
        typeof productOrId === "object" && productOrId !== null
          ? productOrId.id ??
            productOrId.product_id ??
            productOrId.productId
          : productOrId;

      const safeQuantity = sanitizeQuantity(quantity);
      if (!productId || safeQuantity <= 0)
        throw new Error("Producto o cantidad inválida");

      setIsMutating(true);
      try {
        const ensuredId = (await ensureCartId()) ?? cartId;
        if (!ensuredId) throw new Error("No fue posible obtener un carrito activo");

        await CartApi.addItem({
          cart_id: ensuredId,
          product_id: productId,
          quantity: safeQuantity,
        });

        await refreshCart(ensuredId);
      } catch (err) {
        handleCartError(err);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [cartId, ensureCartId, handleCartError, refreshCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      const safeQuantity = sanitizeQuantity(quantity);
      if (!cartItemId || safeQuantity <= 0)
        throw new Error("Cantidad inválida");

      setIsMutating(true);
      try {
        await CartApi.updateQty({ cart_item_id: cartItemId, quantity: safeQuantity });
        await refreshCart();
      } catch (err) {
        handleCartError(err);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [handleCartError, refreshCart]
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      if (!cartItemId) return;
      setIsMutating(true);
      try {
        await CartApi.removeItem(cartItemId);
        await refreshCart();
      } catch (err) {
        handleCartError(err);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [handleCartError, refreshCart]
  );

  const incrementItem = useCallback(
    async (cartItemId) => {
      const target = items.find((i) => i.id === cartItemId);
      if (!target) return;
      await updateQuantity(cartItemId, target.quantity + 1);
    },
    [items, updateQuantity]
  );

  const decrementItem = useCallback(
    async (cartItemId) => {
      const target = items.find((i) => i.id === cartItemId);
      if (!target) return;
      const next = target.quantity - 1;
      if (next <= 0) {
        await removeItem(cartItemId);
      } else {
        await updateQuantity(cartItemId, next);
      }
    },
    [items, removeItem, updateQuantity]
  );

  const clearCart = useCallback(async () => {
    const ensuredId = cartId ?? (await ensureCartId());
    if (!ensuredId) return;
    setIsMutating(true);
    try {
      await CartApi.clearCart(ensuredId);
      await refreshCart(ensuredId);
    } catch (err) {
      handleCartError(err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [cartId, ensureCartId, handleCartError, refreshCart]);

  /* ---------------------- totales y value ---------------------- */

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, it) => {
          acc.totalItems += it.quantity;
          acc.totalPrice += it.subtotal;
          return acc;
        },
        { totalItems: 0, totalPrice: 0 }
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      cartId,
      userId,
      items,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
      isLoading,
      isMutating,
      error,
      refreshCart,
      addItem,
      updateQuantity,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      cartId,
      clearCart,
      decrementItem,
      error,
      incrementItem,
      isLoading,
      isMutating,
      items,
      refreshCart,
      removeItem,
      totals.totalItems,
      totals.totalPrice,
      updateQuantity,
      userId,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

/* ---------------------- hook ---------------------- */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
