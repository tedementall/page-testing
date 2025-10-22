import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import OffcanvasCart from "./components/OffcanvasCart";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* cualquier otra ruta redirige a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <OffcanvasCart />
    </>
  );
}
