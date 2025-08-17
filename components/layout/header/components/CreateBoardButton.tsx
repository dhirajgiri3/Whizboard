import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface CreateBoardButtonProps {
  onClick: () => void;
  isMobile?: boolean;
  isLightMode: boolean;
}

const CreateBoardButton = ({ onClick, isMobile = false, isLightMode }: CreateBoardButtonProps) => {
  const buttonClasses = isLightMode
    ? 'bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white'
    : 'bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium rounded-full transition-all duration-300 shadow-sm ${buttonClasses} ${
        isMobile ? 'w-full' : ''
      }`}
      aria-label="Create new board"
    >
      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Create Board</span>
      <span className="sm:hidden">Create</span>
    </motion.button>
  );
};

export default CreateBoardButton; 