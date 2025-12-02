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
      // newest
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
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === updatedProduct.id ? updatedProduct : item
      )
    );
  }

  
  const clearFilters = () => {
    setQ("");
    setCat("Todas");
    setSort("newest");
  };

  return (
    <div className="admin-content fade-in">
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '2rem' }}>Productos</h2>
        <p style={{ opacity: 0.7, margin: '5px 0 0 0' }}>Gestiona el inventario de la tienda.</p>
      </div>

      
      <div className="glass-filter-bar">
        
        <input
          className="form-control"
          placeholder="Nombre, marca o ID..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: '300px' }}
        />

        
        <select
          className="form-select text-capitalize"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          style={{ maxWidth: '200px' }}
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
          style={{ maxWidth: '200px' }}
        >
          <option value="newest">Más nuevos</option>
          <option value="name">Nombre (A-Z)</option>
          <option value="price-asc">Precio menor</option>
          <option value="price-desc">Precio mayor</option>
        </select>

        {/* Botones de Acción (Blancos) */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button 
            className="btn-glass-white"
            onClick={load}
            disabled={loading}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : "Refrescar"}
          </button>
          
          {(q || cat !== "Todas" || sort !== "newest") && (
            <button 
                className="btn-glass-white" 
                onClick={clearFilters}
            >
                Limpiar
            </button>
          )}
        </div>
      </div>

      
      {loading && items.length === 0 && (
        <div className="text-center p-5 glass">
          <i className="fas fa-circle-notch fa-spin fa-2x mb-3"></i>
          <p>Cargando productos...</p>
        </div>
      )}

      {err && (
        <div className="alert alert-danger glass" style={{ color: '#ff8585' }}>
          {err}
        </div>
      )}

      {!loading && !err && visible.length === 0 && (
        <div className="text-center p-5 glass">
          <p className="opacity-75">No se encontraron productos con estos filtros.</p>
        </div>
      )}

      
      {visible.length > 0 && (
        <div className="table-responsive glass">
          <table className="table-glass">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Img</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Creado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
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
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.1)"
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 8,
                            display: "grid",
                            placeItems: "center",
                            fontSize: "0.7rem",
                            color: "rgba(255,255,255,0.5)"
                          }}
                        >
                          N/A
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.name || "—"}</td>
                    <td className="text-capitalize">
                        <span style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem' 
                        }}>
                            {p.category || "General"}
                        </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#a5b4fc' }}>
                        {priceFormatted}
                    </td>
                    <td>
                        <span style={{ 
                            color: p.stock_quantity < 5 ? '#ff8585' : '#fff',
                            fontWeight: p.stock_quantity < 5 ? 'bold' : 'normal'
                        }}>
                            {p.stock_quantity ?? 0}
                        </span>
                    </td>
                    <td style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString("es-CL")
                        : "—"}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="btn-glass"
                          onClick={() => onEdit(p)}
                          disabled={workingId === p.id}
                          title="Editar"
                          style={{ height: '36px', padding: '0 12px' }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-danger-glass"
                          onClick={() => onDelete(p)}
                          disabled={workingId === p.id}
                          title="Borrar"
                          style={{ height: '36px', padding: '0 12px' }}
                        >
                          <i className="fas fa-trash-alt"></i>
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