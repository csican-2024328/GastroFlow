export const AuthCard = ({ logoSrc, logoAlt, title, subtitle, children }) => {
  return (
    <div className="w-full max-w-2xl bg-[var(--gf-beige)] rounded-xl shadow-lg border border-[#d8c8a6] p-8 md:p-12 min-h-[520px]">
      <div className="flex justify-center mb-6">
        <div className="bg-[var(--gf-cream)] rounded-3xl p-4 inline-flex shadow-lg shadow-[var(--gf-graphite)/15] border border-[#e8dcc5]">
          <img src={logoSrc} alt={logoAlt} className="h-28 md:h-32 w-auto object-contain" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--gf-graphite)] mb-2">{title}</h1>
        <p className="text-[#4b4b4b] text-base lg:text-lg max-w-xl mx-auto">{subtitle}</p>
      </div>

      {children}
    </div>
  );
};
