import { useState } from "react"

const NAV_LINKS = [
  { label: "Inicio", href: "#home" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Productos", href: "#productos" },
  { label: "Equipo", href: "#equipo" },
  { label: "Contacto", href: "#contacto" }
]

const SOCIAL_LINKS = [
  { icon: "fab fa-facebook-f", href: "https://www.facebook.com", label: "Facebook" },
  { icon: "fab fa-instagram", href: "https://www.instagram.com", label: "Instagram" },
  { icon: "fab fa-twitter", href: "https://twitter.com", label: "Twitter" },
  { icon: "fab fa-tiktok", href: "https://www.tiktok.com", label: "TikTok" }
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="container py-3">
        <div className="header__layout d-flex align-items-center justify-content-between gap-3 flex-wrap flex-lg-nowrap">
          <div className="d-flex align-items-center gap-3 flex-shrink-0">
    <header>
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
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

          <div className={`menu header__menu flex-grow-1 ${menuOpen ? "d-block" : "d-none d-lg-block"}`}>
            <nav>
              <ul className="nav flex-column flex-lg-row justify-content-center align-items-center mb-0 gap-2 gap-lg-4">
          <div className={`menu flex-grow-1 ${menuOpen ? "d-block" : "d-none d-lg-block"}`}>
            <nav>
              <ul className="nav justify-content-center align-items-center mb-0 gap-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.label} className="nav-item" onClick={closeMenu}>
                    <a href={link.href} className="nav-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="header__actions d-flex align-items-center gap-3 flex-wrap flex-lg-nowrap justify-content-center justify-content-lg-end ms-lg-3">
          <div className="d-flex align-items-center gap-3 ms-lg-3">
            <a href="#productos" className="btn__search d-none d-sm-inline-block">
              Explorar
            </a>
            <div className="SocialMedia d-none d-md-flex align-items-center">
              {SOCIAL_LINKS.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                  <i className={link.icon}></i>
                </a>
              ))}
            </div>
            <button
              className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#cartOffcanvas"
              aria-controls="cartOffcanvas"
              onClick={closeMenu}
            >
              <i className="fas fa-shopping-cart"></i>
              <span className="d-none d-lg-inline">Carrito</span>
            </button>
            <a href="#contacto" className="btn__text">
              Acceder
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
