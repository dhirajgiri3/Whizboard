"use client";

import { useState, useEffect } from "react";
import { X, Plus, Palette, Zap, Users, Loader2, Info } from "lucide-react";
import { gql, useMutation } from "@apollo/client";

const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!) {
    createBoard(name: $name) {
      id
      name
    }
  }
`;

interface CreateBoardModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: (board: { id: string; name: string }) => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

const boardTemplates = [
  {
    id: "brainstorm",
    name: "Brainstorming",
    description: "Capture ideas and inspiration",
    gradient: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    icon: Zap,
  },
  {
    id: "design",
    name: "Design Review",
    description: "Collaborate on designs and mockups",
    gradient: "linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)",
    icon: Palette,
  },
  {
    id: "planning",
    name: "Project Planning",
    description: "Plan sprints and roadmaps",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    icon: Users,
  },
  {
    id: "blank",
    name: "Blank Board",
    description: "Start with a clean canvas",
    gradient: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
    icon: Plus,
  },
];

export default function CreateBoardModal({
  isOpen,
  onCloseAction,
  onSuccessAction,
  isMobile,
  isTablet,
}: CreateBoardModalProps) {
  const [boardName, setBoardName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(boardTemplates[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"template" | "details">("template");
  const [error, setError] = useState<string | null>(null);

  const [createBoard, { loading: isCreating }] = useMutation(CREATE_BOARD, {
    onCompleted: (data) => {
      setError(null);
      onSuccessAction(data.createBoard);
      // Don't close the modal here - let the parent component handle the modal flow
    },
    onError: (error) => {
      console.error("Error creating board:", error);
      setError("Failed to create board. Please try again.");
    },
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      setError(null); // Clear any previous errors
      const timestamp = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      setBoardName(`${selectedTemplate.name} - ${timestamp}`);
    } else {
      document.body.style.overflow = "unset";
      setIsVisible(false);
      // Reset the modal state when closing
      setTimeout(() => {
        setStep("template");
        setBoardName("");
        setSelectedTemplate(boardTemplates[0]);
        setError(null);
      }, 300);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, selectedTemplate.name]);

  // Close on Escape for accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseAction();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCloseAction]);

  const handleCreateBoard = async () => {
    if (!boardName.trim()) return;
    await createBoard({ variables: { name: boardName.trim() } });
  };

  const handleTemplateSelect = (template: (typeof boardTemplates)[0]) => {
    setSelectedTemplate(template);
    const timestamp = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    setBoardName(`${template.name} - ${timestamp}`);
    setStep("details");
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex min-h-[100vh] items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onCloseAction}
      aria-hidden={!isOpen}
    >
      <div
        className={`relative flex w-full flex-col rounded-2xl border border-white/10 bg-[#111111] shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isMobile
            ? "mx-2 max-w-sm h-[90vh] max-h-[600px]"
            : isTablet
              ? "mx-4 max-w-md h-[85vh] max-h-[700px]"
              : "mx-4 max-w-2xl sm:mx-8"
        } ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-board-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b border-white/10 ${isMobile ? "p-4" : "p-6"}`}>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/15 p-2" aria-hidden="true">
              <Plus className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-white/80`} />
            </div>
            <div>
              <h2 id="create-board-title" className={`font-bold text-white ${isMobile ? "text-lg" : "text-xl"}`}>
                Create New Board
              </h2>
              <p className={`${isMobile ? "text-xs" : "text-sm"} text-white/50`}>
                {step === "template" ? "Choose a template to get started" : "Customize your board"}
              </p>
            </div>
          </div>
          <button
            onClick={onCloseAction}
            className={`w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center transition-colors ${isMobile ? 'touch-manipulation' : ''}`}
            disabled={isCreating}
            aria-label="Close modal"
          >
            <X className={`w-4 h-4 text-white/80`} />
          </button>
        </div>
        <div className={`flex-1 space-y-6 overflow-y-auto ${isMobile ? "p-4" : "p-6"}`}>
          {step === "template" ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Choose Your Template
                </h3>
                <p className="text-white/70">
                  Select a template that fits your use case, or start with a
                  blank canvas
                </p>
              </div>
              <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : isTablet ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                {boardTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`group rounded-2xl border border-white/[0.06] bg-white/[0.03] text-left transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm ${isMobile ? "p-4 min-h-[80px]" : "p-6"}`}
                    >
                      <div className={`flex items-start ${isMobile ? "gap-3" : "gap-4"}`}>
                        <div
                          className={`flex items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md ${isMobile ? "h-12 w-12" : "h-16 w-16"}`}
                          style={{ background: template.gradient }}
                        >
                          <IconComponent className={`text-white ${isMobile ? "h-5 w-5" : "h-7 w-7"}`} />
                        </div>
                        <div className="flex-1">
                            <h4 className={`mb-1 font-semibold text-white transition-colors group-hover:text-blue-300 ${isMobile ? "text-sm" : "text-base"}`}>
                              {template.name}
                          </h4>
                            <p className={`leading-relaxed text-white/60 ${isMobile ? "text-xs" : "text-sm"}`}>
                              {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                    style={{ background: selectedTemplate.gradient }}
                  >
                    <selectedTemplate.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-white/60">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep("template")}
                  className="text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
                >
                  Change template
                </button>
              </div>
              <div className="space-y-4">
                <label
                  htmlFor="boardName"
                  className="block text-sm font-medium text-white/90"
                >
                  Board Name
                </label>
                <input
                  id="boardName"
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="Enter board name..."
                  className={`w-full rounded-xl text-white placeholder-white/40 text-md font-medium bg-white/[0.05] ring-1 ring-white/10 px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08]`}
                  autoFocus
                  maxLength={100}
                  aria-describedby="char-count"
                />
                <p id="char-count" className="text-xs text-white/50">
                  {boardName.length}/100 characters
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-400" />
                  <h4 className="font-semibold text-white">What you’ll get</h4>
                </div>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    Real-time collaboration
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    Unlimited canvas
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    Professional tools
                  </div>
                </div>
              </div>
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  onClick={onCloseAction}
                  className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={!boardName.trim() || isCreating}
                  className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-6 py-3 font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Board...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Create Board
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
