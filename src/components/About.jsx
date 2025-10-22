export default function About() {
  return (
    <div className="container__about" id="nosotros">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-lg-6 text__about mb-5 mb-lg-0">
            <h1>Apasionados por la Tecnología, como Tú</h1>
            <p>Estábamos cansados de cargadores que duran un suspiro y carcasas sin estilo...</p>
            <a href="#" className="btn__text">Saber más</a>
          </div>
          <div className="col-12 col-lg-6 image__about">
            <div className="row">
              <div className="col-6">
                <img src="/images/about/about-1.png" alt="Producto about 1" className="img-fluid" />
              </div>
              <div className="col-6">
                <img src="/images/about/about-2.png" alt="Producto about 2" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
