// src/AdminLayout.jsx

import { Outlet } from 'react-router-dom';
import AdminSidebar from './admin/AdminSidebar'; 
import './admin/admin.css'; // Tu CSS ya está importado correctamente

export default function AdminLayout() {
  return (
    // Usamos "admin-wrapper" para que coincida con tu CSS
    <div className="admin-wrapper"> 
      
      {/* Tu CSS ya tiene estilos para ".admin-sidebar" y ".admin-content"
          así que los componentes que te di antes funcionarán perfecto. */}
      
      <AdminSidebar />
      
      <main className="admin-content">
        <Outlet /> 
      </main>

    </div>
  );
}