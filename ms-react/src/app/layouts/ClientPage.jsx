import { useAuthStore } from '../../features/auth/store/authStore.js';
import { AvatarUser } from '../../shared/components/ui/AvatarUser.jsx';

export const ClientPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-[#0D2818] text-[#F0EDE8]">
      <header className="bg-[#112D1C] border-b border-[#113a26] p-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">GastroFlow - Mi Cuenta</h1>
            <p className="text-xs text-[#C4A882]">Hola, {user?.name || 'Cliente'}</p>
          </div>
          <AvatarUser />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <section className="bg-[#0F452A] border border-[#113a26] rounded p-6">
          <h2 className="text-lg font-semibold mb-2">Bienvenido, {user?.name}</h2>
          <p className="text-[#C4A882] text-sm">Email: {user?.email}</p>
          <p className="text-[#C4A882] text-sm">Usuario: {user?.username}</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F452A] border border-[#113a26] rounded p-4">
            <h3 className="font-semibold mb-2">Restaurantes</h3>
            <p className="text-[#7A9E85] text-sm">Explora y reserva en tus restaurantes favoritos</p>
          </div>
          <div className="bg-[#0F452A] border border-[#113a26] rounded p-4">
            <h3 className="font-semibold mb-2">Tus Reservas</h3>
            <p className="text-[#7A9E85] text-sm">Consulta tus próximas reservaciones</p>
          </div>
        </section>
      </main>
    </div>
  );
};
