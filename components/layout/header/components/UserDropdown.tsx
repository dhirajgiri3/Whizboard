import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '@/lib/context/AppContext';
import { signOut } from 'next-auth/react';
import { UserMenuItem } from '../types';
import { headerAnimations, darkHeaderAnimations } from '../utils/animations';

interface UserDropdownProps {
  session: any;
  isOpen: boolean;
  onClose: () => void;
  isLightMode: boolean;
  userMenuItems: UserMenuItem[];
}

const UserDropdown = ({ session, isOpen, onClose, isLightMode, userMenuItems }: UserDropdownProps) => {
  const animations = isLightMode ? headerAnimations : darkHeaderAnimations;
  
  const dropdownBg = isLightMode
    ? 'bg-white border-gray-200'
    : 'bg-[#111111] border-white/10';
  
  const borderColor = isLightMode
    ? 'border-gray-100/80'
    : 'border-white/10';
  
  const textColor = isLightMode
    ? 'text-gray-900'
    : 'text-white';
  
  const subTextColor = isLightMode
    ? 'text-gray-500'
    : 'text-white/70';
  
  const hoverBg = isLightMode
    ? 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:text-gray-900'
    : 'hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 hover:text-white';
  
  const dangerHoverBg = isLightMode
    ? 'hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700'
    : 'hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 hover:text-red-400';

  const { user: appUser } = useAppContext();
  const avatarUrl = appUser?.avatar || session.user?.image || '';
  const displayName = appUser?.name || session.user?.name || appUser?.email || session.user?.email || 'U';
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase();
  const bgColor = (() => {
    const key = (appUser?.email || session?.user?.email || 'user').toLowerCase();
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 45%)`;
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={animations.dropdown}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`absolute right-0 top-full mt-3 w-80 lg:w-96 ${dropdownBg} rounded-2xl border py-4 z-[55] overflow-hidden ${!isLightMode ? 'dark' : ''}`}
          role="menu"
        >
          {/* User Info */}
          <div className={`px-6 py-4 border-b ${borderColor}`}>
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="User Avatar"
                    width={48}
                    height={48}
                    className={`w-12 h-12 rounded-full ring-3 object-cover ${isLightMode ? 'ring-blue-100' : 'ring-blue-500/30'}`}
                  />
                ) : (
                  <div
                    aria-label="User Avatar Fallback"
                    className={`w-12 h-12 rounded-full ring-3 flex items-center justify-center text-white ${isLightMode ? 'ring-blue-100' : 'ring-blue-500/30'}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    <span className="text-base font-semibold">{initial}</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className={`text-base font-bold ${textColor} truncate`}>
                  {session.user?.name || 'User'}
                </div>
                <div className={`text-sm ${subTextColor} truncate`}>
                  {session.user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {userMenuItems.map((item, index) => (
              <motion.div
                key={item.label}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-4 px-6 py-3 text-sm font-medium transition-all duration-300 group ${hoverBg} ${
                      isLightMode ? 'text-gray-700' : 'text-white/70'
                    }`}
                    onClick={onClose}
                    role="menuitem"
                  >
                    <div className={`p-2 rounded-full ${item.color.bg} ${item.color.text} group-hover:${item.color.hover.bg} transition-colors`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${subTextColor}`}>{item.description}</div>
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      item.action?.();
                    }}
                    className={`flex items-center gap-4 px-6 py-3 text-sm font-medium transition-all duration-300 w-full text-left group ${dangerHoverBg} ${
                      isLightMode ? 'text-red-600' : 'text-red-400'
                    }`}
                    role="menuitem"
                  >
                    <div className={`p-2 rounded-full ${item.color.bg} ${item.color.text} group-hover:${item.color.hover.bg} transition-colors`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${subTextColor}`}>{item.description}</div>
                    </div>
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserDropdown; 