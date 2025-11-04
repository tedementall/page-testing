// src/components/Hero.jsx
export default function Hero() {
  return (
    <section className="container__cover">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="text__cover">
              <h1>Conecta tu mundo.</h1>
              <p>
                Explora lo último en accesorios tech: cargadores ultrarrápidos,
                carcasas con estilo y gadgets que hacen tu día más fácil.
              </p>
              <a href="#productos" className="btn__text">
                Explorar Tienda
              </a>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="image__cover">
              {/* Halo/Glow con efecto parallax */}
              <div className="hero-glow"></div>

              {/* 👇 AQUÍ está tu imagen con la ruta correcta */}
              <img
                src="/TheHub/images/cover/hero-img.png"
                alt="Smartphone con accesorios tech"
                className="hero-phone"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}