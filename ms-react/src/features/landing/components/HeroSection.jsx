import HeroDish from '../../../assets/img/platos.png';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#2f2218] bg-[linear-gradient(180deg,#0b0a08_0%,#111009_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(200,140,40,0.12),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(200,122,85,0.12),transparent_18%),radial-gradient(circle_at_70%_65%,rgba(44,64,53,0.14),transparent_28%)]" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1.1fr_0.95fr] lg:px-10 lg:py-16">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 text-[#c88c28]">
            <span className="h-px w-10 bg-current" />
            <span className="text-sm font-semibold uppercase tracking-[0.35em]">Experiencia Gourmet</span>
          </div>

          <h1 className="font-serif text-[3rem] leading-[0.92] text-[#f5ede0] sm:text-[4rem] lg:text-[5.1rem]">
            Una Experiencia
            <br />
            Gastronómica
            <span className="mt-3 block text-[#c88c28] italic">Inolvidable</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#cbb9a1] sm:text-xl">
            Sabores auténticos, momentos memorables. Una cocina de autor pensada para quienes disfrutan cada detalle.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#menu"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-8 py-3.5 text-sm font-semibold text-[#0a0a08] shadow-[0_16px_32px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Explorar Menú
            </a>
            <p className="text-sm text-[#b8a48a]">Reserva con anticipación y recibe una experiencia diseñada a tu medida.</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 top-8 hidden h-24 w-24 rounded-full border border-[#2f2218] bg-[#c88c28]/10 blur-2xl lg:block" />
          <div className="absolute -right-6 bottom-5 hidden h-28 w-28 rounded-full bg-[rgba(200,122,85,0.16)] blur-3xl lg:block" />

          <div className="relative mx-auto max-w-[760px] overflow-hidden rounded-[2rem] border border-[#2f2218] bg-[#111009]/80 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-[1.5rem] bg-[#0e0d0a]">
              <img
                src={HeroDish}
                alt="Plato principal de GastroFlow"
                className="h-[340px] w-full object-cover object-center sm:h-[420px] lg:h-[560px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};