import { useEffect, useRef, useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import ProductQuickView from "../components/ProductQuickView";
import { loadProductsOnce } from "../services/productsStore";

export default function FavoritesSection() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showQuick, setShowQuick] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    (async () => {
      setLoading(true);
      try {
        const data = await loadProductsOnce();
        setAll(data || []);
      } catch (error) {
        console.error("Error cargando favoritos:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const favorites = useMemo(() => {
    if (!all.length) return [];
    const sorted = [...all].sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt || 0) -
        new Date(a.created_at || a.createdAt || 0)
    );
    return sorted.slice(0, 6);
  }, [all]);

  const handleOpenQuick = (product) => {
    setSelectedProduct(product);
    setShowQuick(true);
  };

  const handleCloseQuick = () => {
    setShowQuick(false);
    setSelectedProduct(null);
  };

  return (
    <section className="py-5">
      <div className="container">
        <span className="eyebrow-text">Nuestros favoritos</span>
        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
          <h2 className="display-title-m3 mb-0" style={{ fontWeight: 700 }}>
            Nuestros favoritos
          </h2>
          <a
            href="/productos"
            className="btn btn-outline-primary rounded-pill px-4"
          >
            Ver catálogo completo
          </a>
        </div>

        <p
          className="text-muted mb-4"
          style={{ maxWidth: "720px", lineHeight: "1.6" }}
        >
          Curamos colecciones limitadas de accesorios premium para dispositivos
          móviles, gamers y creadores. Haz clic en cualquiera para descubrir más
          detalles.
        </p>

        <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="col">
                <div className="card border-0 h-100 shadow-sm rounded-4 overflow-hidden bg-white">
                  <div className="ratio ratio-16x9 bg-light placeholder-wave" />
                  <div className="card-body p-4">
                    <div className="placeholder-glow mb-2">
                      <span className="placeholder col-6 rounded-pill" />
                    </div>
                    <div className="placeholder-glow">
                      <span className="placeholder col-4 rounded-pill py-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {favorites.map((p) => (
                <div key={p.id} className="col">
                  <ProductCard p={p} onOpen={handleOpenQuick} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <ProductQuickView
        open={showQuick}
        onClose={handleCloseQuick}
        product={selectedProduct}
        allProducts={all}
      />
    </section>
  );
}
