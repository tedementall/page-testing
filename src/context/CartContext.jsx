import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react"
import { parseCurrency } from "../utils/currency"

const CartContext = createContext(null)
const STORAGE_KEY = "the-hub-cart"

const initialState = {
  items: []
}

function normalizeItem(product, quantity) {
  if (!product || typeof product.id === "undefined") return null

  const price = parseCurrency(product.price ?? product.priceValue ?? product.priceNumber)

  return {
    id: product.id,
    name: product.name,
    price,
    image: product.image,
    category: product.category,
    quantity,
    description: product.description ?? ""
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity = 1 } = action.payload ?? {}
      const safeQuantity = Math.max(
        1,
        Number.isFinite(Number(quantity)) ? Number.parseInt(quantity, 10) || 1 : 1
      )
      const normalized = normalizeItem(product, safeQuantity)
      if (!normalized) return state

      const existing = state.items.find((item) => item.id === normalized.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === normalized.id
              ? { ...item, quantity: item.quantity + safeQuantity }
              : item
          )
        }
      }

      return {
        ...state,
        items: [...state.items, normalized]
      }
    }
    case "REMOVE_ITEM": {
      const { id } = action.payload ?? {}
      if (!id) return state
      return {
        ...state,
        items: state.items.filter((item) => item.id !== id)
      }
    }
    case "INC_QTY": {
      const { id } = action.payload ?? {}
      if (!id) return state
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
    }
    case "DEC_QTY": {
      const { id } = action.payload ?? {}
      if (!id) return state
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(0, item.quantity - 1) }
              : item
          )
          .filter((item) => item.quantity > 0)
      }
    }
    case "CLEAR":
      return { ...state, items: [] }
    case "RESTORE_FROM_STORAGE": {
      const storedItems = Array.isArray(action.payload?.items)
        ? action.payload.items
        : []
      const items = storedItems
        .map((item) => ({
          ...item,
          price: parseCurrency(item.price),
          quantity:
            typeof item.quantity === "number" && item.quantity > 0
              ? item.quantity
              : 1
        }))
        .filter((item) => item.id)

      return { ...state, items }
    }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const hasHydrated = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === "object") {
          dispatch({ type: "RESTORE_FROM_STORAGE", payload: parsed })
        }
      }
    } catch (error) {
      console.error("Error restoring cart from storage", error)
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true
      return
    }

    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error("Error saving cart to storage", error)
    }
  }, [state])

  const value = useMemo(() => {
    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    return {
      items: state.items,
      totalItems,
      totalPrice,
      dispatch,
      addItem: (product, quantity = 1) =>
        dispatch({ type: "ADD_ITEM", payload: { product, quantity } }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: { id } }),
      incrementItem: (id) => dispatch({ type: "INC_QTY", payload: { id } }),
      decrementItem: (id) => dispatch({ type: "DEC_QTY", payload: { id } }),
      clearCart: () => dispatch({ type: "CLEAR" })
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
