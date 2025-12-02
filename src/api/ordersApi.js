import { getToken } from "../api/http";

const XANO_CORE_BASE =
  import.meta.env.VITE_XANO_CORE_BASE ??
  "https://x8ki-letl-twmt.n7.xano.io/api:MJq6ok-f";

function getAuthHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("No hay token de autenticación. Inicia sesión.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchOrders() {
  const url = `${XANO_CORE_BASE}/order`;

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error cargando órdenes: ${res.status} - ${text}`);
  }

  return res.json(); 
}

export async function updateOrderStatus(orderId, newStatus) {
  const url = `${XANO_CORE_BASE}/order/${orderId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error actualizando estado: ${res.status} - ${text}`);
  }

  return res.json();
}
