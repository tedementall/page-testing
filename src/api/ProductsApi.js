// src/api/ProductsApi.js
import { httpCore } from "./http"; // tu cliente con baseURL "/xano-core"

const ENDPOINT = "/product";
const UPLOAD_ENDPOINT = "/upload/image";

/* ============================
 * Helpers de normalización
 * ============================ */
const norm = (v) => String(v ?? "").trim();
const normLower = (v) => norm(v).toLowerCase();

function normalizeImages(p) {
  const raw = p?.image_url ?? p?.images ?? [];
  if (!raw) return [];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) {
    return raw
      .map((it) => (typeof it === "string" ? it : it?.url || it?.path || ""))
      .filter(Boolean);
  }
  return [];
}

function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    id: p.id,
    name: p.name || "",
    description: p.description || "",
    price: Number(p.price) || 0,
    stock_quantity: Number(p.stock_quantity ?? p.stock ?? 0),
    category: normLower(p.category ?? p.categoria ?? ""),
    brand: p.brand || "",
    image_url: normalizeImages(p),
    created_at: p.created_at || p.createdAt || null,
  };
}

/* ============================
 * Listado
 * ============================ */
export async function fetchProducts(params = {}) {
  try {
    const query = {};
    if (params.limit != null) query.limit = params.limit;
    if (params.page != null) query.page = params.page;
    if (params.sort) query.sort = params.sort;

    // categoría: si viene "Todas" no la mandamos
    const cat = params.category ?? params.categoria;
    if (cat && normLower(cat) !== "todas") query.category = normLower(cat);

    if (params.q) query.q = params.q;
    if (typeof params.is_featured === "boolean") query.is_featured = params.is_featured;

    const res = await httpCore.get(ENDPOINT, { params: query });
    const rawData = res?.data;

    const list = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.items)
      ? rawData.items
      : [];

    const items = list.map(normalizeProduct).filter(Boolean);

    return {
      items,
      total: Number(rawData?.total ?? items.length),
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 12),
    };
  } catch (error) {
    console.error("[ProductsApi] fetchProducts error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

/* ============================
 * Detalle
 * ============================ */
export async function fetchProductById(id) {
  try {
    const res = await httpCore.get(`${ENDPOINT}/${id}`);
    return normalizeProduct(res?.data ?? {});
  } catch (error) {
    console.error(`[ProductsApi] fetchProductById ${id} error:`, error);
    throw error;
  }
}

/* ============================
 * Crear (sin imágenes)
 * ============================ */
export async function createProduct(payload) {
  const body = {
    name: norm(payload.name),
    description: norm(payload.description) || "",
    price: Number(payload.price) || 0,
    stock_quantity: Number(payload.stock_quantity ?? payload.stock ?? 0),
    category: normLower(payload.category || ""),
    brand: norm(payload.brand || ""),
    image_url: [], // se llenará luego con PATCH
  };

  // limpia vacíos/undefined
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined || body[k] === "") delete body[k];
  });

  try {
    const res = await httpCore.post(ENDPOINT, body);
    return normalizeProduct(res?.data);
  } catch (error) {
    console.error("[ProductsApi] createProduct error:", error);
    throw error;
  }
}

/* ============================
 * Subir imágenes (multipart)
 *  - sin headers manuales para evitar preflight
 * ============================ */
export async function uploadImages(files) {
  if (!files || !files.length) return [];
  const fd = new FormData();
  [...files].forEach((f) => fd.append("content[]", f));
  try {
    const res = await httpCore.post(UPLOAD_ENDPOINT, fd);
    return res?.data || [];
  } catch (error) {
    console.error("[ProductsApi] uploadImages error:", error);
    throw error;
  }
}

/* ============================
 * Vincular imágenes al producto
 * ============================ */
export async function patchProductImages(productId, uploadedArray) {
  try {
    const res = await httpCore.patch(`${ENDPOINT}/${productId}`, {
      image_url: uploadedArray,
    });
    return normalizeProduct(res?.data);
  } catch (error) {
    console.error("[ProductsApi] patchProductImages error:", error);
    throw error;
  }
}

/* ============================
 * Crear + subir imágenes (helper)
 * ============================ */
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

/* ============================
 * Actualizar producto
 * ============================ */
export async function updateProduct(productId, payload) {
  if (!productId) throw new Error("Falta productId");
  
  const body = {};
  
  // Solo incluir campos que se enviaron
  if (payload.name !== undefined) body.name = norm(payload.name);
  if (payload.description !== undefined) body.description = norm(payload.description);
  if (payload.price !== undefined) body.price = Number(payload.price) || 0;
  if (payload.stock_quantity !== undefined) body.stock_quantity = Number(payload.stock_quantity);
  if (payload.stock !== undefined) body.stock_quantity = Number(payload.stock);
  if (payload.category !== undefined) body.category = normLower(payload.category);
  if (payload.brand !== undefined) body.brand = norm(payload.brand);
  if (payload.image_url !== undefined) body.image_url = payload.image_url;
  
  try {
    const res = await httpCore.patch(`${ENDPOINT}/${productId}`, body);
    console.log("[ProductsApi] updateProduct success:", res?.data);
    return normalizeProduct(res?.data);
  } catch (error) {
    console.error("[ProductsApi] updateProduct error:", error);
    throw error;
  }
}

/* ============================
 * Actualizar + subir nuevas imágenes
 * ============================ */
export async function updateProductWithImages(productId, payload, files) {
  // 1. Actualizar datos básicos
  const updated = await updateProduct(productId, payload);
  
  // 2. Si hay archivos nuevos, subirlos
  if (files && files.length > 0) {
    const uploaded = await uploadImages(files);
    
    // 3. Combinar con imágenes existentes (si quieres mantenerlas)
    const existingImages = payload.keepExistingImages 
      ? (updated.image_url || [])
      : [];
    
    const allImages = [...existingImages, ...uploaded];
    
    // 4. Actualizar las imágenes
    const final = await patchProductImages(productId, allImages);
    return final;
  }
  
  return updated;
}

/* ============================
 * Borrar producto
 * ============================ */
export async function deleteProduct(productId) {
  if (!productId) throw new Error("Falta productId");
  try {
    const { data } = await httpCore.delete(`${ENDPOINT}/${productId}`);
    return data; // Xano puede devolver el registro eliminado o {success:true}
  } catch (error) {
    console.error("[ProductsApi] deleteProduct error:", error);
    throw error;
  }
}