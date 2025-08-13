import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { MenuItem } from '../types';
import { headerAnimations, darkHeaderAnimations } from '../utils/animations';

interface DropdownMenuProps {
  label: string;
  items: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
  isLightMode: boolean;
}

const DropdownMenu = ({
  label,
  items,
  isOpen,
  onToggle,
  isLightMode
}: DropdownMenuProps) => {
  const animations = isLightMode ? headerAnimations : darkHeaderAnimations;
  
  const textColor = isLightMode 
    ? 'text-gray-700 hover:text-gray-950' 
    : 'text-white/70 hover:text-white';
  
  const dropdownBg = isLightMode 
    ? 'bg-white border-gray-200' 
    : 'bg-[#111111] border-white/10';
  
  const itemHoverBg = isLightMode 
    ? 'hover:bg-gray-50/80' 
    : 'hover:bg-white/5';
  
  const itemTextColor = isLightMode 
    ? 'text-gray-700 hover:text-gray-900' 
    : 'text-white/70 hover:text-white';
  
  const iconBg = isLightMode 
    ? 'bg-gray-100/80 group-hover:bg-blue-100/80' 
    : 'bg-white/10 group-hover:bg-blue-500/20';
  
  const iconColor = isLightMode 
    ? 'text-gray-600 group-hover:text-blue-600' 
    : 'text-white/60 group-hover:text-blue-400';

  return (
    <div className="relative">
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`group px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${textColor}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`absolute top-full left-0 mt-3 w-72 ${dropdownBg} rounded-2xl shadow-2xl border py-3 z-50`}
            role="menu"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm ${itemTextColor} ${itemHoverBg} transition-all duration-200 group`}
                  onClick={onToggle}
                  role="menuitem"
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${iconBg}`}>
                    <item.icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs mt-0.5 ${isLightMode ? 'text-gray-500' : 'text-white/50'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownMenu; 