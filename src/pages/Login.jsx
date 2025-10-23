// --- Tus imports van primero ---
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
// 1. Importamos 'motion' de framer-motion
import { motion } from "framer-motion"

// 2. Definimos las variantes de animación (puedes reusar esto en otras páginas)
const pageVariants = {
  // Estado inicial (cuando entra)
  initial: {
    opacity: 0,
    x: "-50vw" // Inicia deslizando desde la izquierda
  },
  // Estado final (cuando está "en" la pantalla)
  in: {
    opacity: 1,
    x: 0 // Termina en el centro
  },
  // Estado de salida (cuando te vas a otra página)
  out: {
    opacity: 0,
    x: "50vw" // Se va deslizando hacia la derecha
  }
}

// 3. Definimos el tipo de transición (también reusable)
const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4 // Duración de la animación en segundos
}


// --- Aquí COMIENZA tu componente ---
export default function Login() {
  
  // --- 1. Toda tu lógica va AQUÍ DENTRO ---
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(form)
      window.alert("Inicio de sesión exitoso 👋")
      navigate("/", { replace: true })
    } catch (err) {
      // Usamos err.message para mostrar el error que viene del AuthContext
      setError(err.message || "Credenciales incorrectas o error de conexión")
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- 2. Tu 'return' va AQUÍ DENTRO ---
  return (
    // 4. Reemplazamos el 'div' por 'motion.div' y añadimos las props
    <motion.div 
      className="login-hero"
      initial="initial"       // Estado inicial (definido arriba)
      animate="in"            // Estado de animación "en"
      exit="out"              // Estado de animación de "salida"
      variants={pageVariants}   // Objeto de variantes a usar
      transition={pageTransition} // Objeto de transición a usar
    > 
      <div className="form-container">
        
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Nombre de Usuario o Correo:</label>
            <input
              type="email"
              name="email"
              placeholder="Tu correo..."
              value={form.email}
              onChange={handleChange}
              required
              className="form-control" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña:</label>
            <input
              type="password"
              name="password"
              placeholder="Tu contraseña..."
              value={form.password}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-registro">
            {isSubmitting ? "Accediendo..." : "Acceder"}
          </button>
        </form>

        {error ? <p style={{ color: "red", textAlign: "center" }}>{error}</p> : null}

        <p>
          ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
        
        
      </div>
    </motion.div>
  )

} // --- 3. Aquí TERMINA tu componente 'Login' ---