import Hero from "../components/Hero"
import Trust from "../components/Trust"
import About from "../components/About"
import Products from "../components/Products"
import Team from "../components/Team"
import { motion } from "framer-motion"

// --- INICIO DEL CAMBIO ---
// Cambiamos las variantes para que solo hagan "fade" y no "slide"
const pageVariants = {
  // Estado inicial (cuando entra)
  initial: {
    opacity: 0 // Inicia completamente invisible
  },
  // Estado final (cuando está "en" la pantalla)
  in: {
    opacity: 1 // Termina 100% visible
  },
  // Estado de salida (cuando te vas a otra página)
  out: {
    opacity: 0 // Se va volviendo invisible
  }
}
// --- FIN DEL CAMBIO ---

// La transición sigue siendo la misma
const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4 // Duración de la animación en segundos
}


export default function Home() {
  return (
    <motion.main 
      className="main-content-padding"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Hero />
      <Trust />
      <About />
      <Products />
      <Team />
    </motion.main>
  )
}