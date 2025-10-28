// src/pages/Home.jsx
import { motion } from "framer-motion";

import Hero from "../components/Hero";
import Trust from "../components/Trust";
import About from "../components/About";
import Products from "../components/Products";
import Team from "../components/Team";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4,
};

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
      <section id="home">
        <Hero />
      </section>

      <Trust />

      <section id="nosotros">
        <About />
      </section>

      {/* Favoritos del home: 6 productos + botón para ver catálogo */}
      <section id="productos">
        <Products
          limit={6}
          showCTA={true}
          // params={{ is_featured: true }}
          title="Nuestros favoritos"
          subtitle="Curamos colecciones limitadas de accesorios premium para dispositivos móviles, gamers y creadores. Haz clic en cualquiera para descubrir más detalles."
        />
      </section>

      <section id="equipo">
        <Team />
      </section>
    </motion.main>
  );
}
