import { useCallback, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

const NAV_LINKS = [
  { label: "Inicio", href: "/#home" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Productos", href: "/#productos" },
  { label: "Equipo", href: "/#equipo" },
  { label: "Contacto", href: "/#contacto" },
];

const SOCIAL_LINKS = [
  { icon: "fab fa-facebook-f", href: "https://www.facebook.com", label: "Facebook" },
  { icon: "fab fa-instagram", href: "https://www.instagram.com", label: "Instagram" },
  { icon: "fab fa-twitter", href: "https://twitter.com", label: "Twitter" },
  { icon: "fab fa-tiktok", href: "https://www.tiktok.com", label: "TikTok" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, isAdmin, isLoading: authLoading, logout, isAuthenticated } = useAuth();

  // Bloquear scroll cuando el menú está abierto
  useBodyScrollLock(menuOpen);

  const toggleMenu = () => setMenuOpen((p) => !p);
  const closeMenu = () => setMenuOpen(false);
  const displayName = user?.name || user?.email || user?.username || "Tu cuenta";
  const smoothScroll = (el) => el.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleLogout = useCallback(() => {
    setMenuOpen(false);
    logout();
  }, [logout]);

  // fallback temporal por si llega distinto el rol
  const adminFlag = useMemo(() => {
    return (
      isAdmin ||
      (user?.user_type && String(user.user_type).toLowerCase() === "admin") ||
      (user?.role && String(user.role).toLowerCase() === "admin") ||
      (user?.type && String(user.type).toLowerCase() === "admin") ||
      (user?.email && user.email.toLowerCase() === "mint@gmail.com")
    );
  }, [isAdmin, user]);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="nav-grid">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-secondary d-lg-none hamburger-btn"
                type="button"
                onClick={toggleMenu}
                aria-label="Abrir menú de navegación"
                aria-expanded={menuOpen}
              >
                <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
              <Link to="/" className="logo d-flex align-items-center" onClick={closeMenu}>
                <img src="/TheHub/images/Header-logo.png" alt="The Hub" className="img-fluid" />
              </Link>
            </div>

            {/* Menú Desktop */}
            <div className="menu-center d-none d-lg-block">
              <nav aria-label="Navegación principal">
                <ul className="nav mb-0 justify-content-center gap-4">
                  {NAV_LINKS.map((link) => (
                    <li key={link.label} className="nav-item">
                      <HashLink to={link.href} className="nav-link" scroll={smoothScroll}>
                        {link.label}
                      </HashLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="d-flex align-items-center justify-content-end gap-3 actions-right">
              <HashLink to="/#productos" className="btn__search d-none d-sm-inline-block" scroll={smoothScroll}>
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
                className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2 position-relative cart-btn"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#cartOffcanvas"
                aria-controls="cartOffcanvas"
                onClick={closeMenu}
              >
                <i className="fas fa-shopping-cart"></i>
                <span className="d-none d-lg-inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge">
                    {totalItems}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="d-none d-lg-flex align-items-center gap-2">
                  {adminFlag ? (
                    <Link to="/admin/dashboard" className="btn btn-outline-primary">
                      Dashboard
                    </Link>
                  ) : (
                    <span className="text-nowrap small fw-semibold">{displayName}</span>
                  )}
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
                <Link
                  to="/login"
                  className="btn__text d-none d-lg-inline-block"
                  state={{ from: location }}
                >
                  Acceder
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay del menú móvil */}
      {menuOpen && <div className="mobile-menu-overlay" onClick={closeMenu} />}

      {/* Menú lateral móvil */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="mobile-logo" onClick={closeMenu}>
            <img src="/TheHub/images/Header-logo.png" alt="The Hub" />
          </Link>
          <button className="mobile-menu-close" onClick={closeMenu} aria-label="Cerrar menú">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="mobile-nav" aria-label="Navegación móvil">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <HashLink 
                  to={link.href} 
                  className="mobile-nav-link" 
                  scroll={smoothScroll}
                  onClick={closeMenu}
                >
                  {link.label}
                </HashLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-menu-actions">
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <i className="fas fa-user-circle"></i>
                <span>{displayName}</span>
              </div>
              {adminFlag && (
                <Link 
                  to="/admin/dashboard" 
                  className="mobile-action-btn admin-btn"
                  onClick={closeMenu}
                >
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard
                </Link>
              )}
              <button
                className="mobile-action-btn logout-btn"
                onClick={handleLogout}
                disabled={authLoading}
              >
                <i className="fas fa-sign-out-alt"></i>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mobile-action-btn login-btn"
              state={{ from: location }}
              onClick={closeMenu}
            >
              <i className="fas fa-sign-in-alt"></i>
              Acceder
            </Link>
          )}
        </div>

        <div className="mobile-social">
          {SOCIAL_LINKS.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              target="_blank" 
              rel="noreferrer" 
              aria-label={link.label}
              className="mobile-social-link"
            >
              <i className={link.icon}></i>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}