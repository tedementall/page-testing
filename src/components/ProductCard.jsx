import { useMemo, useState } from "react";

/**
 * Props:
 * - p: { id, name, price, description, category, image_url, stock_quantity, ... }
 * - onOpen?: (p) => void
 * - onAddToCart?: (p, qty) => void
 */
export default function ProductCard({ p, onOpen, onAddToCart }) {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [loadedKey, setLoadedKey] = useState(""); // para el fade-in

  const images = useMemo(() => {
    const raw = p?.image_url;
    if (!raw) return [];
    if (typeof raw === "string") return [raw];
    if (Array.isArray(raw)) {
      return raw
        .map((it) => (typeof it === "string" ? it : it?.url || it?.path || it?.src || ""))
        .filter(Boolean);
    }
    if (Array.isArray(p?.images)) {
      return p.images.map((it) => it?.url || it?.path || it?.src || "").filter(Boolean);
    }
    return [];
  }, [p]);

  const cover = images[active] || images[0] || "";

  const maxStock =
    typeof p?.stock_quantity === "number" && p.stock_quantity > 0
      ? p.stock_quantity
      : 99;

  const handleOpen = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (onOpen) return onOpen(p);
    setShow(true);
  };
  const handleClose = () => setShow(false);

  const dec = () => setQty((n) => Math.max(1, n - 1));
  const inc = () => setQty((n) => Math.min(maxStock, n + 1));
  const onQtyChange = (e) => {
    const v = Number(e.target.value || 1);
    if (!Number.isNaN(v)) setQty(Math.min(maxStock, Math.max(1, v)));
  };

  const addToCart = () => {
    if (onAddToCart) onAddToCart(p, qty);
    else console.log("add to cart:", { product: p?.id, qty });
  };

  return (
    <>
      {/* Card clickeable */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-100 text-start border-0 bg-transparent p-0"
        style={{ cursor: "pointer" }}
      >
        <article className="rounded-3 border bg-white p-3 h-100 d-flex flex-column">
          <div className="ratio ratio-1x1 mb-3 rounded-2 overflow-hidden bg-light pc-zoom-wrap">
            {cover ? (
              <img
                key={cover}                 // fuerza transición al cambiar
                src={cover}
                alt={p?.name || "Producto"}
                className={`w-100 h-100 object-fit-cover pc-fade-img ${loadedKey === cover ? "is-loaded" : ""}`}
                onLoad={() => setLoadedKey(cover)}
                loading="lazy"
              />
            ) : (
              <div className="w-100 h-100" />
            )}
          </div>

          <div className="small text-muted text-uppercase">{p?.category}</div>
          <h3 className="h6 m-0">{p?.name}</h3>
          <div className="fw-semibold mt-2">
            {typeof p?.price === "number" ? `$${p.price.toLocaleString("es-CL")}` : ""}
          </div>
        </article>
      </button>

      {/* Modal */}
      {show && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,.5)" }}
          onClick={handleClose}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{p?.name}</h5>
                <button type="button" className="btn-close" onClick={handleClose} />
              </div>

              <div className="modal-body">
                <div className="row g-4">
                  {/* Galería */}
                  <div className="col-12 col-md-6">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light pc-zoom-wrap">
                      {cover ? (
                        <img
                          key={cover}
                          src={cover}
                          alt={p?.name || "Producto"}
                          className={`w-100 h-100 object-fit-cover pc-fade-img ${loadedKey === cover ? "is-loaded" : ""}`}
                          onLoad={() => setLoadedKey(cover)}
                        />
                      ) : null}
                    </div>

                    {images.length > 1 && (
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {images.map((u, i) => (
                          <button
                            key={u + i}
                            type="button"
                            onClick={() => {
                              setLoadedKey(""); // reinicia fade para el nuevo cover
                              setActive(i);
                            }}
                            className="p-0 border-0 bg-transparent"
                            style={{ lineHeight: 0 }}
                            aria-label={`Miniatura ${i + 1}`}
                          >
                            <img
                              src={u}
                              alt={`miniatura ${i + 1}`}
                              className="pc-thumb"
                              style={{
                                outline: i === active ? "2px solid #7c3aed" : "1px solid #e5e7eb",
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info + cantidad */}
                  <div className="col-12 col-md-6">
                    <div className="text-muted text-uppercase small">{p?.category}</div>
                    <h2 className="h3">{p?.name}</h2>
                    <div className="h5 fw-bold mb-3">
                      {typeof p?.price === "number" ? `$${p.price.toLocaleString("es-CL")}` : ""}
                    </div>

                    {p?.description ? <p className="mb-4">{p.description}</p> : null}

                    {typeof p?.stock_quantity === "number" && (
                      <p className="text-muted small mb-2">Stock disponible: {p.stock_quantity}</p>
                    )}

                    <label className="form-label d-block">Cantidad</label>
                    <div className="input-group" style={{ maxWidth: 220 }}>
                      <button type="button" className="btn btn-outline-secondary" onClick={dec} aria-label="Disminuir">
                        –
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={qty}
                        onChange={onQtyChange}
                        min={1}
                        max={maxStock}
                        inputMode="numeric"
                      />
                      <button type="button" className="btn btn-outline-secondary" onClick={inc} aria-label="Aumentar">
                        +
                      </button>
                    </div>

                    <div className="d-flex align-items-center gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addToCart}
                        disabled={qty < 1 || qty > maxStock}
                      >
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={handleClose}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
