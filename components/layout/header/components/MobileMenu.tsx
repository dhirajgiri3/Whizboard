import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '@/lib/context/AppContext';
import { X, ChevronRight, LogOut, Home, Layout } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { MenuItem, UserMenuItem } from '../types';
import { headerAnimations, darkHeaderAnimations } from '../utils/animations';
import CreateBoardButton from './CreateBoardButton';
import logo from '@/public/images/logos/whizboard_logo.png';

interface MobileMenuProps {
  isOpen: boolean;
  status: string;
  session: any;
  onClose: () => void;
  onCreateBoard: () => void;
  isLightMode: boolean;
  companyMenuItems: MenuItem[];
  supportMenuItems: MenuItem[];
  userMenuItems: UserMenuItem[];
}

const MobileMenu = ({
  isOpen,
  status,
  session,
  onClose,
  onCreateBoard,
  isLightMode,
  companyMenuItems,
  supportMenuItems,
  userMenuItems,
}: MobileMenuProps) => {
  const animations = isLightMode ? headerAnimations : darkHeaderAnimations;
  
  const menuBg = isLightMode
    ? 'bg-white/95 backdrop-blur-xl'
    : 'bg-[#111111]/95 backdrop-blur-xl';
  
  const borderColor = isLightMode
    ? 'border-gray-100'
    : 'border-white/10';
  
  const textColor = isLightMode
    ? 'text-gray-600'
    : 'text-white/70';
  
  const buttonBg = isLightMode
    ? 'hover:bg-gray-100'
    : 'hover:bg-white/5';
  
  const backdropBg = isLightMode
    ? 'bg-black/20'
    : 'bg-black/40';

  const { user: appUser } = useAppContext();
  const avatarUrl = appUser?.avatar || session?.user?.image || '';
  const displayName = appUser?.name || session?.user?.name || appUser?.email || session?.user?.email || 'U';
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase();
  const bgColor = (() => {
    const key = (appUser?.email || session?.user?.email || 'user').toLowerCase();
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 45%)`;
  })();

  // Separate account items from logout
  const accountItems = userMenuItems.filter(item => item.label !== 'Sign Out');
  const logoutItem = userMenuItems.find(item => item.label === 'Sign Out');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${backdropBg} backdrop-blur-sm z-40 lg:hidden`}
            onClick={onClose}
          />
          
          {/* Mobile Menu */}
          <motion.div
            variants={animations.mobileMenu}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`fixed top-0 left-0 right-0 ${menuBg} backdrop-blur-enhanced z-50 lg:hidden shadow-2xl ${!isLightMode ? 'dark' : ''}`}
            style={{ 
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              backgroundColor: isLightMode 
                ? 'rgba(255, 255, 255, 0.95)' 
                : 'rgba(17, 17, 17, 0.95)'
            }}
          >
            {/* Mobile Header */}
            <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${borderColor}`}>
              <motion.div
                variants={animations.mobileMenuItem}
                className="flex items-center gap-3"
              >
                <Image
                  src={logo}
                  alt="WhizBoard Logo"
                  width={80}
                  height={80}
                  className="w-16 sm:w-20 h-auto object-contain"
                />
              </motion.div>
              
              <motion.button
                variants={animations.mobileMenuItem}
                onClick={onClose}
                className={`p-2 rounded-full ${buttonBg} transition-colors`}
                aria-label="Close menu"
              >
                <X className={`w-5 h-5 sm:w-6 sm:h-6 ${textColor}`} />
              </motion.button>
            </div>

            {/* Menu Content */}
            <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
              <div className="py-4 sm:py-6 space-y-6 sm:space-y-8">
                {status === 'authenticated' ? (
                  <>
                    {/* User Info Section */}
                    <motion.div
                      variants={animations.mobileMenuItem}
                      className="px-4 sm:px-6"
                    >
                      <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl ${
                        isLightMode 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50' 
                          : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10'
                      }`}>
                        <div className="relative">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt="User Avatar"
                              width={48}
                              height={48}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-3 object-cover ${
                                isLightMode ? 'ring-blue-200' : 'ring-blue-500/30'
                              }`}
                            />
                          ) : (
                            <div
                              aria-label="User Avatar Fallback"
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-3 flex items-center justify-center text-white ${
                                isLightMode ? 'ring-blue-200' : 'ring-blue-500/30'
                              }`}
                              style={{ backgroundColor: bgColor }}
                            >
                              <span className="text-sm sm:text-base font-semibold">{initial}</span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm sm:text-base font-bold truncate ${
                            isLightMode ? 'text-gray-900' : 'text-white'
                          }`}>
                            {session?.user?.name || 'User'}
                          </div>
                          <div className={`text-xs sm:text-sm truncate ${
                            isLightMode ? 'text-gray-600' : 'text-white/70'
                          }`}>
                            {session?.user?.email}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Create Board Button */}
                    <motion.div
                      variants={animations.mobileMenuItem}
                      className="px-4 sm:px-6"
                    >
                      <CreateBoardButton onClick={onCreateBoard} isMobile isLightMode={isLightMode} />
                    </motion.div>

                    {/* Navigation Section */}
                    <MobileMenuSection title="Navigation" isLightMode={isLightMode}>
                      <MobileMenuLink
                        href="/"
                        icon={Home}
                        label="Home"
                        description="Go to home page"
                        onClick={onClose}
                        isLightMode={isLightMode}
                      />
                      <MobileMenuLink
                        href="/my-boards"
                        icon={Layout}
                        label="My Boards"
                        description="View your boards"
                        onClick={onClose}
                        isLightMode={isLightMode}
                      />
                    </MobileMenuSection>

                    {/* Account Section */}
                    <MobileMenuSection title="Account" isLightMode={isLightMode}>
                      {accountItems.map((item) => (
                        <MobileMenuLink
                          key={item.label}
                          href={item.href}
                          icon={item.icon}
                          label={item.label}
                          description={item.description}
                          onClick={onClose}
                          isLightMode={isLightMode}
                        />
                      ))}
                      {/* Logout button in account section */}
                      {logoutItem && (
                        <MobileMenuLink
                          icon={logoutItem.icon}
                          label={logoutItem.label}
                          description={logoutItem.description}
                          variant="danger"
                          onClick={() => {
                            onClose();
                            signOut();
                          }}
                          isLightMode={isLightMode}
                        />
                      )}
                    </MobileMenuSection>

                    {/* Company Section */}
                    <MobileMenuSection title="Company" isLightMode={isLightMode}>
                      {companyMenuItems.map((item) => (
                        <MobileMenuLink
                          key={item.label}
                          href={item.href}
                          icon={item.icon}
                          label={item.label}
                          description={item.description}
                          onClick={onClose}
                          isLightMode={isLightMode}
                        />
                      ))}
                    </MobileMenuSection>

                    {/* Support Section */}
                    <MobileMenuSection title="Support" isLightMode={isLightMode}>
                      {supportMenuItems.map((item) => (
                        <MobileMenuLink
                          key={item.label}
                          href={item.href}
                          icon={item.icon}
                          label={item.label}
                          description={item.description}
                          onClick={onClose}
                          isLightMode={isLightMode}
                        />
                      ))}
                    </MobileMenuSection>
                  </>
                ) : (
                  <>
                    {/* Company Section */}
                    <MobileMenuSection title="Company" isLightMode={isLightMode}>
                      {companyMenuItems.map((item) => (
                        <MobileMenuLink
                          key={item.label}
                          href={item.href}
                          icon={item.icon}
                          label={item.label}
                          description={item.description}
                          onClick={onClose}
                          isLightMode={isLightMode}
                        />
                      ))}
                    </MobileMenuSection>

                    {/* Support Section */}
                    <MobileMenuSection title="Support" isLightMode={isLightMode}>
                      {supportMenuItems.map((item) => (
                        <MobileMenuLink
                          key={item.label}
                          href={item.href}
                          icon={item.icon}
                          label={item.label}
                          description={item.description}
                          onClick={onClose}
                          isLightMode={isLightMode}
                        />
                      ))}
                    </MobileMenuSection>

                    {/* Auth Buttons */}
                    <div className="px-4 sm:px-6 space-y-3 sm:space-y-4">
                      <motion.div variants={animations.mobileMenuItem}>
                        <Link
                          href="/login"
                          className={`block w-full px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium rounded-2xl transition-all duration-300 text-center border ${
                            isLightMode
                              ? 'text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200'
                              : 'text-white/70 bg-white/5 hover:bg-white/10 border-white/10'
                          }`}
                          onClick={onClose}
                        >
                          Sign In
                        </Link>
                      </motion.div>

                      <motion.div variants={animations.mobileMenuItem}>
                        <Link
                          href="/login"
                          className="block w-full px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl transition-all duration-300 text-center shadow-sm"
                          onClick={onClose}
                        >
                          Get Started
                        </Link>
                      </motion.div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper Components
const MobileMenuSection = ({ 
  title, 
  children,
  isLightMode
}: { 
  title: string; 
  children: React.ReactNode;
  isLightMode: boolean;
}) => (
  <motion.div
    variants={(isLightMode ? headerAnimations : darkHeaderAnimations).mobileMenuItem}
    className="space-y-2"
  >
    <div className={`px-4 sm:px-6 py-2 text-xs font-semibold uppercase tracking-wider ${
      isLightMode ? 'text-gray-500' : 'text-white/50'
    }`}>
      {title}
    </div>
    {children}
  </motion.div>
);

const MobileMenuLink = ({ 
  href, 
  icon: Icon, 
  label, 
  description, 
  onClick,
  variant = "default",
  isLightMode
}: {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onClick?: () => void;
  variant?: "default" | "danger";
  isLightMode: boolean;
}) => {
  const baseClasses = `flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium rounded-2xl mx-3 transition-all duration-300 group active:scale-[0.98]`;
  
  const variantClasses = variant === "danger" 
    ? (isLightMode 
        ? 'text-red-600 hover:bg-red-50/80 focus:bg-red-50/80' 
        : 'text-red-400 hover:bg-red-500/10 focus:bg-red-500/10')
    : (isLightMode 
        ? 'text-gray-700 hover:bg-gray-50/80 focus:bg-gray-50/80' 
        : 'text-white/70 hover:bg-white/5 focus:bg-white/5');

  const iconBg = variant === "danger" 
    ? (isLightMode 
        ? 'bg-red-100/80 group-hover:bg-red-200/80 group-focus:bg-red-200/80' 
        : 'bg-red-500/20 group-hover:bg-red-500/30 group-focus:bg-red-500/30')
    : (isLightMode 
        ? 'bg-gray-100/80 group-hover:bg-blue-100/80 group-focus:bg-blue-100/80' 
        : 'bg-white/10 group-hover:bg-blue-500/20 group-focus:bg-blue-500/20');

  const iconColor = variant === "danger" 
    ? (isLightMode ? 'text-red-600' : 'text-red-400')
    : (isLightMode ? 'text-gray-600 group-hover:text-blue-600' : 'text-white/60 group-hover:text-blue-400');

  const chevronColor = isLightMode 
    ? 'text-gray-400 group-hover:text-gray-600' 
    : 'text-white/40 group-hover:text-white/60';

  const content = (
    <>
      <div className={`p-2.5 sm:p-3 rounded-xl transition-colors ${iconBg}`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{label}</div>
        <div className={`text-xs mt-0.5 truncate ${
          isLightMode ? 'text-gray-500' : 'text-white/50'
        }`}>{description}</div>
      </div>
      <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${chevronColor} flex-shrink-0`} />
    </>
  );

  if (href) {
    return (
      <motion.div variants={(isLightMode ? headerAnimations : darkHeaderAnimations).mobileMenuItem}>
        <Link
          href={href}
          className={`${baseClasses} ${variantClasses}`}
          onClick={onClick}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={(isLightMode ? headerAnimations : darkHeaderAnimations).mobileMenuItem}>
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses} w-full text-left`}
      >
        {content}
      </button>
    </motion.div>
  );
};

export default MobileMenu; 