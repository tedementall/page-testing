import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { formatCurrency } from "../utils/currency"

export default function CartPage() {
  const { items, totalPrice, incrementItem, decrementItem, removeItem } = useCart()

  if (!items.length) {
    return (
      <main className="main-content-padding">
        <div className="container py-5 text-center">
          <h1 className="mb-3">Tu carrito</h1>
          <p className="text-muted mb-4">Todavía no has agregado productos a tu carrito.</p>
          <Link to="/" className="btn__text">
            Seguir descubriendo productos
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content-padding">
      <div className="container py-5">
        <h1 className="mb-4">Tu carrito</h1>
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col" className="text-center">
                      Precio
                    </th>
                    <th scope="col" className="text-center">
                      Cantidad
                    </th>
                    <th scope="col" className="text-end">
                      Total
                    </th>
                    <th scope="col" className="text-end" aria-label="Acciones"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            width={72}
                            height={72}
                            className="rounded-3"
                            style={{ objectFit: "cover" }}
                          />
                          <div>
                            <div className="fw-semibold">{item.name}</div>
                            <div className="text-muted small">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">{formatCurrency(item.price)}</td>
                      <td className="text-center">
                        <div className="input-group input-group-sm quantity-selector mx-auto" style={{ maxWidth: 140 }}>
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => decrementItem(item.id)}
                          >
                            -
                          </button>
                          <input
                            className="form-control text-center"
                            type="text"
                            value={item.quantity}
                            readOnly
                            aria-label={`Cantidad para ${item.name}`}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => incrementItem(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-link text-danger p-0"
                          onClick={() => removeItem(item.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                <button type="button" className="btn__text">
                  Finalizar compra
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
