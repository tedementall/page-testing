import { Outlet, useLocation } from "react-router-dom";
// 1. ¡Importa los componentes de Framer Motion!
import { AnimatePresence } from "framer-motion";

/**
 * Este componente es el orquestador de las animaciones.
 * No define CÓMO se anima la página, solo CUÁNDO.
 */
export default function TransitionLayout() {
  const location = useLocation();

  return (
    // 'AnimatePresence' es el componente que "ve" cuándo 
    // un componente hijo (el Outlet) va a ser eliminado
    // y espera a que termine su animación de "salida" (exit).
    <AnimatePresence 
      mode="wait" 
      location={location} 
      key={location.pathname}
    >
      {/* 'Outlet' es el componente de React Router que renderiza 
        la página actual (Home, Login, etc.). 
        
        AnimatePresence buscará un <motion.div> dentro 
        del Outlet para animarlo.
      */}
      <Outlet />
    </AnimatePresence>
  );
}