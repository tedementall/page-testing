// src/api/UsersApi.js
import http from "./miniAxios"; // usa tu mismo miniAxios del proyecto

// Listar usuarios (+ filtros opcionales)
export async function fetchUsers({ page = 1, limit = 50, q, role, active } = {}) {
  const { data } = await http.get("/users", {
    params: {
      page,
      limit,
      q: q || undefined,
      role: role && role !== "todos" ? role : undefined,        // "admin" | "cliente"
      active: typeof active === "boolean" ? active : undefined, // true | false
    },
  });
  return data; // idealmente { items, total, ... }
}

// Actualizar campos (nombre, email, etc. o rol/activo)
export async function updateUser(id, patch) {
  const { data } = await http.patch(`/users/${id}`, patch);
  return data;
}

// Activar/Inactivar
export async function toggleActive(id, current) {
  return updateUser(id, { active: !current });
}

// Cambiar rol
export async function updateRole(id, role) {
  return updateUser(id, { role }); // "admin" | "cliente"
}

// Borrar
export async function deleteUser(id) {
  const { data } = await http.delete(`/users/${id}`);
  return data;
}
