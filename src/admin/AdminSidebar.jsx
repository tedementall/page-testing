// src/admin/AdminSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "fas fa-home" },
  { label: "Productos", href: "/admin/products", icon: "fas fa-box" },
  { label: "Agregar producto", href: "/admin/add-product", icon: "fas fa-plus" }, // ajusta si usas /admin/add
  { label: "Usuarios", href: "/admin/users", icon: "fas fa-users" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Limpia credenciales típicas
      localStorage.removeItem("token");
      localStorage.removeItem("auth");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("auth");
    } catch {}
    navigate("/", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <a href="/" aria-label="Ir a inicio">
          <img src="/TheHub/images/ic_thehub_logo.png" alt="The Hub Admin" />
        </a>
      </div>

      <nav>
        <ul className="nav flex-column">
          {ADMIN_LINKS.map(({ label, href, icon }) => (
            <li key={label} className="nav-item">
              <NavLink
                to={href}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                end
              >
                <i className={`${icon} me-3`} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}

          {/* Salir */}
          <li className="nav-item mt-4 logout-section">
            <button
              type="button"
              onClick={handleLogout}
              className="nav-link w-100 text-start"
              title="Cerrar sesión"
            >
              <i className="fas fa-sign-out-alt me-3" />
              <span>Salir</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
