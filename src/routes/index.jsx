import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ExplorarPage from "../pages/ExplorarPage";
import ProductosPage from "../pages/ProductosPage"; // si lo usas

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/explorar" element={<ExplorarPage/>} />
      <Route path="/productos" element={<ExplorarPage/>} /> {/* opcional: alias */}
      <Route path="*" element={<Home/>} />
    </Routes>
  );
}
