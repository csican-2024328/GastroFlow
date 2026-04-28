export const AuthCard = ({ logoSrc, logoAlt, title, subtitle, children }) => {
  return (
    <div className="w-full max-w-xl bg-[#112D1C] rounded-xl shadow-lg border border-[#2D5C3A] p-6 md:p-10">
      <div className="flex justify-center mb-6">
        <div className="bg-[#F0EDE8] rounded-3xl p-4 inline-flex shadow-lg shadow-[#1A3D25]/50">
          <img src={logoSrc} alt={logoAlt} className="h-24 w-auto object-contain" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#F0EDE8] mb-2">{title}</h1>
        <p className="text-[#7A9E85] text-base max-w-md mx-auto">{subtitle}</p>
      </div>

      {children}
    </div>
  );
};
