import React from 'react';
import { motion } from 'framer-motion';

// --- 1. Configuración de Animaciones (Framer Motion) ---

// Animación general de la página (la que ya tenías)
const pageVariants = {
  initial: { opacity: 0, y: -20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: 20 }
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.4
};

// Animación para el contenedor de las tarjetas (para que aparezcan en cascada)
const containerVariants = {
  in: {
    transition: {
      staggerChildren: 0.15 // Retraso entre la aparición de cada hijo
    }
  }
};

// Animación individual para cada tarjeta
const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  in: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};


// --- 2. Datos de Ejemplo (Mocks) ---
// En un futuro, esto vendría de tu API
const statsData = [
  { 
    id: 1, 
    title: "Ventas Totales", 
    value: "$4,520,000", 
    trend: "+12.5% este mes",
    icon: "💰", 
    haloColor: "rgba(244, 114, 182, 0.5)" // Rosa
  },
  { 
    id: 2, 
    title: "Órdenes Activas", 
    value: "145", 
    trend: "32 pendientes",
    icon: "📦", 
    haloColor: "rgba(59, 130, 246, 0.5)" // Azul
  },
  { 
    id: 3, 
    title: "Usuarios Nuevos", 
    value: "3,890", 
    trend: "+240 esta semana",
    icon: "👥", 
    haloColor: "rgba(167, 139, 250, 0.5)" // Violeta
  },
  { 
    id: 4, 
    title: "Productos en Stock", 
    value: "450", 
    trend: "12 sin stock",
    icon: "🏷️", 
    haloColor: "rgba(251, 146, 60, 0.5)" // Naranja
  }
];


// --- 3. Componente Principal ---
export default function Dashboard() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="admin-content fade-in" // Usamos tus clases base
      style={{ padding: '2rem' }}
    >
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ¡Hola, Administrador!
        </h1>
        <p className="lead" style={{ opacity: 0.8, fontSize: '1.1rem' }}>
          Aquí tienes un resumen de lo que sucede hoy en The Hub.
        </p>
      </div>

      {/* Grid de Tarjetas con Glassmorphism y Halos */}
      <motion.div 
        variants={containerVariants} // Aplicamos la cascada
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.5rem'
        }}
      >
        {statsData.map((stat) => (
          <motion.div
            key={stat.id}
            variants={cardVariants} // Animación individual
            className="glass" // ¡Usamos tu clase CSS existente!
            style={{
              padding: '1.5rem',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden', // Importante para contener el halo
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'default',
            }}
            whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.05)' }} // Efecto hover sutil
          >
            
            {/* EL HALO (Orbe de luz difuminada en el fondo) */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: `radial-gradient(circle, ${stat.haloColor} 0%, rgba(0,0,0,0) 70%)`,
              filter: 'blur(60px)',
              opacity: 0.6,
              zIndex: 0, // Detrás del contenido
              pointerEvents: 'none'
            }}></div>

            {/* Contenido de la tarjeta (por delante del halo) */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                 <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, margin: '0 0 0.5rem 0' }}>
                   {stat.title}
                 </h3>
                 <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                   {stat.value}
                 </div>
                 <p style={{ fontSize: '0.85rem', marginTop: '0.8rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: '#4ade80', fontSize: '1rem' }}>↑</span> {stat.trend}
                 </p>
              </div>
              
              <div style={{ 
                fontSize: '2.5rem', 
                background: 'rgba(255,255,255,0.1)', 
                width: '60px', height: '60px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                borderRadius: '16px',
                boxShadow: 'inset 0 0 15px rgba(255,255,255,0.05)'
              }}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Espacio para futuras secciones (ej: Gráficos) */}
      <motion.div variants={cardVariants} className="glass" style={{ marginTop: '2rem', padding: '2rem', borderRadius: '20px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.7 }}>
         <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</span>
         <h3>Próximamente: Gráficos de Rendimiento</h3>
         <p>Espacio reservado para analíticas detalladas.</p>
      </motion.div>
      
    </motion.div>
  );
}