import { motion } from 'framer-motion';


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
      
      <h1>¡Hola, Administrador!</h1>
      <p className="lead">Bienvenido al panel de gestión de The Hub.</p>
      
    </motion.div>
  );
}