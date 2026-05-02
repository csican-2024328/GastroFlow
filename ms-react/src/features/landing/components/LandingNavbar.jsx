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
    <header className="sticky top-0 z-50 border-b border-white/70 bg-[rgba(248,245,240,0.88)] backdrop-blur-xl shadow-[0_8px_24px_rgba(26,26,26,0.04)]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img src={Logo} alt="GastroFlow" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <p className="font-serif text-2xl leading-none text-[var(--gf-green)] sm:text-[2.15rem]">GastroFlow</p>
            <p className="hidden text-[11px] tracking-[0.22em] text-[#6d685f] sm:block">Sabores con intención, viajes con destino.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-medium text-[#2f2f2f] lg:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="transition-colors hover:text-[var(--gf-green)]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-full border border-[var(--gf-beige)] px-4 py-2 text-sm font-medium text-[var(--gf-green)] transition hover:bg-white/70 sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <a
            href="#reservas"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--gf-green)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(44,64,53,0.28)] transition hover:-translate-y-0.5 hover:bg-[#344b3e]"
          >
            <span className="inline-block h-4 w-4 rounded-sm border border-white/70 text-center text-[10px] leading-4">◫</span>
            Reservar Mesa
          </a>
        </div>
      </div>
    </header>
  );
};