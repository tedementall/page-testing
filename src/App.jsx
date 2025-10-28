// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import OffcanvasCart from "./components/OffcanvasCart";
import TransitionLayout from "./components/TransitionLayout";

import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import Login from "./pages/Login";
import ProductosPage from "./pages/ProductosPage";

// 🔐 Guard y layout admin (paths según tu estructura)
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./AdminLayout";

// Páginas admin
import AdminDashboard from "./admin/Dashboard.jsx";
import ProductsAdmin from "./admin/ProductsAdmin.jsx";
import AddProduct from "./admin/AddProduct.jsx";

export default function App() {
  const location = useLocation();
  const showMainLayout = !location.pathname.startsWith("/admin");

  return (
    <>
      {showMainLayout && <Navbar />}

      <Routes>
        {/* Públicas con transición */}
        <Route element={<TransitionLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/productos/:categoria" element={<ProductosPage />} />
        </Route>

        {/* Admin protegidas */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="add-product" element={<AddProduct />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showMainLayout && <Footer />}
      {showMainLayout && <OffcanvasCart />}
    </>
  );
}
