export const AuthCard = ({ logoSrc, logoAlt, title, subtitle, children }) => {
  return (
    <div className="w-full max-w-2xl bg-[var(--gf-beige)] rounded-xl shadow-lg border border-[#d8c8a6] p-6 md:p-8 min-h-[420px]">
      <div className="flex justify-center mb-4">
        <div className="bg-[var(--gf-cream)] rounded-2xl p-3 inline-flex shadow-lg shadow-[var(--gf-graphite)/15] border border-[#e8dcc5]">
          <img src={logoSrc} alt={logoAlt} className="h-20 md:h-24 w-auto object-contain" />
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--gf-graphite)] mb-1">{title}</h1>
        <p className="text-[#4b4b4b] text-sm lg:text-base max-w-xl mx-auto">{subtitle}</p>
      </div>

      {children}
    </div>
  );
};
