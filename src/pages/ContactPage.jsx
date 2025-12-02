import { useState } from "react";

const initialForm = {
  nombre: "",
  correo: "",
  asunto: "",
  mensaje: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); 

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setStatus(null);
  }

  function validate() {
    const newErrors = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";

    if (!form.correo.trim()) {
      newErrors.correo = "El correo es obligatorio.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.correo.trim())) {
        newErrors.correo = "Ingresa un correo válido.";
      }
    }

    if (!form.asunto.trim()) newErrors.asunto = "El asunto es obligatorio.";
    if (!form.mensaje.trim())
      newErrors.mensaje = "El mensaje es obligatorio.";

    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus("error");
      return;
    }

    setTimeout(() => {
      setStatus("ok");
      setForm(initialForm);
    }, 400);
  }

  return (
    <main className="contact-page">
      <div className="contact-page-glow" />

      <div className="container">
        <section className="contact-card row g-4 align-items-stretch">
          <div className="col-12 col-lg-5 contact-copy">
            <h1>Hablemos ✨</h1>
            <p>
              ¿Tienes dudas sobre un pedido, garantía o quieres colaborar con
              The Hub? Completa el formulario y te responderemos a la brevedad.
            </p>
            <p className="contact-subcopy">
              Conectamos tu experiencia digital con productos cuidadosamente
              seleccionados y un servicio cercano.
            </p>
          </div>

          <div className="col-12 col-lg-7">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className={
                    "contact-input" +
                    (errors.nombre ? " contact-input-error" : "")
                  }
                />
                {errors.nombre && (
                  <p className="contact-error-text">{errors.nombre}</p>
                )}
              </div>

              <div className="contact-form-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="tucorreo@ejemplo.com"
                  className={
                    "contact-input" +
                    (errors.correo ? " contact-input-error" : "")
                  }
                />
                {errors.correo && (
                  <p className="contact-error-text">{errors.correo}</p>
                )}
              </div>

              <div className="contact-form-group">
                <label htmlFor="asunto">Asunto</label>
                <input
                  id="asunto"
                  name="asunto"
                  type="text"
                  value={form.asunto}
                  onChange={handleChange}
                  placeholder="Motivo del mensaje"
                  className={
                    "contact-input" +
                    (errors.asunto ? " contact-input-error" : "")
                  }
                />
                {errors.asunto && (
                  <p className="contact-error-text">{errors.asunto}</p>
                )}
              </div>

              <div className="contact-form-group">
                <label htmlFor="mensaje">Mensaje</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows="4"
                  value={form.mensaje}
                  onChange={handleChange}
                  placeholder="Cuéntanos en qué te podemos ayudar"
                  className={
                    "contact-input contact-textarea" +
                    (errors.mensaje ? " contact-input-error" : "")
                  }
                />
                {errors.mensaje && (
                  <p className="contact-error-text">{errors.mensaje}</p>
                )}
              </div>

              <button type="submit" className="contact-submit-btn">
                Enviar mensaje
              </button>

              {status === "ok" && (
                <p className="contact-feedback contact-feedback-success">
                  Tu mensaje se envió. ¡Gracias por escribirnos!
                </p>
              )}

              {status === "error" && (
                <p className="contact-feedback contact-feedback-error">
                  Revisa los campos marcados antes de enviar.
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
