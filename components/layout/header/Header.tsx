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

  // Theme-based styling with smooth transitions
  const animations = isLightMode ? headerAnimations : darkHeaderAnimations;
  
  const headerBg = isLightMode
    ? 'bg-white/80 backdrop-blur-md border-gray-200/60'
    : 'bg-[#0A0A0B]/80 backdrop-blur-md border-white/10';
  
  const mobileHeaderBg = isLightMode
    ? 'bg-white/95 backdrop-blur-lg border-gray-100'
    : 'bg-[#0A0A0B]/95 backdrop-blur-lg border-white/10';
  
  const textColor = isLightMode
    ? 'text-gray-600 hover:text-gray-900'
    : 'text-white/70 hover:text-white';
  
  const buttonBg = isLightMode
    ? 'hover:bg-gray-100 active:bg-gray-200'
    : 'hover:bg-white/5 active:bg-white/10';

  return (
    <>
      {/* Desktop Header */}
      <motion.header
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 hidden lg:block"
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
          className={`${headerBg} backdrop-blur-enhanced rounded-full border ${!isLightMode ? 'dark' : ''}`} 
          style={{ backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}
          animate={{
            backgroundColor: isLightMode 
              ? 'rgba(255, 255, 255, 0.8)' 
              : 'rgba(10, 10, 11, 0.8)',
            borderColor: isLightMode 
              ? 'rgba(229, 231, 235, 0.6)' 
              : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <nav className="flex w-full items-center justify-between py-3 px-6 lg:px-8">
            {/* Logo */}
            <Logo isLightMode={isLightMode} />

            {/* Desktop Navigation */}
            {status === "authenticated" ? (
              <div className="flex items-center space-x-4 lg:space-x-6">
                {/* Navigation Links */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-3 lg:space-x-4"
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

                {/* Create Board Button */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                >
                  <CreateBoardButton onClick={handleCreateBoard} isLightMode={isLightMode} />
                </motion.div>

                {/* Slack Button */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.45 }}
                >
                  <SlackButton
                    variant="default"
                    size="md"
                    showQuickActions={true}
                    mode={isLightMode ? 'light' : 'dark'}
                  />
                </motion.div>

                {/* User Menu */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.5 }}
                  className="relative flex items-center gap-3 lg:gap-4"
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
                className="flex items-center space-x-4 lg:space-x-6"
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
                    className={`px-3 py-2 text-sm font-medium transition-all duration-300 rounded-full ${textColor}`}
                  >
                    Sign In
                  </a>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full transition-all duration-300 shadow-sm"
                  >
                    Get Started
                  </a>
                </motion.div>
              </motion.div>
            )}
          </nav>
        </motion.div>
      </motion.header>

      {/* Mobile Header */}
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
          className={`${mobileHeaderBg} backdrop-blur-enhanced border-b ${!isLightMode ? 'dark' : ''}`} 
          style={{ backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}
          animate={{
            backgroundColor: isLightMode 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(10, 10, 11, 0.95)',
            borderColor: isLightMode 
              ? 'rgba(243, 244, 246, 1)' 
              : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
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
              className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 ${textColor} ${buttonBg} ${
                isMobileMenuOpen ? (isLightMode ? 'bg-gray-100' : 'bg-white/5') : ''
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
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
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
