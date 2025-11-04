// src/admin/UsersAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchUsers, deleteUser, toggleActive, updateRole, updateUser } from "../api/UsersApi";

const norm = (v) => String(v || "").trim().toLowerCase();
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function UsersAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros UI
  const [q, setQ] = useState("");
  const [role, setRole] = useState("todos");   // todos | admin | cliente
  const [active, setActive] = useState("todos"); // todos | activos | inactivos
  const [sort, setSort] = useState("newest");  // newest | name | email
  const [workingId, setWorkingId] = useState(null);

  async function load() {
    setLoading(true); setErr("");
    try {
      const data = await fetchUsers({ page: 1, limit: 200 });
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      console.error("[UsersAdmin] load error:", e?.response?.data || e);
      setErr(e?.message || "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    let list = items;

    if (q) {
      const s = norm(q);
      list = list.filter(
        (u) =>
          norm(u.name).includes(s) ||
          norm(u.email).includes(s) ||
          norm(u.id).includes(s)
      );
    }
    if (role !== "todos") list = list.filter((u) => norm(u.role) === norm(role));
    if (active !== "todos") {
      const want = active === "activos";
      list = list.filter((u) => !!u.active === want);
    }

    if (sort === "name") list = [...list].sort((a,b) => norm(a.name).localeCompare(norm(b.name)));
    else if (sort === "email") list = [...list].sort((a,b) => norm(a.email).localeCompare(norm(b.email)));
    else list = [...list].sort((a,b) => (b.id ?? 0) - (a.id ?? 0));

    return list;
  }, [items, q, role, active, sort]);

  async function onToggleActive(u) {
    setWorkingId(u.id);
    const prev = items;
    setItems((xs) => xs.map(x => x.id === u.id ? { ...x, active: !x.active } : x));
    try { await toggleActive(u.id, u.active); }
    catch (e) { setItems(prev); alert("No se pudo cambiar estado"); }
    finally { setWorkingId(null); }
  }

  async function onChangeRole(u, newRole) {
    if (newRole === u.role) return;
    setWorkingId(u.id);
    const prev = items;
    setItems((xs) => xs.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    try { await updateRole(u.id, newRole); }
    catch (e) { setItems(prev); alert("No se pudo cambiar el rol"); }
    finally { setWorkingId(null); }
  }

  async function onDelete(u) {
    if (!window.confirm(`¿Borrar a ${u.name || u.email}?`)) return;
    setWorkingId(u.id);
    const prev = items;
    setItems(xs => xs.filter(x => x.id !== u.id));
    try { await deleteUser(u.id); }
    catch (e) { setItems(prev); alert("No se pudo borrar el usuario"); }
    finally { setWorkingId(null); }
  }

  // edición súper simple con prompt (rápido y sin modal extra)
  async function onQuickEdit(u) {
    const name = window.prompt("Nombre", u.name || "");
    if (name === null) return;
    const email = window.prompt("Email", u.email || "");
    if (email === null) return;

    setWorkingId(u.id);
    const prev = items;
    setItems(xs => xs.map(x => x.id === u.id ? { ...x, name, email } : x));
    try { await updateUser(u.id, { name, email }); }
    catch (e) { setItems(prev); alert("No se pudo actualizar"); }
    finally { setWorkingId(null); }
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Usuarios</h2>
        <button className="btn btn-outline-light" onClick={load} disabled={loading}>
          {loading ? "Cargando…" : "Refrescar"}
        </button>
      </div>

      {/* Filtros */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Buscar por nombre, email o id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="todos">Rol: Todos</option>
            <option value="admin">Admin</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={active} onChange={(e) => setActive(e.target.value)}>
            <option value="todos">Estado: Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Más nuevos</option>
            <option value="name">Nombre</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      {loading && <div className="alert alert-info">Cargando usuarios…</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      {!loading && !err && visible.length === 0 && (
        <div className="alert alert-secondary">No hay usuarios.</div>
      )}

      {/* Tabla */}
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 64 }}>Avatar</th>
              <th>Nombre</th>
              <th>Email</th>
              <th style={{ width: 120 }}>Rol</th>
              <th style={{ width: 120 }}>Estado</th>
              <th style={{ width: 140 }}>Creado</th>
              <th style={{ width: 220 }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(u => (
              <tr key={u.id}>
                <td>
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 999 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 999, background: "#666", display:"grid", placeItems:"center" }}>
                      <span className="small">{(u.name?.[0] || u.email?.[0] || "?").toUpperCase()}</span>
                    </div>
                  )}
                </td>
                <td className="fw-semibold">{u.name || "—"}</td>
                <td className="text-muted">{u.email || "—"}</td>
                <td className="text-capitalize">{u.role || "cliente"}</td>
                <td>
                  <span className={`badge ${u.active ? "bg-success" : "bg-secondary"}`}>
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString("es-CL") : "—"}</td>
                <td className="text-end">
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => onQuickEdit(u)}
                      disabled={workingId === u.id}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => onChangeRole(u, u.role === "admin" ? "cliente" : "admin")}
                      disabled={workingId === u.id}
                      title="Cambiar rol"
                    >
                      {u.role === "admin" ? "Hacer cliente" : "Hacer admin"}
                    </button>
                    <button
                      className={`btn btn-sm ${u.active ? "btn-outline-danger" : "btn-outline-success"}`}
                      onClick={() => onToggleActive(u)}
                      disabled={workingId === u.id}
                    >
                      {u.active ? "Inactivar" : "Activar"}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onDelete(u)}
                      disabled={workingId === u.id}
                    >
                      Borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
