import { useState } from "react"
import ProductQuickView from "./ProductQuickView"
import { PRODUCTS } from "../data/products"
import { formatCurrency } from "../utils/currency"

export default function Products() {
  const [quickViewProduct, setQuickViewProduct] = useState(null)

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

      <ProductQuickView product={quickViewProduct} onClose={handleClose} allProducts={PRODUCTS} />
    </section>
  )
}
