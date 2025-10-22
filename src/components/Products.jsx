import { useState } from "react"
import ProductQuickView from "./ProductQuickView"
import { PRODUCTS } from "../data/products"
import { useCart } from "../context/CartContext"
import { formatCurrency } from "../utils/currency"

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function getRelatedProducts(product) {
  if (!product) return []

  const sameCategory = shuffle(
    PRODUCTS.filter((item) => item.id !== product.id && item.category === product.category)
  )

  const fallback = shuffle(
    PRODUCTS.filter((item) => item.id !== product.id && item.category !== product.category)
  )

  const selection = [...sameCategory, ...fallback]
  return selection.slice(0, 4)
}

export default function Products() {
  const { addItem } = useCart()
  const [quickViewData, setQuickViewData] = useState(null)

  const openQuickView = (product) => {
    if (!product) {
      setQuickViewData(null)
      return
    }

    setQuickViewData({
      product,
      related: getRelatedProducts(product)
    })
  }

  const handleAddToCart = (product, quantity) => {
    addItem(product, quantity)
  }

  const handleClose = () => {
    setQuickViewData(null)
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
          {PRODUCTS.map((product) => (
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
                <img src={product.image} alt={product.name} className="img-fluid" />
                <h2>{product.category}</h2>
                <p>{product.name}</p>
                <span className="price">{formatCurrency(product.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductQuickView
        product={quickViewData?.product ?? null}
        relatedProducts={quickViewData?.related ?? []}
        onAddToCart={handleAddToCart}
        onClose={handleClose}
        onSelectProduct={openQuickView}
      />
    </section>
  )
}
