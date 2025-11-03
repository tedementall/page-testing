/**
 * Efecto Parallax para el Hero Section
 * Agregar este script al final de tu página o en un archivo JS separado
 */

document.addEventListener('DOMContentLoaded', function() {
  const hero = document.querySelector('.container__cover');
  const glow = document.querySelector('.hero-glow');
  const phone = document.querySelector('.hero-phone');

  if (!hero || !glow || !phone) return;

  hero.addEventListener('mousemove', function(e) {
    const rect = hero.getBoundingClientRect();
    
    // Calcular posición del mouse relativa al centro del hero
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

    // Aplicar transformación al glow (más movimiento)
    const glowX = x * 30; // 30px de movimiento máximo
    const glowY = y * 30;
    glow.style.transform = `translate(calc(-50% + ${glowX}px), calc(-50% + ${glowY}px))`;

    // Aplicar transformación al teléfono (menos movimiento)
    const phoneX = x * 15; // 15px de movimiento máximo
    const phoneY = y * 15;
    phone.style.transform = `translate(${phoneX}px, ${phoneY}px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  });

  // Resetear al salir del hero
  hero.addEventListener('mouseleave', function() {
    glow.style.transform = 'translate(-50%, -50%)';
    phone.style.transform = 'translate(0, 0) rotateY(0) rotateX(0)';
  });
});