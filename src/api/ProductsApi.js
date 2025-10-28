// src/api/ProductsApi.js
import { httpCore } from "../api/http";

/* ---------------- utilidades ---------------- */

function firstImageFromAny(img, fallbackImages) {
  // img puede ser: string | [{url|path|src}] | null
  if (typeof img === "string") return img;
  if (Array.isArray(img) && img.length) {
    const f = img[0];
    if (typeof f === "string") return f;
    return f?.url || f?.path || f?.src || "";
  }
  // prueba también con images[]
  if (Array.isArray(fallbackImages) && fallbackImages.length) {
    const f = fallbackImages[0];
    if (typeof f === "string") return f;
    return f?.url || f?.path || f?.src || "";
  }
  return "";
}

// Convierte la respuesta a array:
// [] | {items|data|results|list|products} → []
function toArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return (
    payload.items ||
    payload.data ||
    payload.results ||
    payload.list ||
    payload.products ||
    []
  );
}

function sortClient(items, sort) {
  const arr = [...items];
  switch (sort) {
    case "price_asc":
      arr.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price_desc":
      arr.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "new":
    default:
      arr.sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0)
      );
  }
  return arr;
}

/* ---------------- endpoints ---------------- */

export async function fetchProducts(params = {}) {
  const query = {
    limit: params.limit ?? 100, // queremos traer TODO
    page: params.page ?? 1,
    sort: params.sort ?? "new",
    category: params.category ?? params.categoria ?? undefined,
    q: params.q || undefined,
    // NO forzamos is_featured
  };

  // Asegúrate que el proxy apunte al grupo correcto
  const res = await httpCore.get("/product", { params: query });
  const payload = res?.data ?? res;
  let items = toArray(payload).map((p) => {
    // Xano tuyo: image_url es un ARRAY de objetos {url}, a veces hay images[]
    const cover = firstImageFromAny(p.image_url, p.images);
    return { ...p, image_url: cover };
  });

  // filtros en cliente
  if (query.q) {
    const t = String(query.q).toLowerCase();
    items = items.filter(
      (p) =>
        String(p.name || "").toLowerCase().includes(t) ||
        String(p.description || "").toLowerCase().includes(t)
    );
  }
  if (query.category) {
    items = items.filter(
      (p) =>
        String(p.category || "").toLowerCase() ===
        String(query.category).toLowerCase()
    );
  }

  items = sortClient(items, query.sort);

  const total =
    payload.total ??
    payload.count ??
    payload.pagination?.total ??
    items.length;

  // Log de diagnóstico (puedes quitarlo luego)
  console.log(
    "[ProductsApi] /product → items:",
    items.length,
    "base:",
    httpCore?.defaults?.baseURL
  );

  return { items, total };
}

export async function fetchProductById(id) {
  if (!id) throw new Error("product id requerido");
  const res = await httpCore.get(`/product/${id}`);
  const p = res?.data ?? res;
  const cover = firstImageFromAny(p.image_url, p.images);
  return { ...p, image_url: cover };
}
