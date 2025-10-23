// --- CAMBIO 1: Importamos 'useLocation' ---
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

// --- Tus Componentes Principales ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import OffcanvasCart from "./components/OffcanvasCart";
import TransitionLayout from "./components/TransitionLayout";

// --- Tus Páginas de Usuario ---
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import Login from "./pages/Login";

// --- Tus Imports de Admin (estos ya estaban bien) ---
import AdminProtectedRoute from "./components/AdminProtectedRoute"; 
import AdminLayout from "./AdminLayout"; 
import AdminDashboard from "./admin/Dashboard.jsx";

export default function App() {
  
  // --- CAMBIO 2: Obtenemos la ubicación actual ---
  const location = useLocation();

  // --- CAMBIO 3: Creamos una variable para decidir si mostrar el layout principal ---
  // Si la ruta (pathname) NO empieza con "/admin", esto será 'true'.
  const showMainLayout = !location.pathname.startsWith('/admin');

  return (
    <>
      {/* --- CAMBIO 4: Usamos la variable para mostrar/ocultar --- */}
      {/* Ahora la Navbar solo aparece si 'showMainLayout' es true */}
      {showMainLayout && <Navbar />}
      
      <Routes>
        
        {/* --- Rutas Públicas y de Usuario --- */}
        <Route element={<TransitionLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* --- Rutas de Admin --- */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* <Route path="products" element={<AdminProducts />} /> */}
            {/* <Route path="orders" element={<AdminOrders />} /> */}
          </Route>
        </Route>

        {/* --- Ruta "catch-all" --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* --- CAMBIO 5: Ocultamos también el Footer y el Carrito --- */}
      {showMainLayout && <Footer />}
      {showMainLayout && <OffcanvasCart />}
    </>
  );
}