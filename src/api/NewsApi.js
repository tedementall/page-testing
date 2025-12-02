import axios from "axios";
import { httpCore } from "./http"; // Asegúrate de importar tu httpCore antiguo

// URL base para el POST (si quieres mantenerlo separado, si no usa httpCore tmb)
const API_URL = "https://x8ki-letl-twmt.n7.xano.io/api:Ekf2eplz";

// GET: Usamos la versión ANTIGUA que sí funcionaba con httpCore
export async function fetchNews(params = {}) {
  try {
    // Esto usa tu configuración original que sí traía datos
    const { data } = await httpCore.get("/news", { params });
    
    // Mantenemos tu normalización por si acaso
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

// POST: Mantenemos tu nueva función para subir noticias
export async function createNews(formData) {
  try {
    const response = await axios.post(`${API_URL}/add_news`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al subir la noticia 💀";
    throw new Error(msg);
  }
}