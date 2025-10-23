// src/admin/AdminSidebar.jsx

import { NavLink } from 'react-router-dom';

const ADMIN_LINKS = [
  { label: 'Home', href: '/admin/dashboard', icon: 'fas fa-home' },
  { label: 'Productos', href: '/admin/products', icon: 'fas fa-box' },
  { label: 'Usuarios', href: '/admin/users', icon: 'fas fa-users' },
];

// --- ¡Asegúrate de que 'default' esté aquí! ---
export default function AdminSidebar() {
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
                <i className={`${link.icon} me-3`}></i>
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}