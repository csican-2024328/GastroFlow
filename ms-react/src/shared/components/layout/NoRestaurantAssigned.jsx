import { Link } from 'react-router-dom';

export const NoRestaurantAssigned = () => {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-6 py-10">
      <div className="max-w-xl rounded-3xl border border-[#E8D4B8] bg-white p-8 text-center shadow-[0_18px_40px_rgba(26,26,26,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A7A63]">Acceso restringido</p>
        <h1 className="mt-3 font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">
          Sin restaurante asignado
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#6D6459]">
          Este usuario tiene rol de administrador de restaurante, pero todavía no tiene un restaurante asignado.
          Asigna un restaurante desde el panel de plataforma para poder ver pedidos, reservaciones, inventario y reportes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-[#D9C7AC] bg-[#FDFBF7] px-4 py-2.5 text-sm font-semibold text-[#2C4035] transition hover:bg-[#F5EFEA]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
