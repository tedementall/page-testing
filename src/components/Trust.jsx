const TRUST_FEATURES = [
  {
    title: "Envíos express",
    description: "Recibe tus productos favoritos en tiempo récord con seguimiento en vivo.",
    image: "/TheHub/images/Trust/ray.png"
  },
  {
    title: "Garantía total",
    description: "Cada accesorio está respaldado con 12 meses de garantía y soporte personalizado.",
    image: "/TheHub/images/Trust/archive.png"
  },
  {
    title: "Clientes felices",
    description: "Más de 5.000 valoraciones positivas avalan la experiencia The Hub.",
    image: "/TheHub/images/Trust/user.png"
  }
]

export default function Trust() {
  return (
    <section className="container__trust" id="confianza">
      <div className="container">
        <div className="row align-items-center mb-5">
          <div className="col-12 col-lg-6 text__trust">
            <p>GENERA CONFIANZA PRIMERO</p>
            <h1>Experiencias memorables desde el primer unboxing</h1>
          </div>
          <div className="col-12 col-lg-6">
            <p className="text__about">
              Diseñamos cada detalle para que te enamores de tus productos desde el primer vistazo.
            </p>
          </div>
        </div>
        <div className="row g-4">
          {TRUST_FEATURES.map((feature) => (
            <div key={feature.title} className="col-12 col-md-4">
              <div className="card__trust h-100 text-center">
                <img src={feature.image} alt={feature.title} className="img-fluid" />
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
