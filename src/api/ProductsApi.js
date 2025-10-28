// src/api/ProductsApi.js
import axios from "axios";

const CORE = "/xano-core";

// LIST/DETAIL (si ya los tienes, deja los tuyos)
export async function fetchProducts(params = {}) {
  const { data } = await axios.get(`${CORE}/product`, { params });
  return data;
}
export async function fetchProductById(id) {
  const { data } = await axios.get(`${CORE}/product/${id}`);
  return data;
}

// Paso 1: crear producto SIN imágenes (usa image_url: [])
export async function createProduct(payload) {
  const body = {
    name: payload.name?.trim(),
    description: payload.description?.trim() || "",
    price: Number(payload.price) || 0,
    stock_quantity: Number(payload.stock_quantity ?? payload.stock ?? 0),
    category: payload.category?.trim() || "", // si tu endpoint la permite vacía
    brand: payload.brand?.trim() || undefined, // si tu schema no lo acepta, bórralo
    image_url: [], // <- clave correcta en tu core
  };

  // elimina keys undefined para no gatillar validaciones
  Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

  const { data } = await axios.post(`${CORE}/product`, body);
  return data;
}

// Paso 2: subir múltiples imágenes con content[]
export async function uploadImages(files) {
  if (!files || !files.length) return [];
  const fd = new FormData();
  [...files].forEach((f) => fd.append("content[]", f));
  const { data } = await axios.post(`${CORE}/upload/image`, fd);
  return data; // array con metadatos
}

// Paso 3: vincular imágenes al producto (image_url)
export async function patchProductImages(productId, uploadedArray) {
  const body = { image_url: uploadedArray };
  const { data } = await axios.patch(`${CORE}/product/${productId}`, body);
  return data;
}

// Helper 1→2→3
export async function createProductWithImages(payload, files) {
  const created = await createProduct(payload);
  const id = created?.id;
  if (!id) throw new Error("No se recibió id de producto del Paso 1");

  const uploaded = await uploadImages(files || []);
  const updated = uploaded.length
    ? await patchProductImages(id, uploaded)
    : created;

  return { created, uploadedImages: uploaded, updated };
}
