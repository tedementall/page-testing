import { useMemo, useState } from "react";

export default function ProductCard({ p, onOpen }) {
  const [loadedKey, setLoadedKey] = useState("");

  const images = useMemo(() => {
    const raw = p?.image_url;
    if (!raw) return [];
    if (typeof raw === "string") return [raw];

    if (Array.isArray(raw)) {
      return raw
        .map((it) =>
          typeof it === "string" ? it : it?.url || it?.path || it?.src || ""
        )
        .filter(Boolean);
    }

    if (Array.isArray(p?.images)) {
      return p.images
        .map((it) => it?.url || it?.path || it?.src || "")
        .filter(Boolean);
    }

    return [];
  }, [p]);

  const cover = images[0] || "";

  const handleOpen = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onOpen) onOpen(p);
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="w-100 text-start border-0 bg-transparent p-0"
      style={{ cursor: "pointer" }}
    >
      <article className="product-card-glass h-100 d-flex flex-column">
        <div className="product-card-image">
          {cover ? (
            <img
              key={cover}
              src={cover}
              alt={p?.name || "Producto"}
              className={`pc-fade-img ${loadedKey === cover ? "is-loaded" : ""}`}
              onLoad={() => setLoadedKey(cover)}
              loading="lazy"
            />
          ) : (
            <div className="w-100 h-100" />
          )}
        </div>

        <div className="product-card-body">
          <div className="product-card-category">
            {p?.category}
          </div>
          <h3 className="product-card-title">{p?.name}</h3>
          <div className="product-card-price">
            {typeof p?.price === "number"
              ? `$${p.price.toLocaleString("es-CL")}`
              : ""}
          </div>
        </div>
      </article>
    </button>
  );
}
