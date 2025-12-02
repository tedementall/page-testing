import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

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
  const { user, isAdmin, isAuthenticated } = useAuth();

  const toggleMenu = () => setMenuOpen((p) => !p);
  const closeMenu = () => setMenuOpen(false);

  const displayName = user?.name || user?.email || user?.username || "Tu cuenta";
  const smoothScroll = (el) => el.scrollIntoView({ behavior: "smooth", block: "start" });

  const adminFlag = useMemo(() => {
    return (
      isAdmin ||
      (user?.user_type && String(user.user_type).toLowerCase() === "admin") ||
      (user?.role && String(user.role).toLowerCase() === "admin") ||
      (user?.type && String(user.type).toLowerCase() === "admin") ||
      (user?.email && user.email.toLowerCase() === "mint@gmail.com")
    );
  }, [isAdmin, user]);

  const avatarUrl = useMemo(() => {
    const pic = user?.profile_picture;
    if (!pic) return "";
    if (typeof pic === "string") return pic;
    if (pic.url) return pic.url;
    if (pic.path) return pic.path;
    return "";
  }, [user]);

  const avatarInitials = useMemo(() => {
    const base = user?.name || user?.email || "";
    if (!base) return "";
    return base
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  }, [user]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="nav-grid">
            <div className="d-flex align-items-center gap-3">
              <button
                className="nav-hamburger d-lg-none"
                type="button"
                onClick={toggleMenu}
                aria-label="Abrir menú de navegación"
                aria-expanded={menuOpen}
              >
                <span className={`hamburger-line ${menuOpen ? "active" : ""}`} />
                <span className={`hamburger-line ${menuOpen ? "active" : ""}`} />
                <span className={`hamburger-line ${menuOpen ? "active" : ""}`} />
              </button>
              <Link to="/" className="logo d-flex align-items-center" onClick={closeMenu}>
                <img src="/TheHub/images/Header-logo.png" alt="The Hub" className="img-fluid" />
              </Link>
            </div>

            <div className="menu-center d-none d-lg-block">
              <nav aria-label="Navegación principal">
                <ul className="nav mb-0 justify-content-center gap-4">
                  {NAV_LINKS.map((link) => (
                    <li key={link.label} className="nav-item" onClick={closeMenu}>
                      <HashLink to={link.href} className="nav-link" scroll={smoothScroll}>
                        {link.label}
                      </HashLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="d-none d-lg-flex align-items-center justify-content-end gap-2 actions-right">
              <Link to="/noticias" className="btn__search d-none d-xl-inline-block">
                Noticias
              </Link>

              <div className="SocialMedia d-none d-xl-flex align-items-center">
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
                <span className="d-none d-xl-inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge">
                    {totalItems}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="d-flex align-items-center gap-2">
                  {adminFlag && (
                    <Link to="/admin/dashboard" className="btn btn-outline-primary btn-sm" onClick={closeMenu}>
                      Dashboard
                    </Link>
                  )}

                  <span className="text-nowrap small fw-semibold d-none d-xl-inline">
                    {displayName}
                  </span>

                  <Link
                    to="/perfil"
                    className="profile-icon-btn"
                    onClick={closeMenu}
                    aria-label="Ir a mi perfil"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="profile-icon-avatar" />
                    ) : avatarInitials ? (
                      <span className="profile-icon-initials">{avatarInitials}</span>
                    ) : (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="7" r="4" />
                        <path d="M5.5 21c1.5-4 12-4 13 0" />
                      </svg>
                    )}
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn__text"
                  state={{ from: location }}
                  onClick={closeMenu}
                >
                  Acceder
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="nav-mobile-backdrop" onClick={closeMenu} />
          <div className="nav-mobile-panel">
            <div className="nav-mobile-header">
              <Link to="/" className="logo d-flex align-items-center" onClick={closeMenu}>
                <img src="/TheHub/images/Header-logo.png" alt="The Hub" className="img-fluid" />
              </Link>
              <button
                type="button"
                className="nav-mobile-close"
                onClick={closeMenu}
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <nav className="nav-mobile-links" aria-label="Navegación principal móvil">
              {NAV_LINKS.map((link) => (
                <HashLink
                  key={link.label}
                  to={link.href}
                  className="nav-mobile-link"
                  scroll={smoothScroll}
                  onClick={closeMenu}
                >
                  {link.label}
                </HashLink>
              ))}
            </nav>

            <div className="nav-mobile-divider" />

            <div className="nav-mobile-actions">
              <button
                className="nav-mobile-cart-btn"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#cartOffcanvas"
                aria-controls="cartOffcanvas"
                onClick={closeMenu}
              >
                <span>
                  <i className="fas fa-shopping-cart me-2" />
                  Carrito
                </span>
                {totalItems > 0 && <span className="nav-mobile-cart-count">{totalItems}</span>}
              </button>

              <Link to="/noticias" className="nav-mobile-ghost-btn" onClick={closeMenu}>
                Noticias
              </Link>

              {isAuthenticated ? (
                <>
                  {adminFlag && (
                    <Link
                      to="/admin/dashboard"
                      className="nav-mobile-ghost-btn"
                      onClick={closeMenu}
                    >
                      Panel de administrador
                    </Link>
                  )}

                  <Link
                    to="/perfil"
                    className="nav-mobile-profile-btn"
                    onClick={closeMenu}
                  >
                    <div className="nav-mobile-profile-avatar">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} />
                      ) : avatarInitials ? (
                        <span>{avatarInitials}</span>
                      ) : (
                        <i className="fas fa-user" />
                      )}
                    </div>
                    <div className="nav-mobile-profile-text">
                      <span className="label">Mi perfil</span>
                      <span className="value">{displayName}</span>
                    </div>
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="nav-mobile-primary-btn"
                  state={{ from: location }}
                  onClick={closeMenu}
                >
                  Acceder
                </Link>
              )}
            </div>

            <div className="nav-mobile-social">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                >
                  <i className={link.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
