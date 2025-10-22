import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { formatCurrency } from "../utils/currency"

export default function OffcanvasCart() {
  const navigate = useNavigate()
  const { items, totalItems, totalPrice, incrementItem, decrementItem, removeItem } = useCart()

  const handleGoToCart = useCallback(() => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const offcanvasElement = document.getElementById("cartOffcanvas")
      const instance = offcanvasElement
        ? window.bootstrap.Offcanvas.getInstance(offcanvasElement) ||
          new window.bootstrap.Offcanvas(offcanvasElement)
        : null
      instance?.hide()
    }
    navigate("/cart")
  }, [navigate])

  const handleCheckout = () => {}

  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="cartOffcanvas"
      aria-labelledby="cartOffcanvasLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="cartOffcanvasLabel">
          Tu carrito
        </h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
      </div>
      <div className="offcanvas-body d-flex flex-column">
        <div className="mb-4">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="offcanvas-cart-item">
                <img src={item.image} alt={item.name} />
                <div className="offcanvas-cart-item-details">
                  <h6>{item.name}</h6>
                  <div className="price">{formatCurrency(item.price)}</div>
                  <div className="offcanvas-cart-item-actions">
                    <div className="quantity-selector">
                      <button
                        className="quantity-btn"
                        type="button"
                        aria-label="Disminuir cantidad"
                        onClick={() => decrementItem(item.id)}
                      >
                        -
                      </button>
                      <input
                        className="quantity-input"
                        type="text"
                        readOnly
                        value={item.quantity}
                        aria-label="Cantidad"
                      />
                      <button
                        className="quantity-btn"
                        type="button"
                        aria-label="Aumentar cantidad"
                        onClick={() => incrementItem(item.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn bg-transparent border-0 p-0"
                      type="button"
                      onClick={() => removeItem(item.id)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-5">
              Tu carrito está vacío. ¡Descubre nuestros productos!
            </div>
          )}
        </div>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-semibold">Total ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})</span>
            <span className="fw-bold text-primary">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="d-grid gap-2">
            <button className="btn btn-outline-secondary" type="button" onClick={handleGoToCart}>
              Ir al carro
            </button>
            <button className="btn__text" type="button" onClick={handleCheckout} disabled={!items.length}>
              Iniciar pago
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
