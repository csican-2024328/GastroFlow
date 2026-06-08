const benefits = [
  {
    title: 'Ambiente Exclusivo',
    description: 'Espacios diseñados para una experiencia íntima y cálida.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16" />
        <path d="M6 20V10a6 6 0 0 1 12 0v10" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    title: 'Ingredientes Premium',
    description: 'Selección diaria de productos frescos y de origen confiable.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 6 6 9 6 13a6 6 0 0 0 12 0c0-4-4-7-6-11Z" />
        <path d="M12 21v-6" />
        <path d="M9 15c1.5-1 3-1 6 0" />
      </svg>
    ),
  },
  {
    title: 'Atención Personalizada',
    description: 'Nuestro equipo acompaña cada visita de principio a fin.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12a4 4 0 1 0-4-4" />
        <path d="M4 20a8 8 0 0 1 16 0" />
        <path d="M20 7v6" />
        <path d="M17 10h6" />
      </svg>
    ),
  },
];

const Field = ({ label, type = 'text', placeholder }) => {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-[#2f2218] bg-[#111009] px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a66a]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] text-[#f5ede0] outline-none placeholder:text-[#8e7a63]"
      />
    </label>
  );
};

const BenefitItem = ({ benefit }) => {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-[#2f2218] bg-[#111009] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.24)] sm:p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1a1a14] text-[#c88c28]">
        {benefit.icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[#f5ede0]">{benefit.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#b8a48a]">{benefit.description}</p>
      </div>
    </div>
  );
};

export const QuickReservationSection = () => {
  return (
    <section id="reservas" className="relative overflow-hidden border-t border-[#2f2218] bg-[linear-gradient(180deg,#111009_0%,#0b0a08_100%)] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_25%,rgba(200,140,40,0.10),transparent_18%),radial-gradient(circle_at_85%_40%,rgba(44,64,53,0.16),transparent_22%)]" />

      <div className="relative mx-auto grid max-w-[1440px] items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <span id="contacto" className="sr-only" />
        <div className="self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#c88c28]">Reserva tu mesa</p>
          <h2 className="mt-3 font-serif text-[2.4rem] leading-tight text-[#f5ede0] sm:text-[3.2rem]">
            Hagamos de tu visita algo inolvidable
          </h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-[#b8a48a] sm:text-lg">
            Reserva con pocos pasos y disfruta una experiencia cuidada al detalle desde tu llegada.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {benefits.map((benefit) => (
              <BenefitItem key={benefit.title} benefit={benefit} />
            ))}
          </div>
        </div>

        <div className="self-start rounded-[2rem] border border-[#2f2218] bg-[#111009]/90 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-6 lg:p-8">
          <form className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Fecha" type="date" placeholder="dd/mm/aaaa" />
              <Field label="Hora" type="time" placeholder="--:--" />
              <Field label="Personas" type="number" placeholder="2" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" type="text" placeholder="Tu nombre completo" />
              <Field label="Teléfono" type="tel" placeholder="Tu número de contacto" />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-6 py-4 text-base font-semibold text-[#0a0a08] shadow-[0_16px_34px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Reservar Ahora
            </button>
          </form>

          <div className="mt-6 border-t border-[#2f2218] pt-5 text-sm text-[#b8a48a]">
            <p className="font-semibold text-[#f5ede0]">Contacto</p>
            <p className="mt-1">reservas@gastroflow.com · +34 600 000 000</p>
          </div>
        </div>
      </div>
    </section>
  );
};