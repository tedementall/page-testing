import { useEffect, useMemo, useRef, useState } from "react"
import { formatCurrency } from "../utils/currency"
import { useAdminFlag } from "../hooks/useAdminFlag"

export default function ProductQuickView({
  product,
  relatedProducts = [],
  onAddToCart,
  onClose,
  onSelectProduct
}) {
  const modalRef = useRef(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(product?.image ?? "")
  const isAdmin = useAdminFlag()

  useEffect(() => {
    if (!modalRef.current || typeof window === "undefined" || !window.bootstrap) return

    const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalRef.current)
    const handleHidden = () => {
      onClose?.()
      setQuantity(1)
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

  useEffect(() => {
    if (product) {
      setQuantity(1)
      setSelectedImage(product.image)
    }
  }, [product])

  const galleryImages = useMemo(() => {
    if (!product) return []
    const images = [product.image, ...(product.thumbnails ?? [])].filter(Boolean)
    return Array.from(new Set(images))
  }, [product])

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleAddToCart = () => {
    if (!product) return
    onAddToCart?.(product, quantity)
  }

  const handleSelectRelated = (related) => {
    if (!related) return
    onSelectProduct?.(related)
  }

  return (
    <div className="modal fade" id="productQuickView" tabIndex="-1" ref={modalRef} aria-hidden="true">
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          {product ? (
            <div className="modal-body">
              <section className="product-hero-modal">
                <div className="container-fluid">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="product-image-container mb-3">
                        <img src={selectedImage || product.image} alt={product.name} className="img-fluid" />
                      </div>
                      {galleryImages.length > 1 ? (
                        <div className="thumbnail-gallery d-flex gap-2 mt-3 flex-wrap">
                          {galleryImages.map((imageSrc, index) => (
                            <button
                              key={imageSrc}
                              type="button"
                              className="p-0 border-0 bg-transparent"
                              onClick={() => setSelectedImage(imageSrc)}
                              aria-label={`${product.name} miniatura ${index + 1}`}
                            >
                              <img
                                src={imageSrc}
                                alt={`${product.name} miniatura ${index + 1}`}
                                className={`img-thumbnail ${
                                  selectedImage === imageSrc ? "border-primary" : ""
                                }`}
                                style={{ width: 72, height: 72, objectFit: "cover" }}
                              />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="col-md-6">
                      <div className="product-info">
                        <div className="product-category">{product.category}</div>
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-price">{formatCurrency(product.price)}</div>
                        <p className="product-description">{product.description}</p>

                        {isAdmin ? (
                          <div id="admin-controls" className="gap-2 mt-3">
                            <button type="button" className="btn btn-outline-secondary btn-sm">
                              Editar producto
                            </button>
                            <button type="button" className="btn btn-outline-danger btn-sm">
                              Despublicar
                            </button>
                          </div>
                        ) : null}

                        <label htmlFor="product-qty" className="quantity-label mt-4">
                          Cantidad
                        </label>
                        <div className="input-group quantity-selector" style={{ width: 140 }}>
                          <button className="btn btn-outline-secondary" type="button" onClick={handleDecrease}>
                            -
                          </button>
                          <input
                            type="text"
                            className="form-control text-center"
                            value={quantity}
                            id="product-qty"
                            readOnly
                            aria-label="Cantidad"
                          />
                          <button className="btn btn-outline-secondary" type="button" onClick={handleIncrease}>
                            +
                          </button>
                        </div>

                        <button className="add-to-cart-btn mt-3" type="button" onClick={handleAddToCart}>
                          <i className="fas fa-shopping-cart"></i> Añadir al carrito
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {relatedProducts.length ? (
                <div className="related-products-modal">
                  <h3>Productos Relacionados</h3>
                  <div className="row g-3">
                    {relatedProducts.map((related) => (
                      <div key={related.id} className="col-12 col-sm-6 col-lg-3">
                        <button
                          type="button"
                          className="related-product-item h-100 w-100"
                          onClick={() => handleSelectRelated(related)}
                        >
                          <img src={related.image} alt={related.name} className="img-fluid mb-2" />
                          <h6 className="mb-1">{related.name}</h6>
                          <span className="price">{formatCurrency(related.price)}</span>
                        </button>
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
