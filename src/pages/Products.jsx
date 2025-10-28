// src/components/Products.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/ProductsApi";
import ProductCard from "./ProductCard";

export default function Products({ limit = 6, title = "Nuestros favoritos" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const fetched = useRef(false); // evita doble fetch en dev (StrictMode)

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    (async () => {
      try {
        setLoading(true);
        const { items: serverItems = [] } = await fetchProducts({
          limit,
          page: 1,
          sort: "new",
          // Puedes filtrar por categoria si quieres: category: "Cargadores"
        });
        setItems(serverItems.slice(0, limit));
      } catch (e) {
        console.error("[Products] error:", e);
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [limit]);

  return (
    <section className="container__product">
      <div className="container">
        <div className="row align-items-center mb-3">
          <div className="col">
            <div className="text__product">
              <p>NUESTROS FAVORITOS</p>
              <h1>{title}</h1>
              <p className="mb-0">
                Curamos colecciones limitadas de accesorios premium para dispositivos móviles, gamers y creadores.
                Haz clic en cualquiera para descubrir más detalles.
              </p>
            </div>
          </div>
          <div className="col-auto">
            <Link to="/productos" className="btn btn-outline-primary rounded-pill">
              Ver catálogo completo
            </Link>
          </div>
        </div>

        {err && (
          <div className="alert alert-danger" role="alert">
            Ocurrió un error cargando productos. Intenta nuevamente.
          </div>
        )}

        <div className="row">
          {loading
            ? Array.from({ length: limit }).map((_, i) => (
                <div key={`sk-${i}`} className="col-12 col-sm-6 col-lg-4 mb-4">
                  <article className="rounded-3 border bg-white p-3 h-100">
                    <div className="ratio ratio-1x1 mb-3 rounded-2 bg-light" />
                    <div className="placeholder-wave">
                      <div className="placeholder col-3 mb-2" />
                      <div className="placeholder col-7 mb-2" />
                      <div className="placeholder col-4" />
                    </div>
                  </article>
                </div>
              ))
            : items.map((p) => (
                <div key={p.id} className="col-12 col-sm-6 col-lg-4 mb-4">
                  <ProductCard p={p} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
