import { Typography } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/img/logo.png';
import { AvatarUser } from '../ui/AvatarUser.jsx';

export const RestaurantNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#c88c28]/20 bg-[#0d0d0b] shadow-lg backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <Link to="/restaurant-dashboard" className="flex items-center gap-3 transition hover:opacity-80">
          <div className="bg-gradient-to-br from-[#c88c28] to-[#8a5c10] p-1 rounded-lg shadow-inner">
            <img src={Logo} alt="GastroFlow Logo" className="h-10 md:h-12 w-auto object-contain brightness-110" />
          </div>
          <div>
            <Typography variant="h5" className="text-[#f5ede0] font-['Playfair_Display'] font-bold text-lg md:text-2xl tracking-wide">
              GastroFlow
            </Typography>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#c88c28]/70">
              RESTAURANT ADMIN
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-[#c88c28]/20 bg-[#c88c28]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c88c28] md:inline-flex">
            Sede Central
          </span>
          <AvatarUser />
        </div>
      </div>
    </nav>
  );
};
