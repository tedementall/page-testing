// src/admin/ProductsAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchProducts, deleteProduct } from "../api/ProductsApi";

const norm = (v) => String(v || "").trim().toLowerCase();
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const fmtCLP = (n) =>
  typeof n === "number" ? n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }) : "—";

export default function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("todas");
  const [sort, setSort] = useState("newest"); // newest | price_asc | price_desc
  const [deletingId, setDeletingId] = useState(null);

  async function loadProducts() {
    setLoading(true);
    setErr("");
    try {
      const data = await fetchProducts({ page: 1, limit: 100 });
      // fetchProducts devuelve { items, total, ... }
      const list = Array.isArray(data?.items) ? data.items : [];
      setItems(list);
    } catch (e) {
      console.error("[ProductsAdmin] load error:", e?.response?.data || e);
      setErr(e?.message || "Error cargando productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((p) => norm(p.category)).filter(Boolean));
    return ["todas", ...Array.from(set)];
  }, [items]);

  const visible = useMemo(() => {
    let list = items;

    if (category !== "todas") {
      list = list.filter((p) => norm(p.category) === norm(category));
    }

    if (q) {
      const s = norm(q);
      list = list.filter(
        (p) => norm(p.name).includes(s) || norm(p.description).includes(s)
      );
    }

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); // newest (por id)

    return list;
  }, [items, category, q, sort]);

  async function handleDelete(p) {
    if (!p?.id) return;
    const ok = window.confirm(`¿Borrar "${p.name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    setDeletingId(p.id);
    const prev = items;
    setItems((xs) => xs.filter((x) => x.id !== p.id));

    try {
      await deleteProduct(p.id);
    } catch (e) {
      console.error("[deleteProduct] error:", e?.response?.data || e);
      alert(
        `No se pudo borrar: ${
          e?.response?.data?.message || e?.message || "Error desconocido"
        }`
      );
      setItems(prev); // revert
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Productos</h2>
        <button className="btn btn-outline-light" onClick={loadProducts} disabled={loading}>
          {loading ? "Cargando…" : "Refrescar"}
        </button>
      </div>

      {/* Filtros */}
      <div className="row g-3 mb-3">
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Nombre o descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(norm(e.target.value))}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {cap(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Más nuevos</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>

        <div className="col-md-1 d-grid">
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              setQ("");
              setCategory("todas");
              setSort("newest");
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Estados */}
      {loading && <div className="alert alert-info">Cargando productos…</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      {!loading && !err && visible.length === 0 && (
        <div className="alert alert-secondary">No hay productos.</div>
      )}

      {/* Tabla */}
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 64 }}>Img</th>
              <th>Nombre</th>
              <th style={{ width: 140 }}>Categoría</th>
              <th style={{ width: 120 }}>Precio</th>
              <th style={{ width: 100 }}>Stock</th>
              <th style={{ width: 140 }}>Creado</th>
              <th style={{ width: 140 }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.image_url?.[0] ? (
                    <img
                      src={p.image_url[0]}
                      alt={p.name}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                    />
                  ) : (
                    <div style={{ width: 48, height: 48, background: "#555", borderRadius: 8 }} />
                  )}
                </td>
                <td>
                  <div className="fw-semibold">{p.name}</div>
                  <div className="small text-muted text-truncate" style={{ maxWidth: 520 }}>
                    {p.description}
                  </div>
                </td>
                <td className="text-capitalize">{p.category || "—"}</td>
                <td>{fmtCLP(p.price)}</td>
                <td>{p.stock_quantity ?? 0}</td>
                <td>{p.created_at ? new Date(p.created_at).toLocaleDateString("es-CL") : "—"}</td>
                <td className="text-end">
                  <div className="btn-group">
                    {/* Botón borrar */}
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      title="Borrar producto"
                    >
                      {deletingId === p.id ? "Borrando…" : "Borrar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
