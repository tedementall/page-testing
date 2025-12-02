// src/pages/Payment.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency";
import { createOrder } from "../services/apiService";
import { fetchMyProfile } from "../api/profileApi";
import { useAuth } from "../context/AuthContext";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.4,
};

export default function PaymentPage() {
  const navigate = useNavigate();
  
  // FIX 1: Protegemos la función clearCart por si el contexto no la entrega bien
  const { items, totalPrice, clearCart } = useCart();
  const safeClearCart = typeof clearCart === 'function' ? clearCart : () => console.warn("clearCart no disponible");

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  // Dirección del perfil
  const [profileAddress, setProfileAddress] = useState(null);
  const [isCheckingAddress, setIsCheckingAddress] = useState(true);

  // Datos de pago
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "4242424242424242",
    cardHolder: user?.name || "",
    expiryDate: "12/26",
    cvv: "123",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Chequeo de dirección al cargar (Lógica ORIGINAL restaurada)
  useEffect(() => {
    async function checkAddress() {
      if (!isAuthenticated || !userId) return;

      try {
        setIsCheckingAddress(true);
        // Usamos tu fetch original sin validaciones agresivas de 401
        const profile = await fetchMyProfile();

        if (profile && profile.address_detail && profile.comuna) {
          setProfileAddress(profile);
        } else {
          // Solo alertamos si realmente faltan datos, no bloqueamos por errores de red raros
          console.warn("Perfil incompleto o sin dirección");
        }
      } catch (e) {
        console.error("Error validando dirección (no bloqueante):", e);
        // Quitamos el setError aquí para que no muestre el mensaje rojo gigante si falla silenciosamente
      } finally {
        setIsCheckingAddress(false);
      }
    }

    if (!isAuthLoading) {
      checkAddress();
    }
  }, [isAuthenticated, userId, isAuthLoading]); // Quitamos navigate de las dependencias para evitar loops

  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFinalizeOrder = async (e) => {
    e.preventDefault();

    if (totalPrice <= 0) {
      setError("El total no puede ser cero.");
      return;
    }

    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 16) {
      setError("Revisa el número de tarjeta.");
      return;
    }

    // Validación suave: si no cargó la dirección, intentamos usar el ID del usuario como fallback o avisamos
    if (!profileAddress?.id) {
       setError("No se detectó una dirección de envío. Intenta recargar la página.");
       return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // FIX 2: Enviamos todos los argumentos que Xano y Kotlin esperan
      // (total, items, userId, addressId)
      const orderData = await createOrder(totalPrice, items, userId, profileAddress.id);

      // Usamos el clearCart seguro
      safeClearCart();

      // Navegamos al checkout
      navigate("/checkout", {
        state: {
          orderId: orderData.id,
          orderNumber: orderData.order_number,
          itemsPurchased: items,
          totalPaid: totalPrice,
          date: new Date().toLocaleDateString(),
        },
      });
    } catch (apiError) {
      console.error(apiError);
      setError(apiError.message || "Error al procesar la orden.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading original
  if (isAuthLoading || isCheckingAddress) {
    return (
      <div className="cart-page-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Render normal
  return (
    <div className="cart-page-container">
      <div className="cart-halo cart-halo--1" />
      <div className="cart-halo cart-halo--3" />

      <motion.main
        className="container cart-content-wrapper"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <h1 className="fw-bold mb-4" style={{ color: "var(--color_text-secundary)" }}>
          Finalizar Compra
        </h1>

        <div className="row g-5">
          {/* Columna Izquierda: Detalles */}
          <div className="col-12 col-lg-7">
            <div className="cart-glass-panel">
              {error && (
                <div className="alert alert-danger rounded-3 mb-4 border-0 bg-danger bg-opacity-10 text-danger">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              {/* Dirección de envío */}
              <div className="mb-4 p-3 bg-white rounded-4 border border-light shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="h6 fw-bold text-primary mb-0">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Dirección de Envío
                  </h2>
                  <button
                    className="btn btn-sm btn-link text-muted"
                    onClick={() => navigate("/perfil")}
                  >
                    Cambiar
                  </button>
                </div>
                {/* Mostramos la dirección si existe, si no, un placeholder */}
                {profileAddress ? (
                    <>
                        <p className="mb-0 fw-bold text-dark">{profileAddress.address_detail}</p>
                        <p className="mb-0 small text-muted">
                        {profileAddress.comuna}, {profileAddress.region}
                        </p>
                    </>
                ) : (
                    <p className="text-muted small">Cargando dirección o no disponible...</p>
                )}
              </div>

              {/* Formulario de Pago */}
              <form onSubmit={handleFinalizeOrder}>
                <div className="d-flex align-items-center mb-4">
                  <span className="badge rounded-pill bg-primary me-2">2</span>
                  <h2 className="h5 mb-0 fw-bold text-dark">Método de Pago</h2>
                </div>

                <div className="bg-white p-4 rounded-4 border border-light shadow-sm mb-4">
                  <div className="mb-3">
                    <label className="form-label small text-muted">Número de Tarjeta</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="fas fa-credit-card text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-0"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentChange}
                        maxLength="16"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <label className="form-label small text-muted">Vencimiento</label>
                      <input
                        type="text"
                        className="form-control bg-light border-0"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentChange}
                        maxLength="5"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">CVV</label>
                      <input
                        type="text"
                        className="form-control bg-light border-0"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentChange}
                        maxLength="4"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-checkout-gradient w-100"
                  disabled={isProcessing || totalPrice <= 0}
                >
                  {isProcessing
                    ? "Procesando..."
                    : `Pagar ${formatCurrency(totalPrice || 0)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Resumen */}
          <div className="col-12 col-lg-5">
            <div className="cart-summary-card">
              <h3 className="h5 fw-bold mb-4 text-dark">Resumen del Pedido</h3>
              <div className="d-flex flex-column gap-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <div className="bg-white rounded-3 p-1 border shadow-sm" style={{ width: 40, height: 40 }}>
                        <img
                          src={item.product?.image || "/placeholder.png"}
                          alt=""
                          className="w-100 h-100 object-fit-contain"
                        />
                      </div>
                      <span className="text-truncate small fw-bold text-dark" style={{ maxWidth: 120 }}>
                        {item.product?.name}
                      </span>
                      <span className="text-muted xsmall">x{item.quantity}</span>
                    </div>
                    <span className="fw-bold small text-dark">
                      {formatCurrency((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-top pt-3 border-dashed">
                <div className="d-flex justify-content-between align-items-end">
                  <span className="fw-bold text-muted">Total</span>
                  <span className="fw-bold text-primary display-6 lh-1">
                    {formatCurrency(totalPrice || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}