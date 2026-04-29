import { useAuthStore } from '../../features/auth/store/authStore.js';
import { AvatarUser } from '../../shared/components/ui/AvatarUser.jsx';
import { ProfileModal } from '../../features/auth/components/ProfileModal.jsx';

export const ClientPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A]">
      <header className="bg-[#F8F5F0] border-b border-[#E2D4B7] p-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">GastroFlow - Mi Cuenta</h1>
            <p className="text-xs text-[#4b4b4b]">Hola, {user?.name || 'Cliente'}</p>
          </div>
          <AvatarUser />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <section className="bg-[#E2D4B7] border border-[#d8c8a6] rounded p-6">
          <h2 className="text-lg font-semibold mb-2">Bienvenido, {user?.name}</h2>
          <p className="text-[#1A1A1A] text-sm">Email: {user?.email}</p>
          <p className="text-[#1A1A1A] text-sm">Usuario: {user?.username}</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#E2D4B7] border border-[#d8c8a6] rounded p-4">
            <h3 className="font-semibold mb-2">Restaurantes</h3>
            <p className="text-[#4b4b4b] text-sm">Explora y reserva en tus restaurantes favoritos</p>
          </div>
          <div className="bg-[#E2D4B7] border border-[#d8c8a6] rounded p-4">
            <h3 className="font-semibold mb-2">Tus Reservas</h3>
            <p className="text-[#4b4b4b] text-sm">Consulta tus próximas reservaciones</p>
          </div>
        </section>
      </main>
      <ProfileModal />
    </div>
  );
};
