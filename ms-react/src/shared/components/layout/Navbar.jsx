import { Typography } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/img/logo.png';
import { AvatarUser } from '../ui/AvatarUser.jsx';

export const Navbar = () => {
  return (
    <nav className="bg-[var(--gf-cream)] border-b border-[var(--gf-beige)] shadow-sm sticky top-0 z-50 w-full">
      <div className="h-16 flex items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <img
            src={Logo}
            alt="GastroFlow Logo"
            className="h-12 md:h-14 w-auto object-contain"
          />
          <Typography variant="h5" className="text-[var(--gf-graphite)] font-bold text-lg md:text-2xl">
            GastroFlow
          </Typography>
        </Link>

        {/* Right: avatar/menu */}
        <div className="flex items-center gap-4">
          <AvatarUser />
        </div>
      </div>
    </nav>
  )
}