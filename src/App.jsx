import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import OffcanvasCart from "./components/OffcanvasCart";
import TransitionLayout from "./components/TransitionLayout";

import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import Login from "./pages/Login";
import ProductosPage from "./pages/ProductosPage";
import Register from "./pages/Register";
import Users from "./pages/Users";
import NoticiasPage from "./pages/NoticiasPage";
import Payment from "./pages/Payment"; // 🎯 CORREGIDO: Importa como 'Payment'

import ContactPage from "./pages/ContactPage";
import CustomerProfile from "./pages/CustomerProfile";

import Payment from "./pages/Payment";
import CheckoutPage from "./pages/Checkout"; 

// Admin Imports
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./admin/Dashboard";
import ProductsAdmin from "./admin/ProductsAdmin";
import AddProduct from "./admin/AddProduct";
import UsersAdmin from "./pages/Users";
import OrdersPage from "./admin/OrdersPage";
import NewsAdmin from "./admin/NewsAdmin";

export default function App() {
  const location = useLocation();
  const showMainLayout = !location.pathname.startsWith("/admin");

  return (
    <>
      {showMainLayout && <Navbar />}

      <Routes>
        <Route element={<TransitionLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/productos/:categoria" element={<ProductosPage />} />
          <Route path="/noticias" element={<NoticiasPage />} />
          
          <Route path="/checkout/payment" element={<Payment />} />
          <Route path="/checkout" element={<CheckoutPage />} /> 
          
          <Route path="/perfil" element={<CustomerProfile />} />
          <Route path="/contacto" element={<ContactPage />} />
        </Route>

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="news" element={<NewsAdmin />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showMainLayout && <Footer />}
      {showMainLayout && <OffcanvasCart />}
    </>
  );
}
