import { getToken } from '../api/http';

const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:MJq6ok-f";

function getAuthHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("No se encontró token de autenticación. Inicia sesión para crear una orden.");
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

async function getAuthenticatedData(endpoint) {
  const url = `${XANO_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      let errorDetails = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || JSON.stringify(errorData);
      } catch {}
      throw new Error(`Error al obtener datos de ${endpoint}. Xano dice: ${errorDetails}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en getAuthenticatedData (${endpoint}):`, error);
    throw error;
  }
}

export async function getUserProfile() {
  return getAuthenticatedData('/auth/me');
}

export async function createOrder(totalAmount, items, userId, addressId) {
  // CORRECCIÓN 1: Usamos la ruta "/order" (igual que en Kotlin @POST("order"))
  // Usamos el grupo 'Ekf2eplz' que mencionaste.
  const url = "https://x8ki-letl-twmt.n7.xano.io/api:Ekf2eplz/order";

  // Mapeamos los items
  const formattedItems = items.map(item => ({
    product_id: item.product_id || item.product.id,
    quantity: item.quantity,
  }));

  // CORRECCIÓN 2: Ajustamos el JSON para que coincida con tu 'CreateOrderRequest' de Kotlin
  // Kotlin pide: address_id, total_amount, status, user_id, items.
  const payload = {
    address_id: addressId,
    total_amount: totalAmount,
    status: "por confirmar", // Agregamos status (Kotlin lo pide)
    user_id: userId,
    items: formattedItems, // Cambiamos 'order_items' por 'items'
  };

  console.log("🚀 Enviando a:", url);
  console.log("📦 Payload:", JSON.stringify(payload));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetails = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || JSON.stringify(errorData);
      } catch {}

      throw new Error(`Error al crear la orden. Xano dice: ${errorDetails}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createOrder:", error);
    throw error;
  }
}

export async function getUserAddresses() {
  return getAuthenticatedData('/user/addresses');
}