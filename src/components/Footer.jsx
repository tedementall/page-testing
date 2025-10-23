import React from 'react'; // ¡Asegúrate de tener React importado!

const FOOTER_LINKS = [
  {
    title: "Compañía",
    links: [
      { label: "Sobre nosotros", href: "#nosotros" },
      { label: "Equipo", href: "#equipo" },
      { label: "Trabaja con nosotros", href: "#" }
    ]
  },
  {
    title: "Soporte",
    links: [
      { label: "Centro de ayuda", href: "#" },
      { label: "Seguimiento de pedidos", href: "#" },
      { label: "Garantías", href: "#" }
    ]
  },
  {
    title: "Categorías",
    links: [
      { label: "Audio", href: "#productos" },
      { label: "Accesorios móviles", href: "#productos" },
      { label: "Smart Home", href: "#productos" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="site-footer" id="contacto">
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 col-lg-4 footer-column">
            <img src="/TheHub/images/ic_thehub_logo.png" alt="The Hub" className="footer-logo" />
            <p>
              Conectamos tu experiencia digital con productos cuidadosamente seleccionados y un
              servicio cercano. ¡Hablemos y creemos algo increíble juntos!
            </p>
            <div className="social-icons d-flex align-items-center">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.title} className="col-12 col-sm-6 col-lg-2 footer-column">
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* --- INICIO DEL BLOQUE REEMPLAZADO --- */}
          {/* Reemplazamos el formulario de "Únete a la comunidad" 
            por la información de contacto que querías.
          */}
          <div className="col-12 col-lg-4 footer-column">
            <h4>Contáctenos</h4>
            {/* Asumiendo que 'styles.css' ya tiene la clase '.contact-list' 
              para dar estilo a los iconos, como vimos en un paso anterior.
            */}
            <ul className="contact-list">
              <li>
                {/* Usamos los iconos de Font Awesome que ya tienes 
                  instalados (fas = solid) 
                */}
                <i className="fas fa-phone"></i>
                <a href="tel:+569XXXXXXXX">+56 9 XXXX XXXX</a>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:contacto@thehub.cl">contacto@thehub.cl</a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                {/* Hacemos que la dirección sea un enlace a Google Maps 
                  para que mantenga el estilo del resto de los enlaces.
                */}
                <a href="https://www.google.com/maps/place/Maip%C3%BA" target="_blank" rel="noreferrer">
                  Maipú, Santiago, Chile
                </a>
              </li>
            </ul>
          </div>
          {/* --- FIN DEL BLOQUE REEMPLAZADO --- */}

        </div>
        <div className="footer-bottom mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="mb-0">© {new Date().getFullYear()} The Hub. Todos los derechos reservados.</p>
          <div>
            <a href="#">Política de privacidad</a>
            <span className="mx-2">|</span>
            <a href="#">Términos de servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
}