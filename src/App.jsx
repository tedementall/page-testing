import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import OffcanvasCart from "./components/OffcanvasCart";
import CartPage from "./pages/CartPage";
import TransitionLayout from "./components/TransitionLayout";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route element={<TransitionLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <OffcanvasCart />
    </>
  );
}
