import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "./admin/AdminSidebar";
import "./admin/admin.css";

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}               // <- cambia al cambiar la subruta
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
