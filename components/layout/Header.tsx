"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Settings, LogOut, Palette, Home, Grid3X3, Plus } from 'lucide-react';
import CreateBoardModal from '@/components/ui/modal/CreateBoardModal';
import SuccessModal from '@/components/ui/modal/SuccessModal';

const Header = () => {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdBoard, setCreatedBoard] = useState<{ id: string; name: string } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateBoard = () => {
        setShowCreateModal(true);
    };

    const handleBoardCreated = (board: { id: string; name: string }) => {
        setCreatedBoard(board);
        setShowCreateModal(false); // Close the create modal first
        // Add a small delay to ensure smooth transition between modals
        setTimeout(() => {
            setShowSuccessModal(true);
        }, 200);
    };

    return (
        <header className="bg-white border-b border-gray-100/80 sticky top-0 z-50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            <Palette className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            CyperBoard
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-8">
                        {status === 'authenticated' ? (
                            <>
                                {/* Navigation Links */}
                                <div className="hidden md:flex items-center gap-2">
                                    <Link 
                                        href="/" 
                                        className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 rounded-2xl transition-all duration-300 flex items-center gap-2.5 text-sm font-medium border border-transparent hover:border-gray-100"
                                    >
                                        <Home className="w-4 h-4" />
                                        Home
                                    </Link>
                                    <Link 
                                        href="/my-boards" 
                                        className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 rounded-2xl transition-all duration-300 flex items-center gap-2.5 text-sm font-medium border border-transparent hover:border-gray-100"
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                        My Boards
                                    </Link>
                                </div>

                                {/* Create Board Button */}
                                <button
                                    onClick={handleCreateBoard}
                                    className="hidden sm:flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 shadow-md"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Board
                                </button>

                                {/* User Menu */}
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/80 rounded-2xl transition-all duration-300 group border border-transparent hover:border-gray-100"
                                    >
                                        <Image
                                            src={session.user?.image || '/default-avatar.png'}
                                            alt="User Avatar"
                                            width={36}
                                            height={36}
                                            className="w-9 h-9 rounded-full ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all duration-300"
                                        />
                                        <div className="hidden sm:block text-left">
                                            <div className="text-sm font-semibold text-gray-900 truncate max-w-32">
                                                {session.user?.name || 'User'}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-32">
                                                {session.user?.email}
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100/80 py-3 z-[55] animate-in fade-in slide-in-from-top-5 duration-300 backdrop-blur-xl">
                                            {/* User Info */}
                                            <div className="px-6 py-4 border-b border-gray-100/80">
                                                <div className="flex items-center gap-4">
                                                    <Image
                                                        src={session.user?.image || '/default-avatar.png'}
                                                        alt="User Avatar"
                                                        width={48}
                                                        height={48}
                                                        className="w-12 h-12 rounded-full ring-2 ring-gray-100"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-base font-semibold text-gray-900 truncate">
                                                            {session.user?.name || 'User'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {session.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                {/* Mobile Create Board Button */}
                                                <button 
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        handleCreateBoard();
                                                    }}
                                                    className="flex items-center gap-3 px-6 py-3 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 w-full text-left rounded-2xl mx-2 sm:hidden shadow-md"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    Create New Board
                                                </button>

                                                <Link 
                                                    href="/profile" 
                                                    className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-300 rounded-2xl mx-2"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <User className="w-5 h-5" />
                                                    My Profile
                                                </Link>
                                                
                                                <Link 
                                                    href="/my-boards" 
                                                    className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-300 rounded-2xl mx-2 md:hidden"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <Grid3X3 className="w-5 h-5" />
                                                    My Boards
                                                </Link>

                                                <button className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-300 w-full text-left rounded-2xl mx-2">
                                                    <Settings className="w-5 h-5" />
                                                    Settings
                                                </button>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-100/80 pt-2 mt-2">
                                                <button 
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        signOut();
                                                    }}
                                                    className="flex items-center gap-3 px-6 py-3 text-sm text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-300 w-full text-left rounded-2xl mx-2"
                                                >
                                                    <LogOut className="w-5 h-5" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link 
                                    href="/login"
                                    className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-semibold transition-all duration-300 hover:bg-gray-50/80 rounded-2xl border border-transparent hover:border-gray-100"
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    href="/signup"
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 shadow-md"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>

            {/* Modals - Rendered at document level for proper z-index */}
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
        </header>
    );
};

export default Header;
