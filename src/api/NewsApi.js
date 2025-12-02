const API_URL = "https://x8ki-letl-twmt.n7.xano.io/api:Ekf2eplz";

export async function createNews(formData) {
  try {
    
    const response = await fetch(`${API_URL}/add_news`, {
      method: "POST",
      body: formData, 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al subir noticia:", error);
    throw error;
  }
}

import { httpCore } from "./http";
export async function fetchNews(params = {}) {
  const { data } = await httpCore.get("/news", { params });
  if (Array.isArray(data)) return data;
  if (data?.items) return data.items;
  return [];
}