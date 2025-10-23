import { useCallback, useState } from "react";
// --- CAMBIO 1: Importamos Link (que ya tenías) y HashLink ---
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// --- CAMBIO 2: Añadimos una barra "/" a las rutas (href) ---
// Esto le dice a HashLink que primero vaya a la página de inicio (/)
// y LUEGO busque la sección (#nosotros).
const NAV_LINKS = [
  { label: "Inicio", href: "/#home" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Productos", href: "/#productos" },
  { label: "Equipo", href: "/#equipo" },
  { label: "Contacto", href: "/#contacto" },
];

const SOCIAL_LINKS = [
  { icon: "fab fa-facebook-f", href: "https://www.facebook.com/people/Victor-Ramos/pfbid037vnDNaLUbNNt1xRC9aFdb76bMrhEkr3sp7iTp8C74V4x6RPozECXNxgFrDuezqi4l/", label: "Facebook" },
  { icon: "fab fa-instagram", href: "https://www.instagram.com/thehubshopping/", label: "Instagram" },
  { icon: "fab fa-x", href: "https://x.com/TheHubShopp", label: "Twitter" },
  { icon: "fab fa-youtube", href: "https://www.youtube.com/@Thehubshopping", label: "YouTube" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const toggleMenu = () => setMenuOpen((p) => !p);
  const closeMenu = () => setMenuOpen(false);

  // --- CAMBIO 3: Añadimos la función de scroll suave ---
  const smoothScroll = (el) => {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const handleLogout = useCallback(() => {
    setMenuOpen(false);
    logout();
  }, [logout]);

  const displayName = user?.name || user?.email || user?.username || "Tu cuenta";

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

            {/* --- CAMBIO 4: El logo ahora es un <Link> a "/" --- */}
            {/* Esto asegura que siempre vayas al inicio (top) de la página principal */}
            <Link to="/" className="logo d-flex align-items-center" onClick={closeMenu}>
              <img src="/TheHub/images/Header-logo.png" alt="The Hub" className="img-fluid" />
            </Link>
          </div>

          {/* Col 2: Menú central */}
          <div className={`menu-center ${menuOpen ? "d-block" : "d-none d-lg-block"}`}>
            <nav aria-label="Navegación principal">
              <ul className="nav mb-0 justify-content-center gap-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.label} className="nav-item" onClick={closeMenu}>
                    {/* --- CAMBIO 5: Usamos <HashLink> en lugar de <a> --- */}
                    <HashLink 
                      to={link.href} 
                      className="nav-link" 
                      scroll={smoothScroll} // Le decimos que use nuestra función de scroll
                    >
                      {link.label}
                    </HashLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Col 3: Acciones derecha */}
          <div className="d-flex align-items-center justify-content-end gap-3 actions-right">
            
            {/* --- CAMBIO 6 (BONUS): El botón "Explorar" también debe ser un HashLink --- */}
            <HashLink 
              to="/#productos" 
              className="btn__search d-none d-sm-inline-block" 
              scroll={smoothScroll}
            >
              Explorar
            </HashLink>

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
              {/* ... (el contenido de tu botón de carrito está bien) ... */}
              <i className="fas fa-shopping-cart"></i>
              <span className="d-none d-lg-inline">Carrito</span>
              {totalItems > 0 ? (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge">
                  {totalItems}
                </span>
              ) : null}
            </button>

            {isAuthenticated ? (
              // ... (tu lógica de "Cerrar sesión" está bien) ...
              <div className="d-flex align-items-center gap-2">
                <span className="text-nowrap small fw-semibold d-none d-lg-inline">{displayName}</span>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleLogout}
                  disabled={authLoading}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              // Tu enlace de "Acceder" ya usa <Link>, ¡lo cual es perfecto!
              <Link
                to="/login"
                className="btn__text"
                state={{ from: location.pathname }}
                onClick={closeMenu}
              >
                Acceder
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}