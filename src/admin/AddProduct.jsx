// src/admin/AddProduct.jsx
import { useEffect, useMemo, useState } from "react";
import { createProductWithImages, fetchProducts } from "../api/ProductsApi";
import { useNavigate } from "react-router-dom";

function normalizeCategory(v) {
  return String(v || "").normalize("NFKC").trim().toLowerCase();
}

export default function AddProduct() {
  const nav = useNavigate();

  // --- Form ---
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    brand: "",
    category: "",          // categoría seleccionada del select
    category_custom: "",   // texto cuando eligen "Otra…"
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // --- Cargar categorías existentes desde productos ---
  const [items, setItems] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setCatLoading(true);
        const data = await fetchProducts({ page: 1, limit: 200 });
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        console.error("[AddProduct] load categories error:", e?.response?.data || e);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(
      items
        .map((p) => normalizeCategory(p?.category))
        .filter(Boolean)
    );
    return Array.from(set).sort();
  }, [items]);

  const isOther = form.category === "__other__";

  const onChange = (e) => {
    const { name, value } = e.target;
    // Solo normalizamos category_custom al enviar, para que el placeholder se vea tal cual
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onFiles = (e) => setFiles(e.target.files);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setStatus("Procesando…");

    const finalCategory = isOther
      ? normalizeCategory(form.category_custom)
      : normalizeCategory(form.category);

    const payload = {
      name: (form.name || "").trim(),
      description: (form.description || "").trim(),
      price: Number(form.price) || 0,
      stock_quantity: Number(form.stock) || 0,
      brand: (form.brand || "").trim(),
      category: finalCategory,
    };

    try {
      setLoading(true);
      const res = await createProductWithImages(payload, files);
      setResult(res);
      setStatus("Producto creado ✅");

      // reset
      setForm({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        brand: "",
        category: "",
        category_custom: "",
      });
      e.target.reset();
      setFiles([]);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const msgFromServer =
        (typeof data === "string" && data) ||
        data?.message ||
        data?.error ||
        data?.detail ||
        (data ? JSON.stringify(data) : null);

      const pretty = status
        ? `Xano respondió ${status}${msgFromServer ? `: ${msgFromServer}` : ""}`
        : msgFromServer || err?.message || "Error inesperado";

      console.error("[AddProduct] Error:", {
        status,
        data,
        url: err?.config?.url,
        method: err?.config?.method,
      });

      setError(pretty);
      setStatus("Error ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-3">Agregar producto con múltiples imágenes</h2>

      <form className="row g-3" onSubmit={onSubmit}>
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Marca</label>
          <input
            className="form-control"
            name="brand"
            value={form.brand}
            onChange={onChange}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-control"
            rows={3}
            name="description"
            value={form.description}
            onChange={onChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Precio</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={form.price}
            onChange={onChange}
            min="0"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Stock</label>
          <input
            type="number"
            className="form-control"
            name="stock"
            value={form.stock}
            onChange={onChange}
            min="0"
          />
        </div>

        {/* Categoría: select + "Otra…" */}
        <div className="col-md-4">
          <label className="form-label">Categoría</label>
          <select
            className="form-select text-capitalize"
            name="category"
            value={form.category}
            onChange={onChange}
            disabled={catLoading}
            required
          >
            <option value="">Selecciona…</option>
            {categories.map((c) => (
              <option key={c} value={c} className="text-capitalize">
                {c || "—"}
              </option>
            ))}
            <option value="__other__">Otra…</option>
          </select>
          {isOther && (
            <input
              className="form-control mt-2"
              name="category_custom"
              value={form.category_custom}
              onChange={onChange}
              placeholder="Escribe una nueva categoría"
            />
          )}
          <small className="text-muted">
            Se normaliza a minúsculas para coincidir con Xano.
          </small>
        </div>

        <div className="col-12">
          <label className="form-label">Imágenes (múltiples)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            multiple
            onChange={onFiles}
          />
          <small className="text-muted">
            Se envían como <code>content[]</code> a Xano.
          </small>
        </div>

        <div className="col-12 d-flex gap-2 align-items-center">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Subiendo…" : "Crear producto"}
          </button>
          <span className="small">{status}</span>
        </div>

        {error && <div className="col-12 alert alert-danger">{error}</div>}

        {result && (
          <div className="col-12">
            <pre
              className="bg-dark text-white p-3 rounded"
              style={{ maxHeight: 300, overflow: "auto" }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </div>
  );
}
