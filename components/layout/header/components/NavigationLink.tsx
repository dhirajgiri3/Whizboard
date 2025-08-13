import { motion } from 'framer-motion';
import Link from 'next/link';
import { NavigationItem } from '../types';

interface NavigationLinkProps {
  item: NavigationItem;
  isLightMode: boolean;
  onClick?: () => void;
}

const NavigationLink = ({ item, isLightMode, onClick }: NavigationLinkProps) => {
  const textColor = isLightMode 
    ? 'text-gray-700 hover:text-gray-950' 
    : 'text-white/70 hover:text-white';
  
  const hoverBg = isLightMode 
    ? 'hover:bg-gray-100/80' 
    : 'hover:bg-white/5';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={item.href}
        onClick={onClick}
        className={`group px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${textColor} ${hoverBg}`}
      >
        <span>{item.label}</span>
      </Link>
    </motion.div>
  );
};

export default NavigationLink; 