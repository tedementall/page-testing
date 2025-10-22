import { useEffect, useRef } from "react"

// Recibe product {name, price, category, image, thumbnails[], description}
export default function ProductModal({ product }) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!modalRef.current) return
    // Crea la instancia del modal al montar
    const modalEl = modalRef.current
    const modal = new window.bootstrap.Modal(modalEl)
    if (product) modal.show()
    return () => { modal.hide() }
  }, [product])

  if (!product) return null

  return (
    <div className="modal fade show" tabIndex="-1" ref={modalRef} aria-modal="true" role="dialog">
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <section className="product-hero-modal">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-6">
                    <div className="product-image-container">
                      <img src={product.image} alt={product.name} className="img-fluid" />
                    </div>
                    <div className="thumbnail-gallery d-flex gap-2 mt-3 flex-wrap">
                      {product.thumbnails?.map((t, i) => (
                        <img key={i} src={t} alt={`thumb-${i}`} className="img-thumbnail" style={{width: 72, height: 72, objectFit: 'cover'}} />
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="product-info">
                      <div className="product-category">{product.category}</div>
                      <h1 className="product-title">{product.name}</h1>
                      <div className="product-price">{product.price}</div>
                      <p className="product-description">{product.description}</p>

                      <label htmlFor="product-qty" className="quantity-label">Cantidad</label>
                      <div className="input-group quantity-selector" style={{width: 120}}>
                        <button className="btn btn-outline-secondary" type="button">-</button>
                        <input type="text" className="form-control text-center" defaultValue="1" id="product-qty" readOnly />
                        <button className="btn btn-outline-secondary" type="button">+</button>
                      </div>

                      <button className="add-to-cart-btn mt-3" id="add-to-cart">
                        <i className="fas fa-shopping-cart"></i> Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="related-products-modal">
              <h3>Productos Relacionados</h3>
              <div className="row" id="relatedProductsContainer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
