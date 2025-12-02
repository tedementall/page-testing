import { useEffect, useMemo, useState } from "react";
import { fetchOrders, updateOrderStatus } from "../api/ordersApi";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "por confirmar", label: "Por confirmar" },
  { value: "confirmado", label: "Confirmado" },
  { value: "en local", label: "En local" },
  { value: "en transporte", label: "En transporte" },
  { value: "enviado", label: "Enviado" },
  { value: "finalizado", label: "Finalizado" }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        filterStatus === "todos" || order.status === filterStatus;

      const matchId =
        !searchId.trim() ||
        String(order.id).toLowerCase().includes(searchId.trim().toLowerCase());

      return matchStatus && matchId;
    });
  }, [orders, filterStatus, searchId]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      setSavingId(orderId);
      setError("");
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
      );
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado");
    } finally {
      setSavingId(null);
    }
  }

  const clearFilters = () => {
    setFilterStatus("todos");
    setSearchId("");
  };

  return (
    <div className="orders-page fade-in">
      <header className="orders-header">
        <h1>Órdenes</h1>
        <p>Revisa y actualiza el estado de las órdenes de los clientes.</p>
      </header>

      {/* --- BARRA DE FILTROS --- */}
      <div className="glass-filter-bar">
        <input
          type="text"
          placeholder="Buscar por ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ maxWidth: "300px" }}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
             <button className="btn-glass-white" onClick={loadOrders} title="Recargar">
                <i className="bi bi-arrow-clockwise"></i> Refrescar
            </button>
            {(filterStatus !== "todos" || searchId) && (
                <button className="btn-glass-white" onClick={clearFilters}>
                Limpiar
                </button>
            )}
        </div>
      </div>

      {error && <div className="alert alert-danger glass" style={{color: '#ff8585'}}>{error}</div>}

      {loading ? (
        <div className="orders-loading text-center p-5">Cargando órdenes...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty text-center p-5 glass">No hay órdenes con esos filtros.</div>
      ) : (
        /* --- TABLA GLASS --- */
        <div className="table-responsive glass">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Número de orden</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>

                  <td>
                    {order.created_at // Ojo: tu JSON usa created_at, no order_date
                      ? new Date(order.created_at).toLocaleDateString("es-CL") + " " + new Date(order.created_at).toLocaleTimeString("es-CL", {hour: '2-digit', minute:'2-digit'})
                      : "-"}
                  </td>

                  {/* --- AQUÍ USAMOS TUS NUEVOS CAMPOS PLANOS --- */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>
                         {order.user_name || `Usuario #${order.user_id}`}
                      </span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                         {order.user_email || "Sin email"}
                      </span>
                    </div>
                  </td>

                  <td style={{ fontWeight: "bold", color: "#a5b4fc" }}>
                    $
                    {(order.total_amount || 0)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  </td>

                  <td>
                    <select
                      className="form-select"
                      style={{ 
                          height: "35px !important", 
                          padding: "0 30px 0 10px !important",
                          fontSize: "0.85rem",
                          backgroundColor: "rgba(0,0,0,0.3) !important",
                          border: "1px solid rgba(255,255,255,0.2)"
                      }}
                      value={order.status || ""}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={savingId === order.id}
                    >
                      {STATUS_OPTIONS.filter((s) => s.value !== "todos").map(
                        (opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}