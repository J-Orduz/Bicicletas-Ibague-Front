import { useState, useEffect } from 'react';

// Hook para detectar la dirección del scroll (hacia arriba o hacia abajo)
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Solo detectar dirección si se ha scrolleado más de 10px
      // para evitar cambios por scrolls muy pequeños
      if (Math.abs(currentScrollY - prevScrollY) < 10) {
        return;
      }

      // Determinar dirección del scroll
      const direction = currentScrollY > prevScrollY ? 'down' : 'up';
      
      // Si scrolleamos hacia arriba o estamos en la parte superior, mostrar header
      if (direction !== scrollDirection && currentScrollY > 80) {
        setScrollDirection(direction);
      }

      // Si estamos en la parte superior de la página, siempre mostrar
      if (currentScrollY < 80) {
        setScrollDirection('up');
      }

      setPrevScrollY(currentScrollY);
    };

    // Agregar el event listener con passive para mejor performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollDirection, prevScrollY]);

  return scrollDirection;
};
