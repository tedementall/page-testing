import { useState } from "react";

export default function Login() {
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí se manejaría el envío real del formulario cuando se integre la autenticación.
  };

  return (
    <section className="login-hero">
      <div className="form-container">
        <h2 className="text-center mb-4">Inicio de Sesión</h2>
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
          <button type="submit" className="btn-registro">
            Acceder
          </button>
        </form>
        <p>
          ¿No tienes una cuenta? <a href="#registro">Regístrate aquí</a>
        </p>
      </div>
    </section>
  );
}
