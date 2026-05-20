import { Link } from 'react-router-dom';
import Logo from '../../../assets/img/logo.png';

const navItems = [
  { label: 'Menú', href: '#menu' },
  { label: 'Reservas', href: '#reservas' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Contacto', href: '#contacto' },
];

export const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2f2218] bg-[rgba(11,10,8,0.92)] backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img src={Logo} alt="GastroFlow" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <p className="font-serif text-2xl leading-none text-[#c9a66a] sm:text-[2.15rem]">GastroFlow</p>
            <p className="hidden text-[11px] tracking-[0.22em] text-[#b8a48a] sm:block">Sabores con intención, viajes con destino.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-medium text-[#f5ede0]/78 lg:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="transition-colors hover:text-[#c88c28]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-full border border-[#2f2218] bg-[#111009] px-4 py-2 text-sm font-medium text-[#f5ede0] transition hover:bg-[#1a1a14] sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <a
            href="#reservas"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-5 py-3 text-sm font-semibold text-[#0a0a08] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:opacity-90"
          >
            <span className="inline-block h-4 w-4 rounded-sm border border-[#0a0a08]/20 text-center text-[10px] leading-4">◫</span>
            Reservar Mesa
          </a>
        </div>
      </div>
    </header>
  );
};