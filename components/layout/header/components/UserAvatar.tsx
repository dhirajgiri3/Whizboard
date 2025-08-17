import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';

interface UserAvatarProps {
  session: any;
  isDropdownOpen: boolean;
  onClick: () => void;
  isLightMode: boolean;
}

const UserAvatar = ({ session, isDropdownOpen, onClick, isLightMode }: UserAvatarProps) => {
  const { user } = useAppContext();
  const buttonClasses = isLightMode
    ? 'hover:bg-gray-100/80'
    : 'hover:bg-white/5';
  
  const textColor = isLightMode
    ? 'text-gray-600 group-hover:text-gray-900'
    : 'text-white/70 group-hover:text-white';
  
  const ringColor = isLightMode
    ? 'ring-gray-200 group-hover:ring-blue-300'
    : 'ring-white/20 group-hover:ring-blue-400/50';

  const avatarUrl = user?.avatar || session?.user?.image || '';
  const displayName = user?.name || session?.user?.name || user?.email || session?.user?.email || 'U';
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase();
  const fg = isLightMode ? 'text-white' : 'text-white';
  const bgColor = (() => {
    const key = (user?.email || session?.user?.email || 'user').toLowerCase();
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 45%)`;
  })();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 rounded-full transition-all duration-300 ${buttonClasses} ${
        isDropdownOpen ? (isLightMode ? 'bg-gray-100/80' : 'bg-white/5') : ''
      }`}
      aria-expanded={isDropdownOpen}
      aria-haspopup="true"
      aria-label="User menu"
    >
      <motion.div whileHover={{ scale: 1.05 }} className="relative">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="User Avatar"
            width={32}
            height={32}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 transition-all duration-300 ${ringColor}`}
          />
        ) : (
          <div
            aria-label="User Avatar Fallback"
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 flex items-center justify-center ${fg} transition-all duration-300 ${ringColor}`}
            style={{ backgroundColor: bgColor }}
          >
            <span className="text-xs font-semibold">{initial}</span>
          </div>
        )}
      </motion.div>

      <motion.div
        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${textColor}`} />
      </motion.div>
    </motion.button>
  );
};

export default UserAvatar; 