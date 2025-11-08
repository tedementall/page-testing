// src/admin/ProductsAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchProducts, deleteProduct } from "../api/ProductsApi";
import EditProductModal from "./EditProductModal";

const norm = (v) => String(v || "").trim().toLowerCase();

export default function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [sort, setSort] = useState("newest");
  const [workingId, setWorkingId] = useState(null);

  // Estado del modal de edición
  const [editingProduct, setEditingProduct] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await fetchProducts({ page: 1, limit: 200 });
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      console.error("[ProductsAdmin] load error:", e?.response?.data || e);
      setErr(e?.message || "Error cargando productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((p) => norm(p.category)).filter(Boolean));
    return ["Todas", ...Array.from(set).sort()];
  }, [items]);

  const visible = useMemo(() => {
    let list = items;

    if (q) {
      const s = norm(q);
      list = list.filter(
        (p) =>
          norm(p.name).includes(s) ||
          norm(p.description).includes(s) ||
          norm(p.brand).includes(s) ||
          norm(p.id).includes(s)
      );
    }

    if (cat !== "Todas") {
      list = list.filter((p) => norm(p.category) === norm(cat));
    }

    if (sort === "name") {
      list = [...list].sort((a, b) =>
        norm(a.name).localeCompare(norm(b.name))
      );
    } else if (sort === "price-asc") {
      list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else {
      list = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }

    return list;
  }, [items, q, cat, sort]);

  async function onDelete(p) {
    if (!window.confirm(`¿Borrar "${p.name}"?`)) return;
    setWorkingId(p.id);
    const prev = items;
    setItems((xs) => xs.filter((x) => x.id !== p.id));
    try {
      await deleteProduct(p.id);
    } catch (e) {
      setItems(prev);
      alert("No se pudo eliminar el producto");
    } finally {
      setWorkingId(null);
    }
  }

  function onEdit(product) {
    setEditingProduct(product);
  }

  function onEditSuccess(updatedProduct) {
    // Actualizar el producto en la lista
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === updatedProduct.id ? updatedProduct : item
      )
    );
  }

  return (
    <div className="admin-content">
      <div className="content-panel">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Productos</h2>
          <button
            className="btn-glass"
            onClick={load}
            disabled={loading}
            style={{
              padding: '.6rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Cargando…" : "Refrescar"}
          </button>
        </div>

        {/* Filtros */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <input
            className="form-control"
            placeholder="Nombre o descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              padding: '.7rem 1rem',
              borderRadius: '12px'
            }}
          />
          <select
            className="form-select text-capitalize"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            style={{
              padding: '.7rem 1rem',
              borderRadius: '12px'
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c} className="text-capitalize">
                {c}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: '.7rem 1rem',
              borderRadius: '12px'
            }}
          >
            <option value="newest">Más nuevos</option>
            <option value="name">Nombre</option>
            <option value="price-asc">Precio menor</option>
            <option value="price-desc">Precio mayor</option>
          </select>
          <button 
            className="btn-glass" 
            onClick={() => { setQ(""); setCat("Todas"); }}
            style={{
              padding: '.7rem 1rem',
              borderRadius: '12px',
              fontWeight: 500
            }}
          >
            Limpiar
          </button>
        </div>

        {loading && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(138,43,226,.2)',
            border: '1px solid rgba(138,43,226,.4)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            Cargando productos…
          </div>
        )}
        
        {err && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(255,107,107,.2)',
            border: '1px solid rgba(255,107,107,.4)',
            borderRadius: '12px',
            color: '#ff6b6b'
          }}>
            {err}
          </div>
        )}
        
        {!loading && !err && visible.length === 0 && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(255,255,255,.1)',
            border: '1px solid rgba(255,255,255,.2)',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'rgba(255,255,255,.7)'
          }}>
            No hay productos.
          </div>
        )}

        {/* Tabla */}
        {visible.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-glass">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Img</th>
                  <th>Nombre</th>
                  <th style={{ width: 150 }}>Categoría</th>
                  <th style={{ width: 120 }}>Precio</th>
                  <th style={{ width: 100 }}>Stock</th>
                  <th style={{ width: 140 }}>Creado</th>
                  <th style={{ width: 180, textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const firstImage = p.image_url?.[0];
                  const priceFormatted = new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(p.price);

                  return (
                    <tr key={p.id}>
                      <td>
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={p.name}
                            style={{
                              width: 64,
                              height: 64,
                              objectFit: "cover",
                              borderRadius: 10,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 64,
                              height: 64,
                              background: "rgba(255,255,255,.08)",
                              borderRadius: 10,
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <span className="text-muted-soft" style={{ fontSize: '.8rem' }}>
                              Sin img
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.name || "—"}</td>
                      <td className="text-capitalize">{p.category || "—"}</td>
                      <td>{priceFormatted}</td>
                      <td>{p.stock_quantity ?? 0}</td>
                      <td>
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString("es-CL")
                          : "—"}
                      </td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          gap: '.5rem',
                          justifyContent: 'center'
                        }}>
                          <button
                            className="btn-glass"
                            onClick={() => onEdit(p)}
                            disabled={workingId === p.id}
                            title="Editar producto"
                            style={{
                              padding: '.5rem 1rem',
                              borderRadius: '8px',
                              fontSize: '.9rem',
                              fontWeight: 500,
                              cursor: workingId === p.id ? 'not-allowed' : 'pointer',
                              opacity: workingId === p.id ? 0.5 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '.4rem'
                            }}
                          >
                            <i className="fas fa-edit" style={{ fontSize: '.85rem' }} />
                            Editar
                          </button>
                          <button
                            className="btn-danger-glass"
                            onClick={() => onDelete(p)}
                            disabled={workingId === p.id}
                            title="Eliminar producto"
                            style={{
                              padding: '.5rem 1rem',
                              borderRadius: '8px',
                              fontSize: '.9rem',
                              fontWeight: 500,
                              cursor: workingId === p.id ? 'not-allowed' : 'pointer',
                              opacity: workingId === p.id ? 0.5 : 1
                            }}
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={onEditSuccess}
        />
      )}
    </div>
  );
}