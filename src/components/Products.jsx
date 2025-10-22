import { useMemo, useState } from "react"
import ProductModal from "./ProductModal"

const PRODUCTS = [
  {
    id: 1,
    name: "Cargador inalámbrico MagCharge X",
    category: "Cargadores",
    price: "$39.990",
    description:
      "La carga rápida y segura que tu smartphone necesita. Compatible con MagSafe y Android.",
    image: "/TheHub/images/Product/work1.png",
    thumbnails: [
      "/TheHub/images/Product/work1_2.png",
      "/TheHub/images/Product/work1_3.png",
      "/TheHub/images/Product/work1_4.png"
    ]
  },
  {
    id: 2,
    name: "Auriculares PulseBeat Pro",
    category: "Audio",
    price: "$74.990",
    description:
      "Cancelación de ruido activa, autonomía de 48 horas y estuche de carga inalámbrica.",
    image: "/TheHub/images/Product/work2.png",
    thumbnails: [
      "/TheHub/images/Product/work2_2.png",
      "/TheHub/images/Product/work2_3.png"
    ]
  },
  {
    id: 3,
    name: "Case Lumina Shield",
    category: "Carcasas",
    price: "$24.990",
    description:
      "Protección militar con acabados perlados que hacen brillar tu smartphone en cualquier evento.",
    image: "/TheHub/images/Product/work3.png",
    thumbnails: [
      "/TheHub/images/Product/work3_2.png",
      "/TheHub/images/Product/work3_3.png"
    ]
  },
  {
    id: 4,
    name: "Teclado SmartType Mini",
    category: "Oficina",
    price: "$54.990",
    description:
      "Diseño compacto, conectividad multidispositivo y retroiluminación inteligente en tonos neon.",
    image: "/TheHub/images/Product/work4.png",
    thumbnails: [
      "/TheHub/images/Product/work4_2.png",
      "/TheHub/images/Product/work4_3.png"
    ]
  },
  {
    id: 5,
    name: "Parlante Orbital Sound 360",
    category: "Audio",
    price: "$89.990",
    description:
      "Sonido envolvente 360°, resistencia al agua IPX7 y 24 horas de música sin interrupciones.",
    image: "/TheHub/images/Product/work5.png",
    thumbnails: [
      "/TheHub/images/Product/work5_2.png",
      "/TheHub/images/Product/work5_3.png"
    ]
  },
  {
    id: 6,
    name: "Mouse AeroGlide RGB",
    category: "Gaming",
    price: "$34.990",
    description:
      "Sensor óptico de 26K DPI, switches ópticos y 16 millones de colores personalizables.",
    image: "/TheHub/images/Product/work6.png",
    thumbnails: [
      "/TheHub/images/Product/work6_2.png",
      "/TheHub/images/Product/work6_3.png"
    ]
  }
]

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return []
    return PRODUCTS.filter((product) => product.id !== selectedProduct.id).slice(0, 3)
  }, [selectedProduct])

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
                onClick={() => setSelectedProduct(product)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setSelectedProduct(product)
                }}
              >
                <img src={product.image} alt={product.name} className="img-fluid" />
                <h2>{product.category}</h2>
                <p>{product.name}</p>
                <span className="price">{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductModal
        product={selectedProduct ? { ...selectedProduct, relatedProducts } : null}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  )
}
