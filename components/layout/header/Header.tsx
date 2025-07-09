"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Brush,
  Home,
  Grid3X3,
  Plus,
  Menu,
  X,
  Sparkles,
  Bell,
  Search,
} from "lucide-react";
import CreateBoardModal from "@/components/ui/modal/CreateBoardModal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import logo from "@/public/images/logo/whizboard_logo.png";

const Header = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [createdBoard, setCreatedBoard] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Enhanced animation variants
  const headerVariants = {
    transparent: {
      backgroundColor: "rgba(255, 255, 255, 0)",
      backdropFilter: "blur(0px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0)",
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    },
    glass: {
      backgroundColor: "rgba(255, 255, 255, 0)",
      backdropFilter: "blur(0px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0)",
    },
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20, rotate: -10 },
    animate: { opacity: 1, x: 0, rotate: 0 },
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: {
        rotate: {
          duration: 0.4,
          ease: "easeInOut" as const,
        },
        scale: { type: "spring" as const, stiffness: 300, damping: 20 },
      },
    },
  };

  return (
    <>
      <motion.header
        initial="transparent"
        animate={isScrolled ? "glass" : "transparent"}
        variants={headerVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex w-full items-center justify-between py-4">
            {/* Enhanced Logo */}
            <motion.div
              initial="initial"
              animate="animate"
              whileHover="hover"
              variants={logoVariants}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Link href="/" className="flex items-center space-x-3 group">
                <Image
                  src={logo}
                  alt="WhizBoard Logo"
                  width={100}
                  height={100}
                  className="w-40 h-auto object-contain object-center"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            {status === "authenticated" ? (
              <div className="hidden lg:flex items-center space-x-6">
                {/* Enhanced Navigation Links */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex items-center space-x-2"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/"
                      className={`group px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
                        isScrolled
                          ? "text-gray-700 hover:text-gray-800 bg-white hover:bg-blue-50/80"
                          : "text-white hover:text-gray-800 hover:bg-white/70"
                      }`}
                    >
                      <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
                      Home
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/my-boards"
                      className={`group px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
                        isScrolled
                          ? "text-gray-700 hover:text-gray-800 bg-white hover:bg-blue-50/80"
                          : "text-white hover:text-gray-800 hover:bg-white/70"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4 transition-transform group-hover:scale-110" />
                      My Boards
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Enhanced Create Board Button */}
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  onClick={handleCreateBoard}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-full  overflow-hidden"
                >
                  <Plus className="w-4 h-4" />
                  Create Board
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut" as const,
                    }}
                  />
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 blur-xl"
                    animate={{ opacity: [0, 0.7, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>

                {/* Enhanced User Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="relative"
                  ref={dropdownRef}
                >
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                      isScrolled ? "hover:bg-gray-100/80" : "hover:bg-white/70"
                    } ${isDropdownOpen ? "bg-gray-100/60" : ""}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <Image
                        src={session.user?.image || "/default-avatar.png"}
                        alt="User Avatar"
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full ring-2 ring-white/60 group-hover:ring-blue-300/60 transition-all duration-300"
                      />
                    </motion.div>

                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-4 h-4 text-white group-hover:text-gray-700" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 py-4 z-[55] overflow-hidden"
                      >
                        {/* Enhanced User Info */}
                        <div className="px-6 py-4 border-b border-gray-100/80">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="relative"
                            >
                              <Image
                                src={
                                  session.user?.image || "/default-avatar.png"
                                }
                                alt="User Avatar"
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full ring-3 ring-blue-100"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="text-base font-bold text-gray-900 truncate">
                                {session.user?.name || "User"}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {session.user?.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Menu Items */}
                        <div className="py-2">
                          <motion.div
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              href="/profile"
                              className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 group"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="p-2 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium">My Profile</div>
                                <div className="text-xs text-gray-500">
                                  Manage your account
                                </div>
                              </div>
                            </Link>
                          </motion.div>

                          <motion.div
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:text-gray-900 transition-all duration-300 w-full text-left group">
                              <div className="p-2 rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-colors">
                                <Settings className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium">Settings</div>
                                <div className="text-xs text-gray-500">
                                  Preferences & privacy
                                </div>
                              </div>
                            </button>
                          </motion.div>

                          <motion.div
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:text-orange-700 transition-all duration-300 w-full text-left group">
                              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                                <Bell className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium">Notifications</div>
                                <div className="text-xs text-gray-500">
                                  3 unread updates
                                </div>
                              </div>
                            </button>
                          </motion.div>

                          <div className="border-t border-gray-100/80 mt-2 pt-2">
                            <motion.div
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <button
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  signOut();
                                }}
                                className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-300 w-full text-left group"
                              >
                                <div className="p-2 rounded-full bg-red-100 text-red-600 group-hover:bg-red-200 transition-colors">
                                  <LogOut className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium">Sign Out</div>
                                  <div className="text-xs text-gray-500">
                                    See you next time!
                                  </div>
                                </div>
                              </button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="hidden sm:flex items-center space-x-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/login"
                    className={`px-6 py-2.5 text-sm font-medium transition-all duration-300 rounded-full
                      ${
                        isScrolled
                          ? "text-gray-700 border-1 border-gray-700 hover:text-gray-900 bg-white"
                          : "bg-white/10 text-white border-1 border-white/40 hover:bg-white hover:text-gray-700"
                      }`}
                  >
                    Sign In
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/signup"
                    className={`group border-none outline-none relative px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 overflow-hidden ${
                      isScrolled
                        ? "bg-gradient-to-r text-white from-blue-500 to-blue-600"
                        : "bg-white text-gray-700 border-none outline-none backdrop-blur-md hover:bg-blue-50"
                    }`}
                  >
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {/* Enhanced Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`lg:hidden p-3 rounded-full transition-all duration-300 ${
                isScrolled
                  ? "text-gray-600 hover:bg-gray-100/80"
                  : "text-gray-700 hover:bg-white/70"
              } ${isMobileMenuOpen ? "bg-gray-100/60" : ""}`}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </nav>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-white/20 bg-white/95 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-6 space-y-3">
                {status === "authenticated" ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        href="/"
                        className="flex items-center gap-4 px-4 py-4 text-sm font-medium text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 rounded-2xl transition-all duration-300 group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Home</div>
                          <div className="text-xs text-gray-500">
                            Go to homepage
                          </div>
                        </div>
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        href="/my-boards"
                        className="flex items-center gap-4 px-4 py-4 text-sm font-medium text-gray-700 hover:bg-indigo-50/80 hover:text-indigo-600 rounded-2xl transition-all duration-300 group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                          <Grid3X3 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">My Boards</div>
                          <div className="text-xs text-gray-500">
                            View your boards
                          </div>
                        </div>
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <button
                        onClick={handleCreateBoard}
                        className="relative flex items-center gap-4 px-4 py-4 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl w-full group shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-2 rounded-full bg-white/20 text-white group-hover:bg-white/30 transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Create Board</div>
                          <div className="text-xs text-blue-100">
                            Start collaborating
                          </div>
                        </div>
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </button>
                    </motion.div>

                    <div className="border-t border-gray-100/50 pt-3 mt-3">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link
                          href="/profile"
                          className="flex items-center gap-4 px-4 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50/80 rounded-2xl transition-all duration-300 group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="p-2 rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-colors">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">My Profile</div>
                            <div className="text-xs text-gray-500">
                              Account settings
                            </div>
                          </div>
                        </Link>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-4 px-4 py-4 text-sm font-medium text-red-600 hover:bg-red-50/80 rounded-2xl w-full text-left transition-all duration-300 group"
                        >
                          <div className="p-2 rounded-full bg-red-100 text-red-600 group-hover:bg-red-200 transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">Sign Out</div>
                            <div className="text-xs text-gray-500">
                              End your session
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        href="/login"
                        className="relative block px-6 py-4 text-sm font-medium text-gray-700 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl transition-all duration-300 text-center border border-gray-200/60 hover:border-gray-300/60"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="relative z-10">Sign In</span>
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        href="/signup"
                        className="relative block px-6 py-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center overflow-hidden group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Get Started
                        </span>
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        {/* Glow effect */}
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

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
