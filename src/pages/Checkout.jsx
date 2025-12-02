import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCurrency } from "../utils/currency";

const pageVariants = {
  initial: { opacity: 0, x: "50vw" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "-50vw" },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4,
};

export default function CheckoutPage() {
  const location = useLocation();
  const state = location.state;

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { orderId, orderNumber, itemsPurchased, totalPaid, date } = state;

  return (
    <motion.main
      className="main-content-padding d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh", background: "#f8f9fa" }}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="container" style={{ maxWidth: "500px" }}>
        <div className="bg-white p-5 rounded-4 shadow-lg border">
          <div className="text-center mb-4">
            <div className="mb-3">
              <i className="fas fa-check-circle text-success" style={{ fontSize: "4rem" }}></i>
            </div>
            <h1 className="h3 fw-bold text-dark">¡Pago Exitoso!</h1>
            <p className="text-muted">Gracias por tu compra en The Hub.</p>
          </div>

          <div className="card border-0 bg-light p-4 rounded-3 mb-4">
            <h5 className="text-uppercase text-muted small fw-bold mb-3 border-bottom pb-2">Boleta Electrónica</h5>
            
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Fecha:</span>
              <span className="fw-bold small text-dark">{date}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Orden ID:</span>
              <span className="fw-bold small text-dark">#{orderId}</span>
            </div>
            {orderNumber && (
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted small">N° Seguimiento:</span>
              <span className="fw-bold small text-primary">#{orderNumber}</span>
            </div>
            )}

            <hr className="border-secondary opacity-25" />

            <div className="mb-3">
              {itemsPurchased && itemsPurchased.map((item, index) => (
                <div key={index} className="d-flex justify-content-between mb-1">
                  <span className="small text-muted text-truncate" style={{ maxWidth: "200px" }}>
                    {item.quantity} x {item.product?.name || "Producto"}
                  </span>
                  <span className="small fw-bold">
                    {formatCurrency((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-secondary opacity-25" />

            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark">TOTAL</span>
              <span className="fs-4 fw-bold text-success">{formatCurrency(totalPaid)}</span>
            </div>
          </div>

          <Link to="/" className="btn btn-dark w-100 py-3 rounded-3 fw-bold">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </motion.main>
  );
}