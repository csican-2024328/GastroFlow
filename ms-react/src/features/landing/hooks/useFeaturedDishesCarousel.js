import { useEffect, useMemo, useState } from 'react';

export const useFeaturedDishesCarousel = () => {
  const dishes = useMemo(
    () => [
      {
        id: 1,
        image: new URL('../../../assets/img/plato1.png', import.meta.url).href,
        title: 'Vieiras al Limón y Hierbas',
        description: 'Vieiras doradas con emulsión cítrica, aceite de hierbas frescas y microgreens delicados.',
        price: '$24.90',
      },
      {
        id: 2,
        image: new URL('../../../assets/img/plato2.png', import.meta.url).href,
        title: 'Filete de Res al Vino Tinto',
        description: 'Tierra noble en reducción de vino tinto con papas trufadas y vegetales salteados.',
        price: '$28.50',
      },
      {
        id: 3,
        image: new URL('../../../assets/img/plato3.png', import.meta.url).href,
        title: 'Selección Mediterránea',
        description: 'Pescado sellado sobre crema suave, tomate confitado y una lluvia de brotes frescos.',
        price: '$26.20',
      },
      {
        id: 4,
        image: new URL('../../../assets/img/plato4.png', import.meta.url).href,
        title: 'Corte Glaseado de Autor',
        description: 'Un clásico robusto con glaseado oscuro, vegetales caramelizados y fondo reducido.',
        price: '$29.80',
      },
      {
        id: 5,
        image: new URL('../../../assets/img/plato5.png', import.meta.url).href,
        title: 'Molten Chocolate Signature',
        description: 'Centro de chocolate fundido con frutos rojos, cacao y brillo de salsa tibia.',
        price: '$14.00',
      },
    ],
    [],
  );

  const [activeIndex, setActiveIndex] = useState(1);

  const next = () => {
    setActiveIndex((current) => (current + 1) % dishes.length);
  };

  const prev = () => {
    setActiveIndex((current) => (current - 1 + dishes.length) % dishes.length);
  };

  const goTo = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % dishes.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [dishes.length]);

  return {
    dishes,
    activeIndex,
    activeDish: dishes[activeIndex],
    next,
    prev,
    goTo,
  };
};