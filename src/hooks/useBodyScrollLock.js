import { useEffect } from 'react';

/**
 * Hook para bloquear el scroll del body cuando el menú móvil está abierto
 * @param {boolean} isOpen - Estado del menú (abierto/cerrado)
 */
export function useBodyScrollLock(isOpen) {
  useEffect(() => {
    if (isOpen) {
      // Guardar el scroll actual
      const scrollY = window.scrollY;
      
      // Bloquear scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.classList.add('menu-open');
      
      return () => {
        // Restaurar scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.classList.remove('menu-open');
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
}