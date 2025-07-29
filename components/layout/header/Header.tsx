"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  Users,
  Info,
  HelpCircle,
  MessageSquare,
  FileText,
} from "lucide-react";
import CreateBoardModal from "@/components/ui/modal/CreateBoardModal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import logo from "@/public/images/logo/whizboard_logo.png";

// Types
interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  color: {
    bg: string;
    text: string;
    hover: {
      bg: string;
      text: string;
    };
  };
}

interface UserMenuItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: {
    bg: string;
    text: string;
    hover: {
      bg: string;
      text: string;
    };
  };
  action?: () => void;
}

// Data Objects
const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Home",
    color: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      hover: { bg: "hover:bg-blue-200", text: "hover:text-blue-700" },
    },
  },
  {
    href: "/my-boards",
    label: "My Boards",
    color: {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      hover: { bg: "hover:bg-indigo-200", text: "hover:text-indigo-700" },
    },
  },
];

// Grouped menu items for dropdowns
const companyMenuItems = [
  {
    href: "/about",
    label: "About Us",
    description: "Learn about our mission and team",
    icon: Info,
  },
  {
    href: "/blog",
    label: "Blog",
    description: "Latest updates and insights",
    icon: FileText,
  },
];

const supportMenuItems = [
  {
    href: "/help",
    label: "Help Center",
    description: "Get help and support",
    icon: HelpCircle,
  },
  {
    href: "/contact",
    label: "Contact",
    description: "Get in touch with us",
    icon: MessageSquare,
  },
];

const userMenuItems: UserMenuItem[] = [
  {
    href: "/profile",
    label: "My Profile",
    icon: User,
    description: "Manage your account",
    color: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      hover: { bg: "hover:bg-blue-200", text: "hover:text-blue-700" },
    },
  },
  {
    href: "/team-workspace",
    label: "Team & Workspace",
    icon: Users,
    description: "Manage your team and workspace",
    color: {
      bg: "bg-teal-100",
      text: "text-teal-600",
      hover: { bg: "hover:bg-teal-200", text: "hover:text-teal-700" },
    },
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Preferences & privacy",
    color: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      hover: { bg: "hover:bg-gray-200", text: "hover:text-gray-900" },
    },
  },
  {
    label: "Sign Out",
    icon: LogOut,
    description: "End your session",
    color: {
      bg: "bg-red-100",
      text: "text-red-600",
      hover: { bg: "hover:bg-red-200", text: "hover:text-red-700" },
    },
    action: () => signOut(),
  },
];

// Animation Variants
const animations = {
  header: {
    transparent: {
      backgroundColor: "rgba(255, 255, 255, 0)",
      backdropFilter: "blur(0px)",
    },
    glass: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(20px)",
    },
    hidden: {
      y: "-100%",
      opacity: 0,
    },
    visible: {
      y: "0%",
      opacity: 1,
    },
  },
  logo: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: {
        rotate: { duration: 0.4, ease: "easeInOut" as const },
        scale: { type: "spring" as const, stiffness: 300, damping: 20 },
      },
    },
  },
  fadeInUp: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
  dropdown: {
    initial: { opacity: 0, scale: 0.95, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
  mobileMenu: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" as const },
  },
};

// Reusable Components
const NavigationLink = ({ item, onClick }: {
  item: NavigationItem;
  onClick?: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link
      href={item.href}
      onClick={onClick}
      className="group px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 hover:text-gray-950 transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
    >
      <span>{item.label}</span>
    </Link>
  </motion.div>
);

const DropdownMenu = ({
  label,
  items,
  isOpen,
  onToggle
}: {
  label: string;
  items: Array<{ href: string; label: string; description: string; icon: any }>;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="relative">
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 hover:text-gray-950 transition-all duration-300 flex items-center gap-2"
    >
      <span>{label}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </motion.button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 py-3 z-50"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 group"
                onClick={onToggle}
              >
                <div className="p-2.5 rounded-xl bg-gray-100/80 group-hover:bg-blue-100/80 transition-colors">
                  <item.icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const CreateBoardButton = ({ onClick, isMobile = false }: {
  onClick: () => void;
  isMobile?: boolean;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`group relative flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm ${isMobile ? "w-full" : ""
      }`}
  >
    <Plus className="w-4 h-4" />
    <span className={isMobile ? "" : "hidden lg:inline"}>
      {isMobile ? "Create Board" : "Create Board"}
    </span>
  </motion.button>
);

const UserAvatar = ({ session, isDropdownOpen, onClick }: {
  session: any;
  isDropdownOpen: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`group flex items-center gap-2 px-2 py-1 rounded-full transition-all duration-300 hover:bg-gray-100/80 ${isDropdownOpen ? "bg-gray-100/80" : ""
      }`}
  >
    <motion.div whileHover={{ scale: 1.05 }} className="relative">
      <Image
        src={session.user?.image || "/default-avatar.png"}
        alt="User Avatar"
        width={32}
        height={32}
        className="w-8 h-8 rounded-full ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-300"
      />
    </motion.div>

    <motion.div
      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
    </motion.div>
  </motion.button>
);

const UserDropdown = ({ session, isOpen, onClose }: {
  session: any;
  isOpen: boolean;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        variants={animations.dropdown}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute right-0 mt-3 w-80 lg:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-4 z-[55] overflow-hidden"
      >
        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-100/80">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <Image
                src={session.user?.image || "/default-avatar.png"}
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

        {/* Menu Items */}
        <div className="py-2">
          {userMenuItems.map((item, index) => (
            <motion.div
              key={item.label}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:text-gray-900 transition-all duration-300 group"
                  onClick={onClose}
                >
                  <div className={`p-2 rounded-full ${item.color.bg} ${item.color.text} group-hover:${item.color.hover.bg} transition-colors`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    item.action?.();
                  }}
                  className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-300 w-full text-left group"
                >
                  <div className={`p-2 rounded-full ${item.color.bg} ${item.color.text} group-hover:${item.color.hover.bg} transition-colors`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
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

const MobileMenuItem = ({ item, onClick }: {
  item: NavigationItem;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
  >
    <Link
      href={item.href}
      className={`flex items-center gap-4 px-4 py-4 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-${item.color.bg.split('-')[1]}-50/80 hover:text-${item.color.text.split('-')[1]}-600 rounded-2xl transition-all duration-300 group`}
      onClick={onClick}
    >
      <div>
        <div className="font-medium">{item.label}</div>
        <div className="text-xs text-gray-500">
          {item.description || `Go to ${item.label.toLowerCase()}`}
        </div>
      </div>
    </Link>
  </motion.div>
);

const MobileMenu = ({
  isOpen,
  status,
  onClose,
  onCreateBoard
}: {
  isOpen: boolean;
  status: string;
  onClose: () => void;
  onCreateBoard: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        variants={animations.mobileMenu}
        initial="initial"
        animate="animate"
        exit="exit"
        className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 sm:px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
          {status === "authenticated" ? (
            <>
              {navigationItems.map((item, index) => (
                <MobileMenuItem
                  key={item.label}
                  item={item}
                  onClick={onClose}
                />
              ))}

              {/* Company Menu Items */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company
                </div>
                {companyMenuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="p-2 rounded-lg bg-gray-100">
                        <item.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Support Menu Items */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Support
                </div>
                {supportMenuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="p-2 rounded-lg bg-gray-100">
                        <item.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CreateBoardButton onClick={onCreateBoard} isMobile />
              </motion.div>

              <div className="border-t border-gray-100/50 pt-3 mt-3 space-y-2">
                {userMenuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-4 px-4 py-4 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-${item.color.bg.split('-')[1]}-50/80 hover:text-${item.color.text.split('-')[1]}-600 rounded-2xl transition-all duration-300 group`}
                        onClick={onClose}
                      >
                        <div className={`p-2 rounded-full ${item.color.bg} ${item.color.text} group-hover:${item.color.hover.bg} transition-colors`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          onClose();
                          item.action?.();
                        }}
                        className={`flex items-center gap-4 px-4 py-4 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50/80 rounded-2xl w-full text-left transition-all duration-300 group`}
                      >
                        <div className={`p-2 rounded-full ${item.color.bg} ${item.color.text} group-hover:${item.color.hover.bg} transition-colors`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {/* Company Menu Items */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company
                </div>
                {companyMenuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="p-2 rounded-lg bg-gray-100">
                        <item.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Support Menu Items */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Support
                </div>
                {supportMenuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="p-2 rounded-lg bg-gray-100">
                        <item.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-gray-100/50 pt-3 mt-3 space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/login"
                    className="block px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 text-center border border-gray-200"
                    onClick={onClose}
                  >
                    Sign In
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/signup"
                    className="block px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-300 text-center"
                    onClick={onClose}
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Main Header Component
const Header = () => {
  const { data: session, status } = useSession();
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
      // Close active dropdown when clicking outside
      setActiveDropdown(null);
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



  // Determine header visibility based on scroll direction
  const shouldShowHeader = scrollDirection === 'up' || scrollY < 100;

  return (
    <>
      <motion.header
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8"
        variants={animations.header}
        animate={shouldShowHeader ? "visible" : "hidden"}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      >
        <div className="bg-white/80 backdrop-blur-md rounded-full border">
          <nav className="flex w-full items-center justify-between py-2 px-6">
            {/* Enhanced Logo */}
            <motion.div
              initial="initial"
              animate="animate"
              whileHover="hover"
              variants={animations.logo}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Link href="/" className="flex items-center space-x-3 group">
                <Image
                  src={logo}
                  alt="WhizBoard Logo"
                  width={100}
                  height={100}
                  className="w-24 sm:w-28 h-auto object-contain object-center"
                />

              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            {status === "authenticated" ? (
              <div className="hidden lg:flex items-center space-x-4">
                {/* Navigation Links */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-3"
                >
                  {navigationItems.map((item, index) => (
                    <NavigationLink
                      key={item.label}
                      item={item}
                    />
                  ))}

                  {/* Company Dropdown */}
                  <DropdownMenu
                    label="Company"
                    items={companyMenuItems}
                    isOpen={activeDropdown === 'company'}
                    onToggle={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
                  />

                  {/* Support Dropdown */}
                  <DropdownMenu
                    label="Support"
                    items={supportMenuItems}
                    isOpen={activeDropdown === 'support'}
                    onToggle={() => setActiveDropdown(activeDropdown === 'support' ? null : 'support')}
                  />
                </motion.div>

                {/* Create Board Button */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                >
                  <CreateBoardButton onClick={handleCreateBoard} />
                </motion.div>

                {/* User Menu */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.5 }}
                  className="relative"
                  ref={dropdownRef}
                >
                  <UserAvatar
                    session={session}
                    isDropdownOpen={isDropdownOpen}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  />
                  <UserDropdown
                    session={session}
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                  />
                </motion.div>
              </div>
            ) : (
              <motion.div
                variants={animations.fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
                className="hidden sm:flex items-center space-x-4"
              >
                {/* Company Dropdown */}
                <DropdownMenu
                  label="Company"
                  items={companyMenuItems}
                  isOpen={activeDropdown === 'company'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
                />

                {/* Support Dropdown */}
                <DropdownMenu
                  label="Support"
                  items={supportMenuItems}
                  isOpen={activeDropdown === 'support'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'support' ? null : 'support')}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-full hover:bg-gray-100/80"
                  >
                    Sign In
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/signup"
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full transition-all duration-300 shadow-sm"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`lg:hidden p-1.5 sm:p-2 rounded-full transition-all duration-300 text-gray-600 hover:bg-gray-100/80 ${isMobileMenuOpen ? "bg-gray-100/80" : ""
                }`}
              aria-label="Toggle mobile menu"
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

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          status={status}
          onClose={() => setIsMobileMenuOpen(false)}
          onCreateBoard={handleCreateBoard}
        />
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
