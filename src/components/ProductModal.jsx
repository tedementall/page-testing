import { useEffect, useRef } from "react"

// Recibe product {name, price, category, image, thumbnails[], description, relatedProducts?}
export default function ProductModal({ product, onClose }) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!modalRef.current || typeof window === "undefined" || !window.bootstrap) return

    const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalRef.current)
    const handleHidden = () => {
      onClose?.()
    }

    modalRef.current.addEventListener("hidden.bs.modal", handleHidden)

    if (product) {
      modalInstance.show()
    } else {
      modalInstance.hide()
    }

    return () => {
      modalRef.current?.removeEventListener("hidden.bs.modal", handleHidden)
      modalInstance.hide()
    }
  }, [product, onClose])

  return (
    <div className="modal fade" id="productModal" tabIndex="-1" ref={modalRef} aria-hidden="true">
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          {product ? (
            <div className="modal-body">
              <section className="product-hero-modal">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="product-image-container">
                        <img src={product.image} alt={product.name} className="img-fluid" />
                      </div>
                      {product.thumbnails?.length ? (
                        <div className="thumbnail-gallery d-flex gap-2 mt-3 flex-wrap">
                          {product.thumbnails.map((thumbnail, index) => (
                            <img
                              key={thumbnail}
                              src={thumbnail}
                              alt={`${product.name} miniatura ${index + 1}`}
                              className="img-thumbnail"
                              style={{ width: 72, height: 72, objectFit: "cover" }}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="col-md-6">
                      <div className="product-info">
                        <div className="product-category">{product.category}</div>
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-price">{product.price}</div>
                        <p className="product-description">{product.description}</p>

                        <label htmlFor="product-qty" className="quantity-label">
                          Cantidad
                        </label>
                        <div className="input-group quantity-selector" style={{ width: 120 }}>
                          <button className="btn btn-outline-secondary" type="button">
                            -
                          </button>
                          <input
                            type="text"
                            className="form-control text-center"
                            defaultValue="1"
                            id="product-qty"
                            readOnly
                          />
                          <button className="btn btn-outline-secondary" type="button">
                            +
                          </button>
                        </div>

                        <button className="add-to-cart-btn mt-3" type="button">
                          <i className="fas fa-shopping-cart"></i> Añadir al carrito
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {product.relatedProducts?.length ? (
                <div className="related-products-modal">
                  <h3>Productos Relacionados</h3>
                  <div className="row g-3">
                    {product.relatedProducts.map((related) => (
                      <div key={related.id} className="col-12 col-md-4">
                        <div className="related-product-item h-100">
                          <img src={related.image} alt={related.name} className="img-fluid mb-2" />
                          <h6 className="mb-1">{related.name}</h6>
                          <span className="price">{related.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="modal-body py-5 text-center text-muted">
              Selecciona un producto para ver los detalles.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
