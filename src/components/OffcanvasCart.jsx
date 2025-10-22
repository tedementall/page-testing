const CART_ITEMS = [
  {
    name: "Cargador inalámbrico MagCharge X",
    price: "$39.990",
    image: "/TheHub/images/Product/work1.png"
  },
  {
    name: "Auriculares PulseBeat Pro",
    price: "$74.990",
    image: "/TheHub/images/Product/work2.png"
  }
]

export default function OffcanvasCart() {
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
          {CART_ITEMS.map((item) => (
            <div key={item.name} className="offcanvas-cart-item">
              <img src={item.image} alt={item.name} />
              <div className="offcanvas-cart-item-details">
                <h6>{item.name}</h6>
                <div className="price">{item.price}</div>
                <div className="offcanvas-cart-item-actions">
                  <div className="quantity-selector">
                    <button className="quantity-btn" type="button" aria-label="Disminuir cantidad">
                      -
                    </button>
                    <input className="quantity-input" type="text" readOnly value="1" aria-label="Cantidad" />
                    <button className="quantity-btn" type="button" aria-label="Aumentar cantidad">
                      +
                    </button>
                  </div>
                  <a className="remove-btn" href="#" onClick={(event) => event.preventDefault()}>
                    Quitar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-semibold">Total estimado</span>
            <span className="fw-bold text-primary">$114.980</span>
          </div>
          <button className="btn__text w-100" type="button">
            Finalizar compra
          </button>
        </div>
      </div>
    </div>
  )
}
