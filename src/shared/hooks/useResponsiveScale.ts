import { useEffect } from 'react';
import { useSafeArea } from './useSafeArea';

/**
 * useResponsiveScale
 * Calcula un factor de escala dinámico basado en las dimensiones reales de la pantalla,
 * incluyendo las alturas nativas de las barras de estado y navegación.
 */
export function useResponsiveScale() {
  const { statusBarHeight, navigationBarHeight, viewportHeight } = useSafeArea();

  useEffect(() => {
    const updateScale = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth || 375;
      // Usar viewportHeight del hook que ya considera safe areas nativas
      const height = viewportHeight || window.innerHeight || 667;

      // Diseño base: 375px de ancho (estándar iPhone)
      const baseWidth = 375;
      const baseHeight = 667;

      // Factor de escala basado en el ancho
      let scale = width / baseWidth;

      // Ajuste por altura para pantallas extra-largas (muy común en Android moderno)
      const ratioHeight = height / baseHeight;
      if (ratioHeight > scale * 1.1) {
        // En pantallas muy largas, permitimos que el escalado crezca más para llenar el aire
        // Usamos una interpolación para que no sea un salto brusco
        scale = scale * 0.7 + ratioHeight * 0.3;
      }

      // Límites de escalado:
      // - No menos de 0.85 (evitar que se vea diminuto en móviles mini)
      // - Máximo 1.45 en pantallas muy anchas (foldables/tablets)
      // - Máximo 1.25 en móviles normales para mantenerlo refinado y compacto
      const maxScaleLimit = width > 550 ? 1.45 : 1.25;
      const finalScale = Math.min(Math.max(scale, 0.85), maxScaleLimit);

      document.documentElement.style.setProperty('--app-scale', finalScale.toFixed(3));

      // Clases de utilidad para CSS
      if (width > 500) {
        document.documentElement.classList.add('is-wide-screen');
      } else {
        document.documentElement.classList.remove('is-wide-screen');
      }

      // Detectar pantallas "altas" para centrado extra
      if (ratioHeight > 1.8) {
        document.documentElement.classList.add('is-tall-screen');
      } else {
        document.documentElement.classList.remove('is-tall-screen');
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, [statusBarHeight, navigationBarHeight, viewportHeight]);
}
