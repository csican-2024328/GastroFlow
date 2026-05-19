import { Link } from 'react-router-dom';

export const NoRestaurantAssigned = () => {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-6 py-10 bg-[#0b0a08]">
      <div className="max-w-xl rounded-3xl border border-[#c88c28]/20 bg-[#111009] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c88c28] to-transparent opacity-50" />
        
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c88c28]">Acceso restringido</p>
        <h1 className="mt-4 font-['Playfair_Display'] text-3xl font-bold text-[#f5ede0]">
          Sin restaurante asignado
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#f5ede0]/50 max-w-sm mx-auto">
          Este usuario tiene rol de administrador de restaurante, pero todavía no tiene un restaurante asignado.
          Contacta al administrador general para completar tu perfil.
        </p>
        
        <div className="mt-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-6 py-3 text-sm font-bold text-[#0a0a08] transition-all hover:opacity-90 hover:scale-[1.02]"
          >
            <span>Volver al inicio</span>
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
