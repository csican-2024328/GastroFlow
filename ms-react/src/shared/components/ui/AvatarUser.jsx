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

    const handleProfile = () => {
        navigate('/profile');
    }

    const avatarSrc = (user?.profilePicture || user?.profileImage) && (user?.profilePicture || user?.profileImage).trim() !== ""
        ? (user?.profilePicture || user?.profileImage)
        : defaultAvatar;

  return (
    <div className="relative" ref={dropdownRef}>
        <img
            src={avatarSrc}
            alt={user?.username || 'avatar'}
            className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full border-2 border-[var(--gf-green)] cursor-pointer"
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
            <div role="menu" className="absolute right-0 mt-2 min-w-[14rem] bg-[var(--gf-cream)] border border-[var(--gf-beige)] rounded-lg shadow-lg animated-fadeIn z-50">
                <div className="px-4 py-3 border-b border-[var(--gf-beige)]">
                    <p className="font-semibold text-[var(--gf-graphite)]">{user?.username}</p>
                    <p className="text-xs text-[var(--gf-green)]">{user?.role || 'CLIENT'}</p>
                    <p className="text-sm text-[#4b4b4b] truncate">{user?.email}</p>
                </div>
                <ul className="p-2 text-sm text-[var(--gf-graphite)] font-medium space-y-1">
                    <button onClick={handleProfile} role="menuitem" tabIndex={0} className="w-full text-left block px-4 py-2 rounded hover:bg-[var(--gf-beige)]">Detalles de perfil</button>
                    <button onClick={handleLogout} role="menuitem" tabIndex={0} className="w-full text-left block px-4 py-2 rounded hover:bg-[var(--gf-beige)]">Cerrar Sesion</button>
                </ul>
            </div>
        )}  
    </div>
  )
}
