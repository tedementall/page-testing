export default function Hero() {
  return (
    <section className="container__cover" id="home">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-lg-6 text__cover">
            <h1>Conecta tu mundo.</h1>
            <p>
              Explora lo último en accesorios tech: cargadores ultrarrápidos, carcasas con
              estilo y gadgets que hacen tu día más fácil.
            </p>
            <a href="#productos" className="btn__text">
              Explorar Tienda
            </a>
          </div>
          <div className="col-12 col-lg-6 image__cover text-center">
            <img
              src="/TheHub/images/cover/hero-img.png"
              alt="Mockup de accesorios tecnológicos"
              className="img-fluid"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
