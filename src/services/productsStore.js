// src/services/productsStore.js
import { fetchProducts } from "../api/ProductsApi";

const store = { data: null, inflight: null };

export async function loadProductsOnce({ force = false } = {}) {
  if (store.data && !force) return store.data;
  if (store.inflight) return store.inflight;

  store.inflight = (async () => {
    const { items } = await fetchProducts({ limit: 100, page: 1, sort: "new" });
    store.data = items ?? [];
    store.inflight = null;
    console.log("[productsStore] cached items:", store.data.length);
    return store.data;
  })();

  return store.inflight;
}

export function getCachedProducts() {
  return store.data;
}
