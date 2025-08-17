"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useHeaderTheme } from "./hooks/useHeaderTheme";
import { headerAnimations, darkHeaderAnimations } from "./utils/animations";
import { navigationItems, companyMenuItems, supportMenuItems, userMenuItems } from "./data/menuItems";
import CreateBoardModal from "@/components/ui/modal/CreateBoardModal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import SlackButton from "@/components/ui/SlackButton";

// Import components
import Logo from "./components/Logo";
import NavigationLink from "./components/NavigationLink";
import DropdownMenu from "./components/DropdownMenu";
import CreateBoardButton from "./components/CreateBoardButton";
import UserAvatar from "./components/UserAvatar";
import UserDropdown from "./components/UserDropdown";
import MobileMenu from "./components/MobileMenu";
import NotificationBell from "./components/NotificationBell";

const Header = () => {
  const { data: session, status } = useSession();
  const { isLightMode } = useHeaderTheme();
  
  // State management
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [createdBoard, setCreatedBoard] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use scroll direction hook
  const { scrollDirection, isScrolled, scrollY } = useScrollDirection(10);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      setActiveDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Update userMenuItems with signOut action
  const updatedUserMenuItems = userMenuItems.map(item => 
    item.label === 'Sign Out' 
      ? { ...item, action: () => signOut() }
      : item
  );

  const handleCreateBoard = () => {
    setShowCreateModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleBoardCreated = (board: { id: string; name: string }) => {
    setCreatedBoard(board);
    setShowCreateModal(false);
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 200);
  };

  // Determine header visibility based on scroll direction
  const shouldShowHeader = scrollDirection === 'up' || scrollY < 100;

  // Theme-based styling with smooth transitions - minimal version
  const animations = isLightMode ? headerAnimations : darkHeaderAnimations;
  
  const headerBg = isLightMode
    ? 'bg-white/90 backdrop-blur-sm border-gray-200/40'
    : 'bg-[#0A0A0B]/90 backdrop-blur-sm border-white/5';
  
  const mobileHeaderBg = isLightMode
    ? 'bg-white/95 backdrop-blur-sm border-gray-100'
    : 'bg-[#0A0A0B]/95 backdrop-blur-sm border-white/5';
  
  const textColor = isLightMode
    ? 'text-gray-600 hover:text-gray-900'
    : 'text-white/70 hover:text-white';
  
  const buttonBg = isLightMode
    ? 'hover:bg-gray-50 active:bg-gray-100'
    : 'hover:bg-white/5 active:bg-white/10';

  return (
    <>
      {/* Desktop Header - Minimal */}
      <motion.header
        className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 max-w-5xl w-full mx-auto px-4 sm:px-6 hidden lg:block"
        variants={animations.header}
        animate={shouldShowHeader ? "visible" : "hidden"}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      >
        <motion.div 
          className={`${headerBg} backdrop-blur-sm rounded-full border ${!isLightMode ? 'dark' : ''}`} 
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          animate={{
            backgroundColor: isLightMode 
              ? 'rgba(255, 255, 255, 0.9)' 
              : 'rgba(10, 10, 11, 0.9)',
            borderColor: isLightMode 
              ? 'rgba(229, 231, 235, 0.4)' 
              : 'rgba(255, 255, 255, 0.05)'
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <nav className="flex w-full items-center justify-between py-2 px-4 lg:px-6">
            {/* Logo */}
            <Logo isLightMode={isLightMode} />

            {/* Desktop Navigation */}
            {status === "authenticated" ? (
              <div className="flex items-center space-x-3 lg:space-x-4">
                {/* Navigation Links */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2 lg:space-x-3"
                >
                  {navigationItems.map((item) => (
                    <NavigationLink
                      key={item.label}
                      item={item}
                      isLightMode={isLightMode}
                    />
                  ))}

                  {/* Company Dropdown */}
                  <DropdownMenu
                    label="Company"
                    items={companyMenuItems}
                    isOpen={activeDropdown === 'company'}
                    onToggle={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
                    isLightMode={isLightMode}
                  />

                  {/* Support Dropdown */}
                  <DropdownMenu
                    label="Support"
                    items={supportMenuItems}
                    isOpen={activeDropdown === 'support'}
                    onToggle={() => setActiveDropdown(activeDropdown === 'support' ? null : 'support')}
                    isLightMode={isLightMode}
                  />
                </motion.div>

                {/* Action Buttons - Compact */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-2"
                >
                  <CreateBoardButton onClick={handleCreateBoard} isLightMode={isLightMode} />
                  <SlackButton
                    variant="default"
                    size="sm"
                    showQuickActions={false}
                    mode={isLightMode ? 'light' : 'dark'}
                  />
                </motion.div>

                {/* User Menu - Compact */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.5 }}
                  className="relative flex items-center gap-2"
                  ref={dropdownRef}
                >
                  <NotificationBell />
                  <UserAvatar
                    session={session}
                    isDropdownOpen={isDropdownOpen}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    isLightMode={isLightMode}
                  />
                  <UserDropdown
                    session={session}
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    isLightMode={isLightMode}
                    userMenuItems={updatedUserMenuItems}
                  />
                </motion.div>
              </div>
            ) : (
              <motion.div
                variants={animations.fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-3 lg:space-x-4"
              >
                {/* Company Dropdown */}
                <DropdownMenu
                  label="Company"
                  items={companyMenuItems}
                  isOpen={activeDropdown === 'company'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
                  isLightMode={isLightMode}
                />

                {/* Support Dropdown */}
                <DropdownMenu
                  label="Support"
                  items={supportMenuItems}
                  isOpen={activeDropdown === 'support'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'support' ? null : 'support')}
                  isLightMode={isLightMode}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href="/login"
                    className={`px-3 py-1.5 text-sm font-medium transition-all duration-300 rounded-xl ${textColor}`}
                  >
                    Sign In
                  </a>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href="/login"
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-300 shadow-sm"
                  >
                    Get Started
                  </a>
                </motion.div>
              </motion.div>
            )}
          </nav>
        </motion.div>
      </motion.header>

      {/* Mobile Header - Minimal */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 lg:hidden"
        variants={animations.header}
        animate={shouldShowHeader ? "visible" : "hidden"}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      >
        <motion.div 
          className={`${mobileHeaderBg} backdrop-blur-sm border-b ${!isLightMode ? 'dark' : ''}`} 
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          animate={{
            backgroundColor: isLightMode 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(10, 10, 11, 0.95)',
            borderColor: isLightMode 
              ? 'rgba(243, 244, 246, 1)' 
              : 'rgba(255, 255, 255, 0.05)'
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <nav className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
            {/* Mobile Logo */}
            <Logo isLightMode={isLightMode} className="flex items-center" />

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${textColor} ${buttonBg} ${
                isMobileMenuOpen ? (isLightMode ? 'bg-gray-50' : 'bg-white/5') : ''
              }`}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </nav>
        </motion.div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        status={status}
        session={session}
        onClose={() => setIsMobileMenuOpen(false)}
        onCreateBoard={handleCreateBoard}
        isLightMode={isLightMode}
        companyMenuItems={companyMenuItems}
        supportMenuItems={supportMenuItems}
        userMenuItems={updatedUserMenuItems}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateBoardModal
          isOpen={showCreateModal}
          onCloseAction={() => setShowCreateModal(false)}
          onSuccessAction={handleBoardCreated}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onCloseAction={() => setShowSuccessModal(false)}
          title="Board Created Successfully!"
          message="Your new board is ready for collaboration. Start drawing, brainstorming, and working with your team."
          boardId={createdBoard?.id}
          boardName={createdBoard?.name}
        />
      )}
    </>
  );
};

export default Header;
