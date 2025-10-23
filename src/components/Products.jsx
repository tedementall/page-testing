import { useEffect, useMemo, useState } from "react"
import ProductQuickView from "./ProductQuickView"
import { formatCurrency } from "../utils/currency"
import { ProductsApi } from "../api/coreApi"

export default function Products() {
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    ProductsApi.list({ limit: 12 })
      .then((fetched) => {
        if (cancelled) return
        setProducts(Array.isArray(fetched) ? fetched : [])
      })
      .catch((err) => {
        if (cancelled) return
        console.error("Error cargando productos", err)
        setError("No pudimos cargar los productos. Intenta nuevamente más tarde.")
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedProducts = useMemo(() => {
    return products.map((product) => {
      const images = Array.isArray(product.images)
        ? product.images.filter(Boolean)
        : product.image
          ? [product.image]
          : []
      const primaryImage = product.image ?? images[0] ?? ""
      return {
        ...product,
        images,
        image: primaryImage,
        price: typeof product.price === "number" ? product.price : Number(product.price) || 0
      }
    })
  }, [products])

  const openQuickView = (product) => {
    if (!product) {
      setQuickViewProduct(null)
      return
    }

    setQuickViewProduct(product)
  }

  const handleClose = () => {
    setQuickViewProduct(null)
  }

  return (
    <section className="container__product" id="productos">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-lg-6 text__product">
            <p>NUESTROS FAVORITOS</p>
            <h1>Accesorios que elevan tu experiencia digital</h1>
          </div>
          <div className="col-12 col-lg-6">
            <p className="text__about">
              Curamos colecciones limitadas de accesorios premium para dispositivos móviles, gamers y
              creadores. Haz clic en cualquiera para descubrir más detalles.
            </p>
          </div>
        </div>

        <div className="row mt-5 g-4">
          {error ? (
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            </div>
          ) : null}

          {isLoading && !normalizedProducts.length ? (
            <div className="col-12 text-center text-muted py-5">Cargando productos...</div>
          ) : null}

          {!isLoading && !normalizedProducts.length && !error ? (
            <div className="col-12 text-center text-muted py-5">No hay productos disponibles en este momento.</div>
          ) : null}

          {normalizedProducts.map((product) => (
            <div key={product.id} className="col-12 col-sm-6 col-lg-4">
              <div
                className="card__product"
                role="button"
                tabIndex={0}
                onClick={() => openQuickView(product)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") openQuickView(product)
                }}
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} className="img-fluid" />
                ) : (
                  <div className="ratio ratio-4x3 bg-light rounded-3"></div>
                )}
                <h2>{product.category}</h2>
                <p>{product.name}</p>
                <span className="price">{formatCurrency(product.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductQuickView product={quickViewProduct} onClose={handleClose} allProducts={normalizedProducts} />
    </section>
  )
}
