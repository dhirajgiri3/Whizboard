import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

interface UserAvatarProps {
  session: any;
  isDropdownOpen: boolean;
  onClick: () => void;
  isLightMode: boolean;
}

const UserAvatar = ({ session, isDropdownOpen, onClick, isLightMode }: UserAvatarProps) => {
  const buttonClasses = isLightMode
    ? 'hover:bg-gray-100/80'
    : 'hover:bg-white/5';
  
  const textColor = isLightMode
    ? 'text-gray-600 group-hover:text-gray-900'
    : 'text-white/70 group-hover:text-white';
  
  const ringColor = isLightMode
    ? 'ring-gray-200 group-hover:ring-blue-300'
    : 'ring-white/20 group-hover:ring-blue-400/50';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex items-center gap-2 px-2 py-1 rounded-full transition-all duration-300 ${buttonClasses} ${
        isDropdownOpen ? (isLightMode ? 'bg-gray-100/80' : 'bg-white/5') : ''
      }`}
      aria-expanded={isDropdownOpen}
      aria-haspopup="true"
      aria-label="User menu"
    >
      <motion.div whileHover={{ scale: 1.05 }} className="relative">
        <Image
          src={session.user?.image || '/default-avatar.png'}
          alt="User Avatar"
          width={32}
          height={32}
          className={`w-8 h-8 rounded-full ring-2 transition-all duration-300 ${ringColor}`}
        />
      </motion.div>

      <motion.div
        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className={`w-4 h-4 ${textColor}`} />
      </motion.div>
    </motion.button>
  );
};

export default UserAvatar; 