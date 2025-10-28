// src/api/ProductsApi.js
import { httpCore } from "./http"; // USA TU INSTANCIA CONFIGURADA

const ENDPOINT = "/product";
const UPLOAD_ENDPOINT = "/upload/image";

// ============================================
// NORMALIZACIÓN (CRÍTICO)
// ============================================
function normalizeImages(p) {
  const raw = p?.image_url ?? p?.images ?? [];
  if (!raw) return [];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) {
    return raw.map(it => 
      typeof it === "string" ? it : (it?.url || it?.path || "")
    ).filter(Boolean);
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
    stock_quantity: p.stock_quantity ?? p.stock ?? 0,
    category: p.category ?? p.categoria ?? "",
    brand: p.brand || "",
    image_url: normalizeImages(p),
    created_at: p.created_at || p.createdAt || null,
  };
}

// ============================================
// FETCH PRODUCTS (CON NORMALIZACIÓN)
// ============================================
export async function fetchProducts(params = {}) {
  try {
    console.log("[ProductsApi] Fetching products with params:", params);
    
    const query = {};
    if (params.limit != null) query.limit = params.limit;
    if (params.page != null) query.page = params.page;
    if (params.sort) query.sort = params.sort;
    if (params.category ?? params.categoria) {
      query.category = params.category ?? params.categoria;
    }
    if (params.q) query.q = params.q;
    if (typeof params.is_featured === "boolean") {
      query.is_featured = params.is_featured;
    }

    const res = await httpCore.get(ENDPOINT, { params: query });
    const rawData = res?.data;

    console.log("[ProductsApi] Raw response:", rawData);

    // XANO puede devolver { items: [...] } o directamente [...]
    const list = Array.isArray(rawData) 
      ? rawData 
      : Array.isArray(rawData?.items) 
        ? rawData.items 
        : [];

    console.log("[ProductsApi] Products found:", list.length);

    const items = list.map(normalizeProduct).filter(Boolean);

    return {
      items,
      total: rawData?.total ?? items.length,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 12),
    };
  } catch (error) {
    console.error("[ProductsApi] Error fetching products:", error);
    console.error("[ProductsApi] Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

// ============================================
// FETCH SINGLE PRODUCT
// ============================================
export async function fetchProductById(id) {
  try {
    const res = await httpCore.get(`${ENDPOINT}/${id}`);
    const p = res?.data ?? {};
    return normalizeProduct(p);
  } catch (error) {
    console.error(`[ProductsApi] Error fetching product ${id}:`, error);
    throw error;
  }
}

// ============================================
// CREATE PRODUCT (SIN IMÁGENES)
// ============================================
export async function createProduct(payload) {
  const body = {
    name: payload.name?.trim(),
    description: payload.description?.trim() || "",
    price: Number(payload.price) || 0,
    stock_quantity: Number(payload.stock_quantity ?? payload.stock ?? 0),
    category: payload.category?.trim() || "",
    brand: payload.brand?.trim() || "",
    image_url: [],
  };

  // Elimina keys undefined
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined || body[k] === "") delete body[k];
  });

  try {
    const res = await httpCore.post(ENDPOINT, body);
    return normalizeProduct(res?.data);
  } catch (error) {
    console.error("[ProductsApi] Error creating product:", error);
    throw error;
  }
}

// ============================================
// UPLOAD IMAGES
// ============================================
export async function uploadImages(files) {
  if (!files || !files.length) return [];
  
  const fd = new FormData();
  [...files].forEach((f) => fd.append("content[]", f));

  try {
    const res = await httpCore.post(UPLOAD_ENDPOINT, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data || [];
  } catch (error) {
    console.error("[ProductsApi] Error uploading images:", error);
    throw error;
  }
}

// ============================================
// PATCH PRODUCT IMAGES
// ============================================
export async function patchProductImages(productId, uploadedArray) {
  const body = { image_url: uploadedArray };
  
  try {
    const res = await httpCore.patch(`${ENDPOINT}/${productId}`, body);
    return normalizeProduct(res?.data);
  } catch (error) {
    console.error("[ProductsApi] Error patching images:", error);
    throw error;
  }
}

// ============================================
// HELPER: CREATE WITH IMAGES
// ============================================
export async function createProductWithImages(payload, files) {
  const created = await createProduct(payload);
  const id = created?.id;
  
  if (!id) {
    throw new Error("No se recibió id de producto del Paso 1");
  }

  const uploaded = await uploadImages(files || []);
  const updated = uploaded.length
    ? await patchProductImages(id, uploaded)
    : created;

  return { 
    created, 
    uploadedImages: uploaded, 
    updated 
  };
}