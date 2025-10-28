// src/services/productsStore.js
import { fetchProducts } from "../api/ProductsApi";

// Cache simple en memoria para toda la app
const store = {
  data: null,
  inflight: null,
  ts: 0,
};

// Carga 1 vez (o devuelve lo ya cargado)
export async function loadProductsOnce({ force = false } = {}) {
  if (store.data && !force) return store.data;
  if (store.inflight) return store.inflight;

  store.inflight = (async () => {
    const { items } = await fetchProducts({ limit: 100, page: 1, sort: "new" });
    store.data = items || [];
    store.ts = Date.now();
    store.inflight = null;
    return store.data;
  })();

  return store.inflight;
}

// Acceso directo a lo que haya en cache (puede ser null)
export function getCachedProducts() {
  return store.data;
}
