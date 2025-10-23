import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { formatCurrency } from "../utils/currency"
import { useCart } from "../context/CartContext"
import { ProductsApi } from "../api/coreApi"

function pickRelated(all, current, n = 4) {
  const collection = Array.isArray(all) ? all : []
  const filtered = collection.filter((item) => item && item.id && item.id !== current?.id)
  const sameCategory = filtered.filter((item) => item.category && item.category === current?.category)
  const base = sameCategory.length >= n ? sameCategory : filtered
  return base.sort(() => Math.random() - 0.5).slice(0, n)
}

function buildGallery(product) {
  if (!product) return []
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : product.image
      ? [product.image]
      : []
  const gallery = product.image ? [product.image, ...images] : images
  return gallery.filter(Boolean).filter((image, index, array) => array.indexOf(image) === index)
}

export default function ProductQuickView({ product, onClose, allProducts = [] }) {
  const modalRef = useRef(null)
  const addFeedbackTimeoutRef = useRef(null)
  const { addItem } = useCart()

  const [activeProduct, setActiveProduct] = useState(product ?? null)
  const [selectedImage, setSelectedImage] = useState(product?.image ?? "")
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isRelatedLoading, setIsRelatedLoading] = useState(false)

  const supportsBootstrap = typeof window !== "undefined" && Boolean(window.bootstrap)

  const clearFeedbackTimeout = useCallback(() => {
    if (addFeedbackTimeoutRef.current) {
      clearTimeout(addFeedbackTimeoutRef.current)
      addFeedbackTimeoutRef.current = null
    }
  }, [])

  const resetView = useCallback(() => {
    setQuantity(1)
    setSelectedImage("")
    setIsAdding(false)
    setIsWorking(false)
    clearFeedbackTimeout()
  }, [clearFeedbackTimeout])

  const closeAndNotify = useCallback(() => {
    setActiveProduct(null)
    resetView()
    onClose?.()
  }, [onClose, resetView])

  useEffect(() => {
    setActiveProduct(product ?? null)
  }, [product])

  useEffect(() => {
    if (!modalRef.current || !supportsBootstrap) {
      return undefined
    }

    const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalRef.current, {
      backdrop: true
    })

    const handleHidden = () => {
      closeAndNotify()
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
  }, [product, supportsBootstrap, closeAndNotify])

  useEffect(() => () => clearFeedbackTimeout(), [clearFeedbackTimeout])

  useEffect(() => {
    if (!activeProduct) {
      resetView()
      return
    }

    const images = buildGallery(activeProduct)

    resetView()
    setSelectedImage(images[0] ?? "")
  }, [activeProduct, resetView])

  const manualActive = Boolean(activeProduct) && !supportsBootstrap

  useEffect(() => {
    if (!manualActive || typeof document === "undefined") return undefined

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeAndNotify()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [manualActive, closeAndNotify])

  useEffect(() => {
    if (typeof document === "undefined") return undefined
    const { body } = document
    if (manualActive) {
      const previousOverflow = body.style.overflow
      body.classList.add("modal-open")
      body.style.overflow = "hidden"
      return () => {
        body.classList.remove("modal-open")
        body.style.overflow = previousOverflow
      }
    }

    body.classList.remove("modal-open")
    body.style.overflow = ""
    return undefined
  }, [manualActive])

  const galleryImages = useMemo(() => buildGallery(activeProduct), [activeProduct])

  useEffect(() => {
    if (!activeProduct?.id) {
      setRelatedProducts([])
      return
    }

    let cancelled = false
    setIsRelatedLoading(true)

    ProductsApi.relatedOf(activeProduct.id, 4)
      .then((related) => {
        if (cancelled) return
        const candidates = Array.isArray(related) && related.length ? related : pickRelated(allProducts, activeProduct)
        setRelatedProducts(candidates)
      })
      .catch((error) => {
        if (cancelled) return
        console.error("Error obteniendo productos relacionados", error)
        setRelatedProducts(pickRelated(allProducts, activeProduct))
      })
      .finally(() => {
        if (!cancelled) {
          setIsRelatedLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeProduct, allProducts])

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleAddToCart = async () => {
    if (!activeProduct) return

    setIsWorking(true)
    try {
      await addItem(activeProduct, quantity)
      setIsAdding(true)

      if (typeof window !== "undefined" && window.bootstrap) {
        const offcanvasElement = document.getElementById("cartOffcanvas")
        if (offcanvasElement) {
          const offcanvasInstance =
            window.bootstrap.Offcanvas.getInstance(offcanvasElement) ||
            new window.bootstrap.Offcanvas(offcanvasElement)
          offcanvasInstance?.show()
        }
      }

      clearFeedbackTimeout()

      addFeedbackTimeoutRef.current = setTimeout(() => {
        if (supportsBootstrap && modalRef.current && typeof window !== "undefined" && window.bootstrap) {
          const modalInstance = window.bootstrap.Modal.getInstance(modalRef.current)
          modalInstance?.hide()
        } else {
          closeAndNotify()
        }
      }, 900)
    } catch (error) {
      console.error("No se pudo añadir al carrito", error)
      setIsAdding(false)
    } finally {
      setIsWorking(false)
    }
  }

  const handleSelectRelated = (related) => {
    if (!related) return
    setActiveProduct(related)
  }

  const handleBackdropClick = useCallback(
    (event) => {
      if (!supportsBootstrap && event.target === event.currentTarget) {
        closeAndNotify()
      }
    },
    [supportsBootstrap, closeAndNotify]
  )

  const handleDialogClick = useCallback(
    (event) => {
      if (!supportsBootstrap) {
        event.stopPropagation()
      }
    },
    [supportsBootstrap]
  )

  const shouldShow = Boolean(activeProduct)
  const modalClasses = `modal fade${manualActive ? " show manual-open" : ""}`
  const modalStyle = manualActive ? { display: "block" } : undefined

  return (
    <>
      <div
        className={modalClasses}
        id="productQuickView"
        tabIndex="-1"
        aria-hidden={!shouldShow}
        aria-labelledby="productQuickViewLabel"
        ref={modalRef}
        style={modalStyle}
        onClick={manualActive ? handleBackdropClick : undefined}
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered"
          onClick={manualActive ? handleDialogClick : undefined}
        >
          <div className="modal-content product-quick-view">
            <div className="modal-header border-0 pb-0">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss={supportsBootstrap ? "modal" : undefined}
                aria-label="Cerrar"
                onClick={supportsBootstrap ? undefined : closeAndNotify}
              ></button>
            </div>
            {activeProduct ? (
              <div className="modal-body pt-0">
                <section className="product-hero-modal">
                  <div className="container-fluid">
                    <div className="row g-4 align-items-start">
                      <div className="col-lg-6">
                        <div className="product-image-container mb-3">
                          <img
                            src={selectedImage || activeProduct.image}
                            alt={activeProduct.name}
                            className="img-fluid"
                          />
                        </div>
                        {galleryImages.length > 1 ? (
                          <div className="thumbnail-gallery flex-wrap">
                            {galleryImages.map((imageSrc, index) => (
                              <button
                                key={imageSrc}
                                type="button"
                                className={`thumbnail-item ${selectedImage === imageSrc ? "active" : ""}`}
                                onClick={() => setSelectedImage(imageSrc)}
                                aria-label={`${activeProduct.name} miniatura ${index + 1}`}
                              >
                                <img src={imageSrc} alt={`${activeProduct.name} miniatura ${index + 1}`} />
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="col-lg-6">
                        <div className="product-info">
                          <div className="product-category">{activeProduct.category}</div>
                          <h1 className="product-title" id="productQuickViewLabel">
                            {activeProduct.name}
                          </h1>
                          <div className="product-price">{formatCurrency(activeProduct.price)}</div>
                          <p className="product-description">{activeProduct.description}</p>

                          <div className="quantity-wrapper mt-4">
                            <span className="quantity-label d-block mb-2">Cantidad</span>
                            <div className="input-group quantity-selector">
                              <button className="btn btn-outline-secondary" type="button" onClick={handleDecrease}>
                                -
                              </button>
                              <input
                                type="text"
                                className="form-control text-center"
                                value={quantity}
                                readOnly
                                aria-label="Cantidad"
                              />
                              <button className="btn btn-outline-secondary" type="button" onClick={handleIncrease}>
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            className={`add-to-cart-btn mt-3 ${isAdding ? "is-added" : ""}`}
                            type="button"
                            onClick={handleAddToCart}
                            disabled={isWorking}
                          >
                            {isAdding ? (
                              <>
                                <i className="fas fa-check" aria-hidden="true"></i>
                                <span className="ms-2">Añadido</span>
                              </>
                            ) : isWorking ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="ms-2">Añadiendo...</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-shopping-cart" aria-hidden="true"></i>
                                <span className="ms-2">Añadir al carrito</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {relatedProducts.length ? (
                  <div className="related-products-modal">
                    <h3>Productos relacionados</h3>
                    {isRelatedLoading ? (
                      <div className="text-muted mb-3">Buscando recomendaciones...</div>
                    ) : null}
                    <div className="row g-3">
                      {relatedProducts.map((related) => (
                        <div key={related.id} className="col-12 col-sm-6 col-lg-3">
                          <button
                            type="button"
                            className="related-card w-100 h-100"
                            onClick={() => handleSelectRelated(related)}
                          >
                            <div className="related-card-image">
                              <img
                                src={related.image ?? (Array.isArray(related.images) ? related.images[0] : "")}
                                alt={related.name}
                                className="img-fluid"
                              />
                            </div>
                            <div className="related-card-body">
                              <h6 className="mb-1">{related.name}</h6>
                              {typeof related.price !== "undefined" ? (
                                <span className="price">{formatCurrency(related.price)}</span>
                              ) : null}
                            </div>
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
      {manualActive ? <div className="modal-backdrop fade show manual-open-backdrop"></div> : null}
    </>
  )
}

export { pickRelated }
