import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { CartApi } from "../api/coreApi"
import { onUnauthorized } from "../api/http"
import { useAuth } from "./AuthContext"

const CartContext = createContext(null)

function sanitizeQuantity(quantity) {
  const parsed = Number.parseInt(quantity, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0
  }
  return parsed
}

function toNumber(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return parsed
}

function normalizeCartItem(item) {
  if (!item) {
    return null
  }

  const product = item.product ?? {}
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : product.image
      ? [product.image]
      : []
  const image = product.image ?? images[0] ?? ""
  const quantity = sanitizeQuantity(item.quantity ?? 0)
  const price = toNumber(product.price ?? product.price_value ?? product.priceNumber)

  return {
    id: item.id ?? `${item.product_id ?? product.id ?? "item"}`,
    cartId: item.cart_id ?? null,
    productId: item.product_id ?? product.id ?? null,
    quantity,
    product: {
      id: product.id ?? item.product_id ?? null,
      name: product.name ?? "",
      description: product.description ?? "",
      category: product.category ?? "",
      price,
      stock: product.stock ?? null,
      images,
      image
    },
    subtotal: price * quantity
  }
}

function normalizeCart(cart) {
  if (!cart) {
    return {
      cartId: null,
      userId: null,
      items: []
    }
  }

  const items = Array.isArray(cart.items)
    ? cart.items
        .map((item) => normalizeCartItem(item))
        .filter((item) => item && item.productId)
    : []

  return {
    cartId: cart.id ?? null,
    userId: cart.user_id ?? null,
    items
  }
}

export function CartProvider({ children }) {
  const { status: authStatus } = useAuth()
  const [cartId, setCartId] = useState(() => CartApi.getStoredCartId())
  const [userId, setUserId] = useState(null)
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState(null)
  const previousAuthStatus = useRef(authStatus)

  const applyCartState = useCallback((cartData) => {
    const normalized = normalizeCart(cartData)
    if (normalized.cartId) {
      CartApi.setStoredCartId(normalized.cartId)
    }
    setCartId(normalized.cartId)
    setUserId(normalized.userId)
    setItems(normalized.items)
    setError(null)
  }, [])

  const handleCartError = useCallback((err) => {
    if (err?.response?.status === 404) {
      CartApi.clearStoredCartId()
      setCartId(null)
      setUserId(null)
      setItems([])
    }
    setError(err)
  }, [])

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      CartApi.clearStoredCartId()
      setCartId(null)
      setUserId(null)
      setItems([])
    })
    return unsubscribe
  }, [])

  const refreshCart = useCallback(
    async (targetCartId) => {
      const effectiveCartId = targetCartId ?? cartId ?? CartApi.getStoredCartId()
      if (!effectiveCartId) return null
      setIsLoading(true)
      try {
        const cart = await CartApi.getCart(effectiveCartId)
        if (cart) {
          applyCartState(cart)
        }
        return cart
      } catch (err) {
        handleCartError(err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [applyCartState, cartId, handleCartError]
  )

  const ensureCartId = useCallback(async () => {
    if (cartId) {
      return cartId
    }
    setIsLoading(true)
    try {
      const cart = await CartApi.ensureCart()
      if (cart) {
        applyCartState(cart)
        return cart.id ?? null
      }
      return null
    } catch (err) {
      handleCartError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [applyCartState, cartId, handleCartError])

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      try {
        if (cartId) {
          await refreshCart(cartId)
          return
        }

        const ensuredId = await ensureCartId()
        if (cancelled || !ensuredId) return
        await refreshCart(ensuredId)
      } catch (err) {
        if (!cancelled) {
          console.error("Error inicializando el carrito", err)
        }
      }
    }

    initialize()

    return () => {
      cancelled = true
    }
  }, [cartId, ensureCartId, refreshCart])

  useEffect(() => {
    if (authStatus !== "authenticated" && authStatus !== "unauthenticated") {
      previousAuthStatus.current = authStatus
      return
    }

    const previous = previousAuthStatus.current
    previousAuthStatus.current = authStatus

    const shouldReset =
      authStatus === "authenticated" ||
      (authStatus === "unauthenticated" && previous === "authenticated")

    if (!shouldReset) {
      return
    }

    CartApi.clearStoredCartId()
    setCartId(null)
    setUserId(null)
    setItems([])

    ensureCartId()
      .then((id) => {
        if (!id) return null
        return refreshCart(id)
      })
      .catch((err) => {
        console.error("Error actualizando carrito al cambiar autenticación", err)
      })
  }, [authStatus, ensureCartId, refreshCart])

  const addItem = useCallback(
    async (productOrId, quantity = 1) => {
      const productId =
        typeof productOrId === "object" && productOrId !== null
          ? productOrId.id ?? productOrId.product_id ?? productOrId.productId
          : productOrId
      const safeQuantity = sanitizeQuantity(quantity)
      if (!productId || safeQuantity <= 0) {
        throw new Error("Producto o cantidad inválida")
      }
      setIsMutating(true)
      try {
        const ensuredId = await ensureCartId()
        if (!ensuredId) {
          throw new Error("No fue posible obtener un carrito activo")
        }
        await CartApi.addItem({ cart_id: ensuredId, product_id: productId, quantity: safeQuantity })
        await refreshCart(ensuredId)
      } catch (err) {
        handleCartError(err)
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    [ensureCartId, handleCartError, refreshCart]
  )

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      const safeQuantity = sanitizeQuantity(quantity)
      if (!cartItemId || safeQuantity <= 0) {
        throw new Error("Cantidad inválida")
      }
      setIsMutating(true)
      try {
        await CartApi.updateQty({ cart_item_id: cartItemId, quantity: safeQuantity })
        await refreshCart()
      } catch (err) {
        handleCartError(err)
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    [handleCartError, refreshCart]
  )

  const removeItem = useCallback(
    async (cartItemId) => {
      if (!cartItemId) return
      setIsMutating(true)
      try {
        await CartApi.removeItem(cartItemId)
        await refreshCart()
      } catch (err) {
        handleCartError(err)
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    [handleCartError, refreshCart]
  )

  const incrementItem = useCallback(
    async (cartItemId) => {
      const target = items.find((item) => item.id === cartItemId)
      if (!target) return
      await updateQuantity(cartItemId, target.quantity + 1)
    },
    [items, updateQuantity]
  )

  const decrementItem = useCallback(
    async (cartItemId) => {
      const target = items.find((item) => item.id === cartItemId)
      if (!target) return
      const nextQuantity = target.quantity - 1
      if (nextQuantity <= 0) {
        await removeItem(cartItemId)
      } else {
        await updateQuantity(cartItemId, nextQuantity)
      }
    },
    [items, removeItem, updateQuantity]
  )

  const clearCart = useCallback(async () => {
    const ensuredId = cartId ?? (await ensureCartId())
    if (!ensuredId) return
    setIsMutating(true)
    try {
      await CartApi.clearCart(ensuredId)
      await refreshCart(ensuredId)
    } catch (err) {
      handleCartError(err)
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [cartId, ensureCartId, handleCartError, refreshCart])

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity
        acc.totalPrice += item.subtotal
        return acc
      },
      { totalItems: 0, totalPrice: 0 }
    )
  }, [items])

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
      clearCart
    }),
    [addItem, cartId, clearCart, decrementItem, error, incrementItem, isLoading, isMutating, items, refreshCart, removeItem, totals.totalItems, totals.totalPrice, updateQuantity, userId]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
