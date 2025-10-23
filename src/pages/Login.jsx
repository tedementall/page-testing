import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error } = useAuth();

  const redirectPath = useMemo(() => {
    const fromState = location.state?.from;
    if (typeof fromState === "string" && fromState && fromState !== "/login") {
      return fromState;
    }
    return "/";
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await login({ identifier: credentials.identifier, password: credentials.password });
    } catch (submitError) {
      setLocalError(submitError.message ?? "No pudimos iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedback = localError || error;

  return (
    <section className="login-hero">
      <div className="form-container">
        <h2 className="text-center mb-4">Inicio de Sesión</h2>
        {feedback ? (
          <div className="alert alert-danger" role="alert">
            {feedback}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div className="form-group">
            <label htmlFor="login-identifier" className="form-label">
              Nombre de Usuario o Correo
            </label>
            <input
              id="login-identifier"
              type="text"
              name="identifier"
              className="form-control"
              placeholder="Tu nombre o correo..."
              value={credentials.identifier}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              className="form-control"
              placeholder="Tu contraseña..."
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn-registro" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? "Accediendo..." : "Acceder"}
          </button>
        </form>
        <p>
          ¿No tienes una cuenta? <a href="#registro">Regístrate aquí</a>
        </p>
      </div>
    </section>
  );
}
