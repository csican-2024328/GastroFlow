export const AuthCard = ({ logoSrc, logoAlt, title, subtitle, children }) => {
  return (
    <div className="w-full max-w-xl bg-[#E2D4B7] rounded-xl shadow-lg border border-[#d8c8a6] p-6 md:p-10">
      <div className="flex justify-center mb-6">
        <div className="bg-[#F8F5F0] rounded-3xl p-4 inline-flex shadow-lg shadow-[#2C4035]/15 border border-[#e8dcc5]">
          <img src={logoSrc} alt={logoAlt} className="h-24 w-auto object-contain" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A1A] mb-2">{title}</h1>
        <p className="text-[#4b4b4b] text-base max-w-md mx-auto">{subtitle}</p>
      </div>

      {children}
    </div>
  );
};
