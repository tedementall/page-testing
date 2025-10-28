import { NavLink, useNavigate } from "react-router-dom";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "fas fa-home" },
  { label: "Productos", href: "/admin/products", icon: "fas fa-box" },
  { label: "Agregar producto", href: "/admin/add-product", icon: "fas fa-plus" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Si tienes auth, aquí podrías limpiar token, etc.
    // localStorage.removeItem("token");
    navigate("/"); // 🔹 Redirige al home principal
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <img src="/TheHub/images/ic_thehub_logo.png" alt="The Hub Admin" />
      </div>

      <nav>
        <ul className="nav flex-column">
          {ADMIN_LINKS.map((link) => (
            <li key={link.label} className="nav-item">
              <NavLink to={link.href} className="nav-link">
                <i className={`${link.icon} me-3`} />
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}

          {/* 🔹 Botón “Salir” */}
          <li className="nav-item mt-4">
            <button onClick={handleLogout} className="nav-link text-start w-100">
              <i className="fas fa-sign-out-alt me-3" />
              <span>Salir</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
