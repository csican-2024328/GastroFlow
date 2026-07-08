import { Typography } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/img/Logo.png';
import { AvatarUser } from '../ui/AvatarUser.jsx';

export const Navbar = () => {
  return (
    <nav className="bg-[#0d0d0b] border-b border-[#c88c28]/20 shadow-lg sticky top-0 z-50 w-full backdrop-blur-md">
      <div className="h-16 flex items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-gradient-to-br from-[#c88c28] to-[#8a5c10] p-1 rounded-lg shadow-inner">
            <img
              src={Logo}
              alt="GastroFlow Logo"
              className="h-10 md:h-12 w-auto object-contain brightness-110"
            />
          </div>
          <div>
            <Typography variant="h5" className="text-[#f5ede0] font-['Playfair_Display'] font-bold text-lg md:text-2xl tracking-wide">
              GastroFlow
            </Typography>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#c88c28]/70">
              PLATFORM ADMIN
            </p>
          </div>
        </Link>

        {/* Right: avatar/menu */}
        <div className="flex items-center gap-4">
          <AvatarUser />
        </div>
      </div>
    </nav>
  )
}