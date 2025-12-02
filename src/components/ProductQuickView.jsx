import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency";

export function pickRelated(all, current, n = 3) {
  if (!all || !Array.isArray(all) || !current) return [];
  return all
    .filter((x) => x.id !== current.id && x.category === current.category)
    .slice(0, n);
}

export default function ProductQuickView({ open, onClose, product, allProducts = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(product || null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loadedKey, setLoadedKey] = useState("");
  const [manualActive, setManualActive] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const { addItem, isMutating } = useCart();

  useEffect(() => {
    if (open) {
      setSelectedProduct(product);
      setActiveImageIndex(0);
      setQuantity(1);
      setLoadedKey("");
      setIsAdded(false);
    }
  }, [product, open]);

  useEffect(() => {
    if (open && !manualActive) {
      setManualActive(true);
    } else if (!open && manualActive) {
      setManualActive(false);
    }
  }, [open, manualActive]);

  const images = useMemo(() => {
    const p = selectedProduct;
    if (!p) return [];
    const raw = p.images || p.image_url || p.image;

    let list = [];

    if (Array.isArray(raw)) {
      list = raw.map((it) =>
        typeof it === "string" ? it : it?.url || it?.path || it?.src || ""
      );
    } else if (typeof raw === "string") {
      list = [raw];
    }

    if (list.length === 0 && (p.image || p.image_url)) {
      list = [p.image || p.image_url];
    }

    return list.filter(Boolean);
  }, [selectedProduct]);

  const cover = images[activeImageIndex] || images[0] || "";

  const relatedProducts = useMemo(
    () => (selectedProduct ? pickRelated(allProducts, selectedProduct, 3) : []),
    [allProducts, selectedProduct]
  );

  const maxStock =
    typeof selectedProduct?.stock_quantity === "number" &&
    selectedProduct.stock_quantity > 0
      ? selectedProduct.stock_quantity
      : 99;

  const handleClose = useCallback(() => {
    setManualActive(false);
    setTimeout(() => {
      setActiveImageIndex(0);
    }, 200);
    if (onClose) onClose();
  }, [onClose]);

  const handleSelectRelated = useCallback((related) => {
    setSelectedProduct(related);
    setActiveImageIndex(0);
    setQuantity(1);
    setLoadedKey("");
    setIsAdded(false);
  }, []);

  const decrementQty = () => setQuantity((n) => Math.max(1, n - 1));
  const incrementQty = () => setQuantity((n) => Math.min(maxStock, n + 1));

  const handleAddToCart = useCallback(
    async () => {
      if (!selectedProduct) return;
      try {
        await addItem(selectedProduct, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      } catch (error) {
        console.error(error);
      }
    },
    [selectedProduct, quantity, addItem]
  );

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && manualActive) handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [manualActive, handleClose]);

  if (!manualActive) return null;

  return (
    <>
      <div
        className="pqv-overlay"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="pqv-dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pqv-card">
            <button
              type="button"
              className="pqv-close-btn"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              ✕
            </button>

            <div className="pqv-content">
              {selectedProduct ? (
                <>
                  <div className="pqv-left">
                    <div className="pqv-image-main">
                      {cover && (
                        <img
                          src={cover}
                          alt={selectedProduct.name}
                          className={loadedKey === cover ? "is-loaded" : ""}
                          onLoad={() => setLoadedKey(cover)}
                        />
                      )}
                    </div>

                    {images.length > 1 && (
                      <div className="pqv-thumbs">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`pqv-thumb-btn ${
                              i === activeImageIndex ? "active" : ""
                            }`}
                            onClick={() => setActiveImageIndex(i)}
                            aria-label={`Ver imagen ${i + 1}`}
                          >
                            <img src={img} alt={`Miniatura ${i + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pqv-right">
                    <div className="pqv-badge-row">
                      <span className="pqv-category">
                        {selectedProduct.category || "General"}
                      </span>
                    </div>

                    <h2 className="pqv-title">{selectedProduct.name}</h2>

                    <div className="pqv-price-row">
                      <span className="pqv-price">
                        {formatCurrency(selectedProduct.price)}
                      </span>
                      {selectedProduct.stock_quantity > 0 && (
                        <span className="pqv-stock-pill">
                          Stock: {selectedProduct.stock_quantity}
                        </span>
                      )}
                    </div>

                    <p className="pqv-description">
                      {selectedProduct.description || "Sin descripción disponible."}
                    </p>

                    <div className="pqv-controls">
                      <div className="pqv-qty-pill">
                        <button
                          type="button"
                          onClick={decrementQty}
                          disabled={quantity <= 1}
                        >
                          −
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={incrementQty}
                          disabled={quantity >= maxStock}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className={`pqv-add-btn ${isAdded ? "is-added" : ""}`}
                        onClick={handleAddToCart}
                        disabled={isMutating || quantity < 1 || quantity > maxStock}
                      >
                        <span className="pqv-add-btn-label">
                          {isMutating ? "Añadiendo..." : isAdded ? "Añadido" : "Añadir al carrito"}
                        </span>
                      </button>
                    </div>

                    {relatedProducts.length > 0 && (
                      <div className="pqv-related">
                        <h5>También te podría gustar</h5>
                        <div className="pqv-related-grid">
                          {relatedProducts.map((rel) => (
                            <button
                              key={rel.id}
                              type="button"
                              className="pqv-related-card"
                              onClick={() => handleSelectRelated(rel)}
                            >
                              <div className="pqv-related-img">
                                <img
                                  src={
                                    rel.image ||
                                    (Array.isArray(rel.images) && rel.images[0]) ||
                                    ""
                                  }
                                  alt={rel.name}
                                />
                              </div>
                              <div className="pqv-related-info">
                                <span className="pqv-related-name">
                                  {rel.name}
                                </span>
                                <span className="pqv-related-price">
                                  {formatCurrency(rel.price)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="pqv-loading">Cargando detalles...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
