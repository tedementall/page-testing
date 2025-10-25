import Hero from "../components/Hero";
import Trust from "../components/Trust";
import About from "../components/About";
import Products from "../components/Products";
import Team from "../components/Team";
import { motion } from "framer-motion";

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
      <Hero />
      <Trust />
      <About />
      <Products />
      <Team />
    </motion.main>
  );
}
