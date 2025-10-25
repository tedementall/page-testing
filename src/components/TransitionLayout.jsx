import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

export default function TransitionLayout() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" location={location} key={location.pathname}>
      <Outlet />
    </AnimatePresence>
  );
}
