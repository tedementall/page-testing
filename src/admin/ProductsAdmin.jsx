import { useEffect, useMemo, useRef, useState } from "react";
import { fetchProducts } from "../api/ProductsApi";

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const format = {
  currency(n) {
    const v = Number(n || 0);
    try {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(v);
    } catch {
      return `$${v.toLocaleString("es-CL")}`;
    }
  },
};

export default function ProductsAdmin() {
  const boot = useRef(false);
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [sort, setSort] = useState("new");
  const qDebounced = useDebounced(q, 350);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { items } = await fetchProducts({ limit: 100, page: 1, sort: "new" });
      setRaw(items ?? []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (boot.current) return;
    boot.current = true;
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(raw.map((p) => (p.category || "").trim()).filter(Boolean));
    return ["Todas", ...Array.from(set)];
  }, [raw]);

  const data = useMemo(() => {
    let rows = [...raw];

    if (qDebounced.trim()) {
      const t = qDebounced.trim().toLowerCase();
      rows = rows.filter(
        (p) =>
          String(p.name || "").toLowerCase().includes(t) ||
          String(p.description || "").toLowerCase().includes(t)
      );
    }

    if (cat !== "Todas") {
      rows = rows.filter(
        (p) => (p.category || "").toLowerCase() === cat.toLowerCase()
      );
    }

    switch (sort) {
      case "price_asc":
        rows.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price_desc":
        rows.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "stock_desc":
        rows.sort((a, b) => Number(b.stock_quantity ?? b.stock ?? 0) - Number(a.stock_quantity ?? a.stock ?? 0));
        break;
      case "new":
      default:
        rows.sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0)
        );
    }

    return rows;
  }, [raw, qDebounced, cat, sort]);

  return (
    <div className="content-panel">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="mb-0">Productos</h1>
        <button className="btn btn-sm btn-outline-light" onClick={load} disabled={loading}>
          {loading ? "Actualizando…" : "Refrescar"}
        </button>
      </div>

      {/* Filtros */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <label className="form-label">Buscar</label>
          <input
            className="form-control"
            placeholder="Nombre o descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-4">
          <label className="form-label">Categoría</label>
          <select className="form-select" value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-4">
          <label className="form-label">Ordenar</label>
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Más nuevos</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="stock_desc">Stock: mayor a menor</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          Error cargando productos: {error.message ?? "desconocido"}
        </div>
      )}

      <div className="table-container">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <small className="text-light">Mostrando {data.length} producto(s)</small>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Img</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th className="text-end">Precio</th>
                <th className="text-end">Stock</th>
                <th className="text-end" style={{ width: 140 }}>Creado</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td><div className="placeholder" style={{ width:50, height:50, borderRadius:8 }} /></td>
                      <td colSpan={5}><div className="placeholder col-6" /></td>
                    </tr>
                  ))
                : data.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div
                          style={{
                            width: 50, height: 50,
                            borderRadius: 8, overflow: "hidden",
                            background: "#f1f3f5",
                          }}
                        >
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-white">{p.name}</div>
                        <small className="text-light text-opacity-75">{p.description || "—"}</small>
                      </td>
                      <td>{p.category || "—"}</td>
                      <td className="text-end">{format.currency(p.price)}</td>
                      <td className="text-end">{p.stock_quantity ?? p.stock ?? 0}</td>
                      <td className="text-end">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
              {!loading && !data.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="text-center text-light">Sin resultados.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
