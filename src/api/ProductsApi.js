import { httpCore } from "../api/http";

const ENDPOINT = "/product";

function normalizeImages(p) {
  // Acepta image_url: [{url|path}] | images: [{url|path}] | string[]
  const raw = p?.image_url ?? p?.images ?? [];
  if (!raw) return [];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) {
    return raw.map(it => typeof it === "string" ? it : (it?.url || it?.path || "")).filter(Boolean);
  }
  return [];
}

export async function fetchProducts(params = {}) {
  const query = {};
  if (params.limit != null) query.limit = params.limit;
  if (params.page  != null) query.page  = params.page;
  if (params.sort)          query.sort  = params.sort;
  if (params.category ?? params.categoria)
    query.category = params.category ?? params.categoria;
  if (params.q) query.q = params.q;
  if (typeof params.is_featured === "boolean") query.is_featured = params.is_featured;

  const res = await httpCore.get(ENDPOINT, { params: query });
  const data = res?.data;

  const list = Array.isArray(data) ? data : [];
  const items = list.map(p => ({
    ...p,
    // normaliza diferencias de schema
    image_url: normalizeImages(p),              // para el ProductCard (galería)
    stock_quantity: p.stock_quantity ?? p.stock ?? null,
    category: p.category ?? p.categoria ?? "",
  }));

  return {
    items,
    total: items.length,
    page: Number(query.page ?? 1),
    limit: Number(query.limit ?? 12),
  };
}

export async function fetchProductById(id) {
  const res = await httpCore.get(`${ENDPOINT}/${id}`);
  const p = res?.data ?? {};
  return {
    ...p,
    image_url: normalizeImages(p),
    stock_quantity: p.stock_quantity ?? p.stock ?? null,
    category: p.category ?? p.categoria ?? "",
  };
}
