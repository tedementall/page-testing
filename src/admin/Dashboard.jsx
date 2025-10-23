// src/admin/Dashboard.jsx

import { motion } from 'framer-motion';

// Definimos las animaciones de 'fade'
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4
};

export default function Dashboard() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* Esto es lo ÚNICO que debe estar en este archivo.
          No debe haber ningún <Header /> o <img> aquí. */}
      <h1>¡Hola, Administrador!</h1>
      <p className="lead">Bienvenido al panel de gestión de The Hub.</p>
      
    </motion.div>
  );
}