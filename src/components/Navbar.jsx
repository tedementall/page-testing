import { useState } from "react";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
  { label: "Inicio", href: "#home" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Productos", href: "#productos" },
  { label: "Equipo", href: "#equipo" },
  { label: "Contacto", href: "#contacto" },
];

const SOCIAL_LINKS = [
  { icon: "fab fa-facebook-f", href: "https://www.facebook.com", label: "Facebook" },
  { icon: "fab fa-instagram", href: "https://www.instagram.com", label: "Instagram" },
  { icon: "fab fa-twitter", href: "https://twitter.com", label: "Twitter" },
  { icon: "fab fa-tiktok", href: "https://www.tiktok.com", label: "TikTok" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const toggleMenu = () => setMenuOpen((p) => !p);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        {/* GRID: [ logo | center menu | right actions ] */}
        <div className="nav-grid">
          {/* Col 1: Burger + Logo */}
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary d-lg-none"
              type="button"
              onClick={toggleMenu}
              aria-label="Abrir menú de navegación"
              aria-expanded={menuOpen}
            >
              <i className="fas fa-bars"></i>
            </button>

            <a href="#home" className="logo d-flex align-items-center" onClick={closeMenu}>
              <img src="/TheHub/images/Header-logo.png" alt="The Hub" className="img-fluid" />
            </a>
          </div>

          {/* Col 2: Menú central */}
          <div className={`menu-center ${menuOpen ? "d-block" : "d-none d-lg-block"}`}>
            <nav aria-label="Navegación principal">
              <ul className="nav mb-0 justify-content-center gap-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.label} className="nav-item" onClick={closeMenu}>
                    <a href={link.href} className="nav-link">{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Col 3: Acciones derecha */}
          <div className="d-flex align-items-center justify-content-end gap-3 actions-right">
            <a href="#productos" className="btn__search d-none d-sm-inline-block">Explorar</a>

            <div className="SocialMedia d-none d-md-flex align-items-center">
              {SOCIAL_LINKS.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                  <i className={link.icon}></i>
                </a>
              ))}
            </div>

            <button
              className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2 position-relative"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#cartOffcanvas"
              aria-controls="cartOffcanvas"
              onClick={closeMenu}
            >
              <i className="fas fa-shopping-cart"></i>
              <span className="d-none d-lg-inline">Carrito</span>
              {totalItems > 0 ? (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge">
                  {totalItems}
                </span>
              ) : null}
            </button>

            <a href="#contacto" className="btn__text">Acceder</a>
          </div>
        </div>
      </div>
    </header>
  );
}
