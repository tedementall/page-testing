export default function About() {
  return (
    <section className="container__about" id="nosotros">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-lg-6 text__about mb-5 mb-lg-0">
            <h1>Apasionados por la tecnología, como tú</h1>
            <p>
              Estábamos cansados de cargadores que duran un suspiro y carcasas sin estilo. Por eso
              nació The Hub: un espacio que combina diseño, innovación y accesorios que realmente
              resisten tu ritmo.
            </p>
            <a href="#productos" className="btn__text">
              Saber más
            </a>
          </div>
          <div className="col-12 col-lg-6 image__about">
            <div className="row g-3">
              <div className="col-6">
                <img
                  src="/TheHub/images/about/about-1.png"
                  alt="Auriculares inalámbricos"
                  className="img-fluid"
                />
              </div>
              <div className="col-6">
                <img
                  src="/TheHub/images/about/about-2.png"
                  alt="Cargadores y gadgets"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
