import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import defaultAvatar from "../../../assets/img/Icono.png";

export const AvatarUser = () => {
    const {user, logout} = useAuthStore();
    const [open, setOpen] = useState(false);
    const [showProfileInline, setShowProfileInline] = useState(false);
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
    const handleProfile = () => {
        // open the centered modal with profile details
        openProfileModal();
        setOpen(false);
    }

    const avatarSrc = (user?.profilePicture || user?.profileImage) && (user?.profilePicture || user?.profileImage).trim() !== ""
        ? (user?.profilePicture || user?.profileImage)
        : defaultAvatar;

  return (
    <div className="relative" ref={dropdownRef}>
        <img
            src={avatarSrc}
            alt={user?.username || 'avatar'}
            className="w-10 h-10 object-cover rounded-full border-2 border-[#2C4035] cursor-pointer"
            onClick={toggleMenu}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
            }}
            />

                        {open && (
                                <div className="absolute right-0 mt-2 w-56 bg-[#F8F5F0] border border-[#E2D4B7] rounded-lg shadow-lg animated-fadeIn z-50">
                                        <div className="px-4 py-3 border-b border-[#E2D4B7]">
                                                <p className="font-semibold text-[#1A1A1A]">{user?.username}</p>
                                                <p className="text-xs text-[#2C4035]">{user?.role || 'CLIENT'}</p>
                                                <p className="text-sm text-[#4b4b4b] truncate">{user?.email}</p>
                                        </div>
                        <ul className="p-2 text-sm text-[#1A1A1A] font-medium space-y-1">
                            <button onClick={() => { openProfileModal(false); setOpen(false); }} className="w-full text-left block px-4 py-2 rounded hover:bg-[#E2D4B7]">Ver perfil</button>
                            <button onClick={handleLogout} className="w-full text-left block px-4 py-2 rounded hover:bg-[#E2D4B7]">Cerrar Sesion</button>
                        </ul>
                                </div>
                        )}  
    </div>
  )
}
