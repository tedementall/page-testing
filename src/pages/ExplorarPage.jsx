import { useEffect, useMemo, useRef, useState } from "react";
import { loadProductsOnce } from "../services/productsStore";
import ProductCard from "../components/ProductCard";

export default function ExplorarPage() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [sort, setSort] = useState("new");
  const boot = useRef(false);

  useEffect(() => {
    if (boot.current) return;
    boot.current = true;

    (async () => {
      setLoading(true);
      const data = await loadProductsOnce({ force: true });
      setAll(data);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(all.map((p) => (p.category || "").trim()).filter(Boolean));
    return ["Todas", ...Array.from(set)];
  }, [all]);

  const items = useMemo(() => {
    let list = [...all];
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          String(p.name || "").toLowerCase().includes(t) ||
          String(p.description || "").toLowerCase().includes(t)
      );
    }
    if (cat !== "Todas") {
      list = list.filter(
        (p) => (p.category || "").toLowerCase() === cat.toLowerCase()
      );
    }
    switch (sort) {
      case "price_asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price_desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "new":
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0)
        );
    }
    return list;
  }, [all, q, cat, sort]);

  return (
    <main className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Todos los productos</h2>
        <small className="text-muted">Mostrando {items.length}</small>
      </div>

      <div className="row g-2 align-items-end mb-3">
        <div className="col-12 col-md-4">
          <label className="form-label">Categoría</label>
          <select className="form-select" value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Ordenar por</label>
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Más nuevos</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Buscar…</label>
          <div className="input-group">
            <input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-outline-secondary" onClick={() => setQ("")}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 mb-4">
              <article className="rounded-3 border bg-white p-3 h-100">
                <div className="ratio ratio-1x1 mb-3 rounded-2 bg-light" />
                <div className="placeholder-wave">
                  <div className="placeholder col-3 mb-2" />
                  <div className="placeholder col-7 mb-2" />
                  <div className="placeholder col-4" />
                </div>
              </article>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          {items.map((p) => (
            <div key={p.id} className="col-12 col-sm-6 col-lg-4 mb-4">
              <ProductCard p={p} />
            </div>
          ))}
          {!items.length && (
            <div className="col-12">
              <div className="alert alert-info">No hay resultados.</div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}