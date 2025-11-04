// src/context/CartContext.jsx
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

/* ------------------------- helpers ------------------------- */
function sanitizeQuantity(q) {
  const n = Number.parseInt(q, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function toNumber(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function pickImagesArray(product) {
  const raw = (Array.isArray(product?.image_url) && product.image_url)
           || (Array.isArray(product?.images) && product.images) || [];
  const images = raw.map(x => (typeof x === "string" ? x : x?.url || x?.path || x?.src || "")).filter(Boolean);
  const image = product?.image || images[0] || "";
  return { images, image };
}
function normalizeCartItem(item) {
  if (!item) return null;
  const product = item.product ?? {};
  const { images, image } = pickImagesArray(product);
  const quantity = sanitizeQuantity(item.quantity ?? 0);
  const price = toNumber(product.price) || toNumber(product.price_value) || toNumber(product.priceNumber) || toNumber(item.price);
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
  if (!cart) return { cartId: null, userId: null, items: [] };
  const rawItems = (Array.isArray(cart.items) && cart.items) || (Array.isArray(cart.cart_items) && cart.cart_items) || [];
  const items = rawItems.map(ci => normalizeCartItem(ci)).filter(x => x && x.productId);
  return { cartId: cart.id ?? null, userId: cart.user_id ?? null, items };
}

/* ========================= Provider ========================= */
export function CartProvider({ children }) {
  const { status: authStatus } = useAuth(); // checking | authenticated | unauthenticated

  const [cartId, setCartId] = useState(() => CartApi.getStoredCartId());
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);

  // control de concurrencia
  const bootOnce = useRef(false);
  const lastAuthStatus = useRef(authStatus);
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

  const handleCartError = useCallback((err) => {
    if (err?.response?.status === 404) resetLocalCart();
    setError(err);
  }, [resetLocalCart]);

  // 401 global => limpiar cart
  useEffect(() => {
    const unsub = onUnauthorized((code) => {
      if (code === 401) resetLocalCart();
    });
    return unsub;
  }, [resetLocalCart]);

  /* ---------- wrappers ---------- */
  const refreshCart = useCallback(async (targetCartId) => {
    const effective = targetCartId ?? cartId ?? CartApi.getStoredCartId();
    if (!effective) return null;
    if (inflightRefresh.current) return inflightRefresh.current;

    setIsLoading(true);
    inflightRefresh.current = (async () => {
      try {
        const cart = await CartApi.getCart(effective);
        if (cart) applyCartState(cart);
        return cart;
      } catch (err) {
        if (err?.response?.status !== 429) handleCartError(err); // silencia 429
        return null;
      } finally {
        inflightRefresh.current = null;
        setIsLoading(false);
      }
    })();
    return inflightRefresh.current;
  }, [applyCartState, cartId, handleCartError]);

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
        if (err?.response?.status !== 429) handleCartError(err);
        return null;
      } finally {
        inflightEnsure.current = null;
        setIsLoading(false);
      }
    })();
    return inflightEnsure.current;
  }, [applyCartState, cartId, handleCartError]);

  /* ---------- boot inicial ---------- */
  useEffect(() => {
    if (bootOnce.current) return;
    bootOnce.current = true;

    (async () => {
      // si Auth está chequeando, espera a que se estabilice (evita ráfagas)
      if (authStatus === "checking") return;

      try {
        const existing = CartApi.getStoredCartId();
        if (existing) {
          await refreshCart(existing);
        } else {
          const id = await ensureCartId();
          if (id) await refreshCart(id);
        }
      } catch (err) {
        // ya se manejó en handlers
      }
    })();
  }, [authStatus, ensureCartId, refreshCart]);

  /* ---------- cambios de autenticación ---------- */
  useEffect(() => {
    // Sólo re-bootstrap cuando cambia entre estados estables
    const stable = (s) => s === "authenticated" || s === "unauthenticated";
    if (!stable(authStatus) || authStatus === lastAuthStatus.current) return;

    lastAuthStatus.current = authStatus;

    (async () => {
      try {
        resetLocalCart();
        const id = await ensureCartId();
        if (id) await refreshCart(id);
      } catch {}
    })();
  }, [authStatus, ensureCartId, refreshCart, resetLocalCart]);

  /* ---------- acciones ---------- */
  const addItem = useCallback(async (productOrId, quantity = 1) => {
    const productId =
      typeof productOrId === "object" && productOrId !== null
        ? (productOrId.id ?? productOrId.product_id ?? productOrId.productId)
        : productOrId;
    const qty = sanitizeQuantity(quantity);
    if (!productId || qty <= 0) throw new Error("Producto o cantidad inválida");

    setIsMutating(true);
    try {
      const id = (await ensureCartId()) ?? cartId;
      if (!id) throw new Error("No fue posible obtener un carrito activo");
      await CartApi.addItem({ cart_id: id, product_id: productId, quantity: qty });
      await refreshCart(id);
    } catch (err) {
      if (err?.response?.status !== 429) handleCartError(err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [cartId, ensureCartId, handleCartError, refreshCart]);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    const qty = sanitizeQuantity(quantity);
    if (!cartItemId || qty <= 0) throw new Error("Cantidad inválida");

    setIsMutating(true);
    try {
      await CartApi.updateQty({ cart_item_id: cartItemId, quantity: qty });
      await refreshCart();
    } catch (err) {
      if (err?.response?.status !== 429) handleCartError(err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [handleCartError, refreshCart]);

  const removeItem = useCallback(async (cartItemId) => {
    if (!cartItemId) return;
    setIsMutating(true);
    try {
      await CartApi.removeItem(cartItemId);
      await refreshCart();
    } catch (err) {
      if (err?.response?.status !== 429) handleCartError(err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [handleCartError, refreshCart]);

  const incrementItem = useCallback(async (cartItemId) => {
    const target = items.find((i) => i.id === cartItemId);
    if (!target) return;
    await updateQuantity(cartItemId, target.quantity + 1);
  }, [items, updateQuantity]);

  const decrementItem = useCallback(async (cartItemId) => {
    const target = items.find((i) => i.id === cartItemId);
    if (!target) return;
    const next = target.quantity - 1;
    if (next <= 0) await removeItem(cartItemId);
    else await updateQuantity(cartItemId, next);
  }, [items, removeItem, updateQuantity]);

  const clearCart = useCallback(async () => {
    const id = cartId ?? (await ensureCartId());
    if (!id) return;
    setIsMutating(true);
    try {
      await CartApi.clearCart(id);
      await refreshCart(id);
    } catch (err) {
      if (err?.response?.status !== 429) handleCartError(err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [cartId, ensureCartId, handleCartError, refreshCart]);

  /* ---------- totales / value ---------- */
  const totals = useMemo(() => items.reduce((acc, it) => {
    acc.totalItems += it.quantity; acc.totalPrice += it.subtotal; return acc;
  }, { totalItems: 0, totalPrice: 0 }), [items]);

  const value = useMemo(() => ({
    cartId, userId, items,
    totalItems: totals.totalItems,
    totalPrice: totals.totalPrice,
    isLoading, isMutating, error,
    refreshCart, addItem, updateQuantity,
    incrementItem, decrementItem, removeItem, clearCart,
  }), [addItem, cartId, clearCart, decrementItem, error, incrementItem, isLoading, isMutating, items, refreshCart, removeItem, totals.totalItems, totals.totalPrice, updateQuantity, userId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ---------------------- hook ---------------------- */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
