import { Link, useNavigate } from "react-router-dom"
import { useCallback } from "react"
import { useCart } from "../context/CartContext"
import { formatCurrency } from "../utils/currency"
import { motion } from "framer-motion"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.4
}

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, updateItemQuantity, removeItem, isMutating, isLoading } = useCart()

  const handleCheckout = () => {
    navigate("/checkout/payment");
  };

  const handleIncrement = useCallback((item) => {
    const current = Number(item.quantity ?? 0)
    const next = current + 1
    updateItemQuantity(item.id, next).catch((e) => console.error(e))
  }, [updateItemQuantity])

  const handleDecrement = useCallback((item) => {
    const current = Number(item.quantity ?? 0)
    if (current <= 1) {
      removeItem(item.id).catch((e) => console.error(e))
      return
    }
    const next = current - 1
    updateItemQuantity(item.id, next).catch((e) => console.error(e))
  }, [updateItemQuantity, removeItem])

  // CARRITO VACÍO
  if (!items.length) {
    return (
      <div className="cart-page-container">
        {/* Halos de fondo */}
        <div className="cart-halo cart-halo--1" />
        <div className="cart-halo cart-halo--2" />
        <div className="cart-halo cart-halo--3" />

        <motion.main 
          className="container cart-content-wrapper py-5 text-center"
          initial="initial" animate="in" exit="out"
          variants={pageVariants} transition={pageTransition}
        >
          <div className="cart-glass-panel d-inline-block p-5" style={{maxWidth: '600px'}}>
            <h1 className="mb-3 fw-bold display-5" style={{color: 'var(--color_text-secundary)'}}>Tu carrito está vacío</h1>
            <p className="text-muted mb-4 fs-5">
              {isLoading ? "Cargando tus productos..." : "Aún no has agregado nada. ¡Explora lo último en tecnología!"}
            </p>
            <Link to="/" className="btn-checkout-gradient text-decoration-none d-inline-block w-auto px-5">
              Explorar Tienda
            </Link>
          </div>
        </motion.main>
      </div>
    )
  }

  // CARRITO CON PRODUCTOS
  return (
    <div className="cart-page-container">
      {/* Halos de fondo */}
      <div className="cart-halo cart-halo--1" />
      <div className="cart-halo cart-halo--2" />
      
      <motion.main 
        className="container cart-content-wrapper"
        initial="initial" animate="in" exit="out"
        variants={pageVariants} transition={pageTransition}
      >
        <div className="d-flex align-items-center mb-4">
          <h1 className="fw-bold" style={{color: 'var(--color_text-secundary)'}}>Tu Carrito</h1>
          <span className="badge rounded-pill bg-light text-dark ms-3 fs-6 border">
            {items.length} items
          </span>
        </div>

        <div className="row g-5">
          {/* COLUMNA IZQUIERDA: LISTA DE ITEMS */}
          <div className="col-12 col-lg-8">
            <div className="cart-glass-panel">
              {items.map((item) => {
                const product = item.product ?? {}
                const image = product.image ?? (Array.isArray(product.images) ? product.images[0] : "/placeholder.png")
                const price = product.price ?? 0

                return (
                  <div key={item.id} className="cart-item-row row g-3">
                    
                    {/* Imagen */}
                    <div className="col-auto">
                      <div className="cart-img-box">
                        <img src={image} alt={product.name} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="col">
                      <div className="cart-item-info">
                        <div className="category">{product.category || "Producto"}</div>
                        <h3>{product.name}</h3>
                        <button 
                          className="btn btn-link p-0 text-danger text-decoration-none small"
                          onClick={() => removeItem(item.id)}
                          disabled={isMutating}
                        >
                          <i className="fas fa-trash-alt me-1"></i> Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Cantidad & Precio */}
                    <div className="col-auto d-flex flex-column flex-md-row align-items-center gap-4">
                      {/* Selector de Cantidad Estilizado */}
                      <div className="cart-qty-wrapper">
                        <button 
                          className="cart-qty-btn"
                          onClick={() => handleDecrement(item)}
                          disabled={isMutating}
                        >-</button>
                        
                        <input 
                          type="text" 
                          className="cart-qty-input" 
                          value={item.quantity} 
                          readOnly 
                        />
                        
                        <button 
                          className="cart-qty-btn"
                          onClick={() => handleIncrement(item)}
                          disabled={isMutating}
                        >+</button>
                      </div>

                      <div className="cart-price text-end" style={{minWidth: '100px'}}>
                        {formatCurrency(price * item.quantity)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN */}
          <div className="col-12 col-lg-4">
            <div className="cart-summary-card">
              <h3 className="h4 fw-bold mb-4">Resumen</h3>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Envío</span>
                <span className="text-success">Gratis</span>
              </div>
              <div className="summary-row">
                <span>Impuestos</span>
                <span>Incluidos</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span style={{color: 'var(--main_color-primary)'}}>{formatCurrency(totalPrice)}</span>
              </div>

              <button 
                className="btn-checkout-gradient"
                onClick={handleCheckout}
                disabled={isMutating || isLoading}
              >
                {isLoading ? "Procesando..." : "Finalizar Compra"}
              </button>

              <Link to="/" className="btn-continue-link">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  )
}