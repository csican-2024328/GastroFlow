import { useFeaturedDishesCarousel } from '../hooks/useFeaturedDishesCarousel.js';

const DishCard = ({ dish, active = false }) => {
  const shellClasses = active
    ? 'flex-[0_0_clamp(500px,64vw,620px)]'
    : 'hidden md:flex flex-[0_0_clamp(150px,16vw,190px)]';

  return (
    <article className={`${shellClasses} shrink-0`}>
      <div className={`overflow-hidden rounded-[2.2rem] border border-white/80 bg-white shadow-[0_18px_50px_rgba(26,26,26,0.08)] ${active ? 'h-[240px] sm:h-[265px] lg:h-[295px]' : 'h-[220px] sm:h-[235px] lg:h-[250px]'}`}>
        <img
          src={dish.image}
          alt={dish.title}
          className="h-full w-full object-contain object-center bg-[#f6f0e6]"
        />
      </div>
    </article>
  );
};

export const FeaturedDishesSection = () => {
  const { dishes, activeIndex, activeDish, goTo } = useFeaturedDishesCarousel();

  return (
    <section id="menu" className="bg-[var(--gf-cream)] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <span id="galeria" className="sr-only" />
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--gf-terracotta)]">Nuestro Menú</p>
          <h2 className="mt-2 font-serif text-[2.2rem] leading-tight text-[var(--gf-graphite)] sm:text-[2.8rem]">Platos Destacados</h2>
        </div>

        <div className="relative mt-10 overflow-hidden px-0 md:px-2 lg:px-4">
          <div className="flex items-stretch justify-center gap-4 md:gap-5 lg:gap-6">
            <DishCard dish={dishes[(activeIndex - 1 + dishes.length) % dishes.length]} active={false} />
            <DishCard dish={activeDish} active />
            <DishCard dish={dishes[(activeIndex + 1) % dishes.length]} active={false} />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {dishes.map((dish, index) => (
            <button
              key={dish.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir al plato ${index + 1}`}
              className={`h-3.5 rounded-full transition-all ${index === activeIndex ? 'w-10 bg-[var(--gf-green)]' : 'w-3.5 bg-[#d6c8b0]'}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};