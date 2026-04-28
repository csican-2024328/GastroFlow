import {Typography} from '@material-tailwind/react';
import Logo from '../../../assets/img/logo.png';
import { AvatarUser } from '../ui/AvatarUser.jsx';

export const Navbar = () => {
  return (
    <nav className="bg-[#112D1C] shadow sticky top-0 z-50">
      <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-2 '>
          <img 
              src={Logo}
              alt="GastroFlow Logo"
              className='h-12 md:h-14 w-auto object-contain'/>
              <Typography variant="h5" className="text-[#F0EDE8] font-bold">
                GastroFlow
              </Typography>
        </div>
        <div className="flex items-center gap-4">
          <AvatarUser />
        </div>
      </div>
    </nav>
  )
}
