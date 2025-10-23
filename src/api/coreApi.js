import { httpCore } from "./http"

const CART_KEY = import.meta.env.VITE_CART_KEY ?? "THEHUB_CART_ID"

function getStoredCartId() {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(CART_KEY)
  } catch (error) {
    console.error("Error reading cart id from storage", error)
    return null
  }
}

function setStoredCartId(id) {
  if (typeof window === "undefined") return
  try {
    if (!id) {
      window.localStorage.removeItem(CART_KEY)
    } else {
      window.localStorage.setItem(CART_KEY, String(id))
    }
  } catch (error) {
    console.error("Error saving cart id to storage", error)
  }
}

function clearStoredCartId() {
  setStoredCartId(null)
}

async function ensureCart() {
  const { data } = await httpCore.post("/cart")
  if (data?.id) {
    setStoredCartId(data.id)
  }
  return data
}

async function getCart(cartId = getStoredCartId()) {
  if (!cartId) return null
  const { data } = await httpCore.get(`/cart/${cartId}`)
  if (data?.id) {
    setStoredCartId(data.id)
  }
  return data
}

async function addItem({ cart_id, product_id, quantity }) {
  if (!product_id) {
    throw new Error("product_id es obligatorio")
  }
  let finalCartId = cart_id ?? getStoredCartId()
  if (!finalCartId) {
    const ensured = await ensureCart()
    finalCartId = ensured?.id
  }
  const payload = {
    cart_id: finalCartId,
    product_id,
    quantity
  }
  const { data } = await httpCore.post("/cart_item", payload)
  return data
}

async function updateQty({ cart_item_id, quantity }) {
  if (!cart_item_id) {
    throw new Error("cart_item_id es obligatorio")
  }
  const { data } = await httpCore.patch(`/cart_item/${cart_item_id}`, { quantity })
  return data
}

async function removeItem(cart_item_id) {
  if (!cart_item_id) {
    throw new Error("cart_item_id es obligatorio")
  }
  const { data } = await httpCore.delete(`/cart_item/${cart_item_id}`)
  return data
}

async function clearCart(cartId = getStoredCartId()) {
  const effectiveCartId = cartId ?? getStoredCartId()
  if (!effectiveCartId) return
  const cart = await getCart(effectiveCartId)
  if (!cart?.items?.length) return
  await Promise.all(
    cart.items.map((item) => {
      if (!item?.id) return Promise.resolve()
      return removeItem(item.id)
    })
  )
}

async function listProducts(params = {}) {
  const { data } = await httpCore.get("/product", { params })
  if (Array.isArray(data)) {
    return data
  }
  if (Array.isArray(data?.items)) {
    return data.items
  }
  return []
}

async function getProduct(id) {
  if (!id) {
    throw new Error("id de producto inválido")
  }
  const { data } = await httpCore.get(`/product/${id}`)
  return data
}

async function relatedProducts(id, n = 4) {
  if (!id) {
    return []
  }
  const { data } = await httpCore.get(`/product/${id}/related`, {
    params: { n }
  })
  if (Array.isArray(data)) {
    return data
  }
  if (Array.isArray(data?.items)) {
    return data.items
  }
  return []
}

export const ProductsApi = {
  list: listProducts,
  get: getProduct,
  relatedOf: relatedProducts
}

export const CartApi = {
  ensureCart,
  getCart,
  addItem,
  updateQty,
  removeItem,
  clearCart,
  getStoredCartId,
  setStoredCartId,
  clearStoredCartId
}

export { CART_KEY }
