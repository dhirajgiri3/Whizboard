"use client";

import { useState } from "react";
import {
  Plus,
  Zap,
  Users,
  Palette,
  Sparkles,
  Clock,
  Grid3X3,
  Search,
  Play,
  Star,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import CreateBoardModal from "@/components/ui/modal/CreateBoardModal";
import RenameBoardModal from "@/components/ui/modal/RenameBoardModal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import { LoadingOverlay } from "@/components/ui/Loading";
import Header from "@/components/layout/Header";

interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  collaborators: number;
  preview: string;
}

const mockRecentBoards: Board[] = [
  {
    id: "1",
    name: "Product Strategy 2024",
    createdAt: "2025-06-29T10:30:00Z",
    updatedAt: "2025-06-30T09:15:00Z",
    collaborators: 8,
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "2",
    name: "Design System Review",
    createdAt: "2025-06-28T14:20:00Z",
    updatedAt: "2025-06-29T16:45:00Z",
    collaborators: 5,
    preview: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "3",
    name: "Q3 Sprint Planning",
    createdAt: "2025-06-27T11:45:00Z",
    updatedAt: "2025-06-28T13:30:00Z",
    collaborators: 12,
    preview: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "4",
    name: "User Research Insights",
    createdAt: "2025-06-26T09:15:00Z",
    updatedAt: "2025-06-27T14:20:00Z",
    collaborators: 6,
    preview: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager, TechCorp",
    content:
      "CyperBoard has transformed how our team collaborates. The real-time sync is flawless.",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Marcus Rodriguez",
    role: "Design Lead, StartupXYZ",
    content:
      "The drawing tools are incredibly intuitive. Our design reviews are now 10x more efficient.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Emily Watson",
    role: "Engineering Manager, DevCo",
    content:
      "Perfect for remote teams. We use it for everything from brainstorming to architecture planning.",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
  },
];

export default function HomePage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/login";
    },
  });

  const [recentBoards] = useState<Board[]>(mockRecentBoards);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [createdBoard, setCreatedBoard] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleCreateBoard = () => {
    setShowCreateModal(true);
  };

  const handleBoardCreated = (board: { id: string; name: string }) => {
    setCreatedBoard(board);
    setShowCreateModal(false); // Close the create modal first
    setError(null);
    // Add a small delay to ensure smooth transition between modals
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 200);
  };

  const handleRenameBoard = (board: { id: string; name: string }) => {
    setSelectedBoard(board);
    setShowRenameModal(true);
  };

  const handleBoardRenamed = (board: { id: string; name: string }) => {
    console.log("Board renamed:", board);
    setCreatedBoard({
      id: board.id,
      name: `"${board.name}" renamed successfully!`,
    });
    setShowSuccessModal(true);
    setError(null);
  };

  const handleNavigateToBoard = (boardId: string) => {
    router.push(`/board/${boardId}`);
  };

  const filteredBoards = recentBoards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <LoadingOverlay />
      </div>
    );
  }

  return (
    <>
      <Header />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Real-time collaborative whiteboarding
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold text-gray-900 leading-tight md:text-6xl lg:text-7xl">
              Transform ideas into
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                reality
              </span>
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-xl text-gray-600 leading-relaxed">
              The most intuitive collaborative whiteboard for modern teams.
              Brainstorm, design, and build together in real-time.
            </p>
            <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={handleCreateBoard}
                className="group flex min-w-[200px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Board</span>
              </button>
              <button className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>
            <div className="flex flex-col items-center gap-6">
              <p className="text-sm font-medium text-gray-500">
                Trusted by 50,000+ teams worldwide
              </p>
              <div className="flex items-center gap-8 opacity-60">
                <div className="h-8 w-24 rounded bg-gray-300"></div>
                <div className="h-8 w-20 rounded bg-gray-300"></div>
                <div className="h-8 w-28 rounded bg-gray-300"></div>
                <div className="h-8 w-22 rounded bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <span className="text-sm font-bold text-red-600">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-lg leading-none text-red-400 transition-colors hover:text-red-600"
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Everything you need to collaborate
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Powerful features designed for modern teams who want to move fast
              and think together.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Lightning Fast Sync
              </h3>
              <p className="leading-relaxed text-gray-600">
                See every stroke, cursor movement, and change in real-time. No
                lag, no conflicts, just seamless collaboration.
              </p>
            </div>
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Unlimited Collaboration
              </h3>
              <p className="leading-relaxed text-gray-600">
                Invite your entire team, clients, and stakeholders. No limits on
                users or simultaneous editors.
              </p>
            </div>
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Professional Tools
              </h3>
              <p className="leading-relaxed text-gray-600">
                From freehand drawing to precise shapes, sticky notes to
                flowcharts. Everything you need in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {recentBoards.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col items-start gap-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  Your Boards
                </h2>
                <p className="text-gray-600">Continue where you left off</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search boards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 rounded-xl border border-gray-200 py-3 pl-10 pr-4 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Search boards"
                  />
                </div>
                <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900">
                  <Grid3X3 className="h-4 w-4" />
                  Templates
                </button>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredBoards.map((board) => (
                <div
                  key={board.id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  <div
                    className="h-32 relative cursor-pointer overflow-hidden"
                    style={{ background: board.preview }}
                    onClick={() => handleNavigateToBoard(board.id)}
                  >
                    <div className="absolute inset-0 bg-black/5 transition-colors duration-300 group-hover:bg-black/0"></div>
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-sm">
                      <Users className="h-3 w-3 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">
                        {board.collaborators}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3
                          className="mb-2 truncate font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 cursor-pointer"
                          onClick={() => handleNavigateToBoard(board.id)}
                        >
                          {board.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(board.updatedAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameBoard({ id: board.id, name: board.name });
                        }}
                        className="rounded-lg p-2 text-gray-500 opacity-0 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                        title="Rename board"
                        aria-label="Rename board"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredBoards.length === 0 && searchQuery && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No boards found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or create a new board
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Loved by teams everywhere
            </h2>
            <div className="mb-4 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-current text-yellow-400"
                />
              ))}
              <span className="ml-2 text-gray-600">
                4.9/5 from 2,000+ reviews
              </span>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <p className="mb-6 leading-relaxed text-gray-700">
                  “{testimonial.content}”
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to transform your team&apos;s collaboration?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Join thousands of teams already using CyperBoard to bring their
            ideas to life.
          </p>
          <button
            onClick={handleCreateBoard}
            className="group mx-auto flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <span>Start Creating for Free</span>
            <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <span className="text-sm font-bold text-white">C</span>
                </div>
                <span className="text-xl font-bold">CyperBoard</span>
              </div>
              <p className="leading-relaxed text-gray-400">
                The most intuitive collaborative whiteboard for modern teams.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Templates
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Integrations
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  API
                </a>
              </div>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  About
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Careers
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Contact
                </a>
              </div>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Support</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Community
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Status
                </a>
                <a
                  href="#"
                  className="block text-gray-400 transition-colors hover:text-white"
                >
                  Privacy
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center border-t border-gray-800 pt-8 md:flex-row md:justify-between">
            <p className="text-gray-400">
              © 2025 CyperBoard. All rights reserved.
            </p>
            <div className="mt-4 flex items-center gap-6 md:mt-0">
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      <SuccessModal
        isOpen={showSuccessModal}
        onCloseAction={() => setShowSuccessModal(false)}
        title={
          createdBoard?.name?.includes("renamed")
            ? "Board Renamed!"
            : "Board Created Successfully!"
        }
        message={
          createdBoard?.name?.includes("renamed")
            ? "Your board has been renamed successfully."
            : "Your new board is ready for collaboration. Start drawing, brainstorming, and working with your team."
        }
        boardId={createdBoard?.id}
        boardName={createdBoard?.name}
      />

      <CreateBoardModal
        isOpen={showCreateModal}
        onCloseAction={() => setShowCreateModal(false)}
        onSuccessAction={handleBoardCreated}
      />

      <RenameBoardModal
        isOpen={showRenameModal}
        onCloseAction={() => setShowRenameModal(false)}
        onSuccessAction={handleBoardRenamed}
        board={selectedBoard}
      />
    </div>
    </>
  );
}
