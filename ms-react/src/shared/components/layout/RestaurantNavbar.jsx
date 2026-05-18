import { Typography } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/img/logo.png';
import { AvatarUser } from '../ui/AvatarUser.jsx';

export const RestaurantNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E8D4B8] bg-[#F8F5F0] shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <Link to="/restaurant-dashboard" className="flex items-center gap-3 transition hover:opacity-80">
          <img src={Logo} alt="GastroFlow Logo" className="h-12 w-auto object-contain" />
          <div>
            <Typography variant="h5" className="text-[#1A1A1A] font-bold text-lg md:text-2xl">
              GastroFlow
            </Typography>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A7A63]">
              Admin Restaurante
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-[#D9C7AC] bg-white px-3 py-1 text-xs font-semibold text-[#2C4035] md:inline-flex">
            Vista restringida a tu restaurante
          </span>
          <AvatarUser />
        </div>
      </div>
    </nav>
  );
};
