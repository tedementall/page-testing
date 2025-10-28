// src/components/Products.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchProducts } from "../api/productsApi";

export default function Products({
  limit = 6,
  title = "Nuestros favoritos",
  subtitle = "Curamos colecciones limitadas de accesorios premium para dispositivos móviles, gamers y creadores. Haz clic en cualquiera para descubrir más detalles.",
  showCTA = true,
  params = {},
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);

    fetchProducts({ limit, page: 1, sort: "new", ...params })
      .then((response) => {
        if (cancelled) return;
        const productItems = response.items || [];
        console.log("[Products] items recibidos:", productItems.length, productItems);
        setItems(Array.isArray(productItems) ? productItems.slice(0, limit) : []);
      })
      .catch((e) => {
        if (!cancelled) {
          console.error(e);
          setErr("No pudimos cargar los productos. Intenta nuevamente más tarde.");
        }
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [limit, params]);

  return (
    <section id="productos" className="container py-5">
      <div className="d-flex justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">NUESTROS FAVORITOS</p>
          <h2 className="display-6 m-0">{title}</h2>
          <p className="text-muted mt-2">{subtitle}</p>
        </div>

        {showCTA && (
          <Link to="/productos" className="btn btn-outline-primary">
            Ver catálogo completo
          </Link>
        )}
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {!err && (
        <>
          {loading ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
              {Array.from({ length: limit }).map((_, i) => (
                <div className="col" key={i}>
                  <div className="placeholder-glow rounded-3 p-3 border bg-white h-100">
                    <div className="ratio ratio-1x1 mb-3 bg-light placeholder" />
                    <span className="placeholder col-8"></span>
                    <span className="placeholder col-5 d-block mt-2"></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
              {items.map((p) => (
                <div className="col" key={p.id}>
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}