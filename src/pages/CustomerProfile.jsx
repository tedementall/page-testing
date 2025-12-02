import { useEffect, useMemo, useState } from "react";
import { fetchMyProfile, updateMyProfile } from "../api/profileApi";
import { OrdersApi } from "../api/coreApi";
import { useAuth } from "../context/AuthContext";
import "../profile/CustomerProfile.css";

const EMPTY_FORM = {
  name: "",
  email: "",
  region: "",
  comuna: "",
  address_detail: "",
  profile_picture: null,
};

export default function CustomerProfile() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const profile = await fetchMyProfile();
        setForm({
          name: profile.name || "",
          email: profile.email || "",
          region: profile.region || "",
          comuna: profile.comuna || "",
          address_detail: profile.address_detail || "",
          profile_picture: profile.profile_picture || null,
        });

        if (profile?.id) {
          try {
            const orders = await OrdersApi.list(profile.id);
            setReceipts(Array.isArray(orders) ? orders : []);
          } catch (e) {
            console.error(e);
            setReceipts([]);
          }
        }
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar tu perfil. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const initials = useMemo(() => {
    if (!form.name) return "";
    return form.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  }, [form.name]);

  const avatarUrl = useMemo(() => {
    const pic = form.profile_picture;
    if (!pic) return "";
    if (typeof pic === "string") return pic;
    if (pic.url) return pic.url;
    if (pic.path) return pic.path;
    return "";
  }, [form.profile_picture]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        region: form.region,
        comuna: form.comuna,
        address_detail: form.address_detail,
      };
      await updateMyProfile(payload);
      setSuccess("Perfil actualizado correctamente.");
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-page__halo profile-page__halo--top" />
      <div className="profile-page__halo profile-page__halo--bottom" />

      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-card__header">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-halo" />
              <div className="profile-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={form.name || "Perfil"} />
                ) : (
                  <span className="profile-avatar__initials">
                    {initials || "🙂"}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-card__titles">
              <h1>Mi perfil</h1>
              <p>Gestiona tus datos personales y dirección de envío.</p>
            </div>
          </div>

          <form className="profile-form" onSubmit={onSubmit}>
            <div className="profile-form__grid">
              <div className="profile-field">
                <label htmlFor="name">Nombre completo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="region">Región</label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  value={form.region || ""}
                  onChange={onChange}
                  placeholder="Ej: Región Metropolitana"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="comuna">Comuna / Ciudad</label>
                <input
                  id="comuna"
                  name="comuna"
                  type="text"
                  value={form.comuna || ""}
                  onChange={onChange}
                  placeholder="Ej: Maipú"
                />
              </div>

              <div className="profile-field profile-field--full">
                <label htmlFor="address_detail">Dirección</label>
                <input
                  id="address_detail"
                  name="address_detail"
                  type="text"
                  value={form.address_detail || ""}
                  onChange={onChange}
                  placeholder="Calle, número, depto..."
                />
              </div>
            </div>

            <div className="profile-form__footer">
              {error && (
                <p className="profile-message profile-message--error">
                  {error}
                </p>
              )}
              {success && (
                <p className="profile-message profile-message--success">
                  {success}
                </p>
              )}

              <div className="profile-form__actions">
                <button
                  type="submit"
                  className="profile-btn"
                  disabled={saving || loading}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>

                <button
                  type="button"
                  className="logout-btn"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="history-card">
          <div className="history-card__header">
            <div>
              <h2>Historial de compras</h2>
              <p>Revisa tus boletas emitidas y el estado de tus pedidos.</p>
            </div>
          </div>

          {loading ? (
            <p className="history-empty">Cargando información...</p>
          ) : receipts.length === 0 ? (
            <p className="history-empty">
              Aún no tienes compras registradas. Cuando compres en The Hub, tus
              boletas aparecerán aquí.
            </p>
          ) : (
            <div className="history-list">
              {receipts.map((r) => {
                const date = r.created_at;
                const total = r.total_amount || 0;
                const statusText = r.status || "Completada";
                
                return (
                  <article key={r.id} className="history-item">
                    <div className="history-item__main">
                      <div className="history-item__id-row">
                        <span className="history-item__badge">Boleta</span>
                        <span className="history-item__id">#{r.id}</span>
                      </div>
                      <div className="history-item__meta">
                        <span>
                          {date
                            ? new Date(date).toLocaleDateString("es-CL")
                            : "Sin fecha"}
                        </span>
                      </div>
                    </div>

                    <div className="history-item__right">
                      <span className="history-item__total">
                        ${Number(total).toLocaleString("es-CL")}
                      </span>
                      <span
                        className={
                          "history-item__status history-item__status--" +
                          String(statusText)
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                        }
                      >
                        {statusText}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}