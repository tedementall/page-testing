import { Link } from "react-router-dom"
import { useCallback } from "react"
import { useCart } from "../context/CartContext"
import { formatCurrency } from "../utils/currency"
// 1. Importamos 'motion' de framer-motion
import { motion } from "framer-motion"

// 2. Definimos las variantes de animación (las mismas que en Login.jsx y Home.jsx)
const pageVariants = {
  initial: {
    opacity: 0,
    x: "-50vw" // Inicia deslizando desde la izquierda
  },
  in: {
    opacity: 1,
    x: 0 // Termina en el centro
  },
  out: {
    opacity: 0,
    x: "50vw" // Se va deslizando hacia la derecha
  }
}

// 3. Definimos el tipo de transición (la misma que en Login.jsx y Home.jsx)
const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4 // Duración de la animación en segundos
}


export default function CartPage() {
  const { items, totalPrice, incrementItem, decrementItem, removeItem, isMutating, isLoading } = useCart()

  const handleIncrement = useCallback(
    (itemId) => {
      incrementItem(itemId).catch((error) => {
        console.error("No se pudo aumentar la cantidad", error)
      })
    },
    [incrementItem]
  )

  const handleDecrement = useCallback(
    (itemId) => {
      decrementItem(itemId).catch((error) => {
        console.error("No se pudo disminuir la cantidad", error)
      })
    },
    [decrementItem]
  )

  const handleRemove = useCallback(
    (itemId) => {
      removeItem(itemId).catch((error) => {
        console.error("No se pudo quitar el producto", error)
      })
    },
    [removeItem]
  )

  // --- PRIMER RETURN (Carrito Vacío) ---
  if (!items.length) {
    return (
      // 4. Aplicamos 'motion.main' aquí
      <motion.main 
        className="main-content-padding"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="container py-5 text-center">
          <h1 className="mb-3">Tu carrito</h1>
          <p className="text-muted mb-4">
            {isLoading ? "Estamos cargando tu carrito..." : "Todavía no has agregado productos a tu carrito."}
          </p>
          <Link to="/" className="btn__text">
            Seguir descubriendo productos
          </Link>
        </div>
      </motion.main>
    )
  }

  // --- SEGUNDO RETURN (Carrito Lleno) ---
  return (
    // 5. Aplicamos 'motion.main' aquí también
    <motion.main 
      className="main-content-padding"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="container py-5">
        <h1 className="mb-4">Tu carrito</h1>
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  {/* ... (tu thead) ... */}
                </thead>
                <tbody>
                  {items.map((item) => {
                    const product = item.product ?? {}
                    const image = product.image ?? (Array.isArray(product.images) ? product.images[0] : "")
                    const price = product.price ?? 0
                    return (
                      <tr key={item.id}>
                        {/* ... (tu <td> de producto) ... */}
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name ?? "Producto"}
                                width={72}
                                height={72}
                                className="rounded-3"
                                style={{ objectFit: "cover" }}
                              />
                            ) : null}
                            <div>
                              <div className="fw-semibold">{product.name}</div>
                              <div className="text-muted small">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{formatCurrency(price)}</td>
                        {/* ... (tu <td> de cantidad) ... */}
                        <td className="text-center">
                          <div className="input-group input-group-sm quantity-selector mx-auto" style={{ maxWidth: 140 }}>
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => handleDecrement(item.id)}
                              disabled={isMutating}
                            >
                              -
                            </button>
                            <input
                              className="form-control text-center"
                              type="text"
                              value={item.quantity}
                              readOnly
                              aria-label={`Cantidad para ${product.name ?? "producto"}`}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => handleIncrement(item.id)}
                              disabled={isMutating}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-end">{formatCurrency(price * item.quantity)}</td>
                        {/* ... (tu <td> de eliminar) ... */}
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0"
                            onClick={() => handleRemove(item.id)}
                            disabled={isMutating}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* ... (tu columna de Resumen del carrito) ... */}
          <div className="col-12 col-lg-4">
            <div className="p-4 rounded-4 shadow-sm h-100 bg-white">
              <h2 className="h5 mb-3">Resumen del carrito</h2>
              <div className="d-flex justify-content-between mb-4">
                <span>Total</span>
                <span className="fw-bold text-primary">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="d-grid gap-2">
                <Link to="/" className="btn btn-outline-secondary">
                  Seguir comprando
                </Link>
                <button type="button" className="btn__text" disabled={isMutating || isLoading}>
                  Finalizar compra
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  )
}