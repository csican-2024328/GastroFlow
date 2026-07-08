import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import defaultAvatar from "../../../assets/img/Icono.png";

export const AvatarUser = () => {
    const {user, logout} = useAuthStore();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();

    const toggleMenu = () => setOpen((prev) => !prev);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target))
                setOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>  document.removeEventListener("mousedown", handleClickOutside);
        
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true })
    }

    const openProfileModal = useAuthStore((s) => s.openProfileModal);
    const handleProfile = (edit = false) => {
        openProfileModal(!!edit);
        setOpen(false);
    }

    const avatarImage = [user?.profilePicture, user?.profileImage].find(
        (value) => typeof value === 'string' && value.trim() !== '',
    );
    const avatarSrc = avatarImage
        ? avatarImage
        : defaultAvatar;

  return (
    <div className="relative" ref={dropdownRef}>
        <img
            src={avatarSrc}
            alt={user?.username || 'avatar'}
            className="w-10 h-10 md:w-11 md:h-11 object-cover rounded-full border-2 border-[#c88c28]/40 cursor-pointer shadow-lg hover:border-[#c88c28] transition-colors"
            onClick={toggleMenu}
            tabIndex={0}
            role="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
            }}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
            }}
        />

        {open && (
            <div role="menu" className="absolute right-0 mt-3 min-w-[15rem] bg-[#111009] border border-[#c88c28]/20 rounded-2xl shadow-2xl animated-fadeIn z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#c88c28]/10 bg-gradient-to-b from-[#c88c28]/5 to-transparent">
                    <p className="font-bold text-[#f5ede0] tracking-tight">{user?.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c88c28]" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#c88c28]/80">{user?.role || 'CLIENT'}</p>
                    </div>
                    <p className="text-xs text-[#f5ede0]/40 mt-1 truncate">{user?.email}</p>
                </div>
                <ul className="p-2 text-sm text-[#f5ede0]/70 font-medium">
                    <li>
                        <button 
                            onClick={() => handleProfile(false)} 
                            role="menuitem" 
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-[#c88c28]/10 hover:text-[#f5ede0]"
                        >
                            <i className="ti ti-user-circle text-lg" />
                            Detalles de perfil
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={handleLogout} 
                            role="menuitem" 
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-red-500/10 hover:text-red-400"
                        >
                            <i className="ti ti-logout text-lg" />
                            Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </div>
        )}
    </div>
  )
}
