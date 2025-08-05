"use client";

import { useState, useEffect } from "react";
import { X, Edit3, Loader2, Save } from "lucide-react";
import { gql, useMutation } from "@apollo/client";

const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: String!, $name: String!) {
    updateBoard(id: $id, name: $name) {
      id
      name
    }
  }
`;

interface RenameBoardModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: (board: { id: string; name: string }) => void;
  board: { id: string; name: string } | null;
  isMobile?: boolean;
  isTablet?: boolean;
}

export default function RenameBoardModal({
  isOpen,
  onCloseAction,
  onSuccessAction,
  board,
  isMobile = false,
  isTablet = false,
}: RenameBoardModalProps) {
  const [boardName, setBoardName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [initialName, setInitialName] = useState("");

  // Responsive settings
  const isSmallScreen = isMobile || isTablet;

  const [updateBoard, { loading: isUpdating }] = useMutation(UPDATE_BOARD, {
    onCompleted: (data) => {
      onSuccessAction(data.updateBoard);
      onCloseAction();
    },
    onError: (error) => {
      console.error("Error updating board:", error);
    },
  });

  useEffect(() => {
    if (isOpen && board) {
      setIsVisible(true);
      setBoardName(board.name);
      setInitialName(board.name);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => {
        setBoardName("");
        setInitialName("");
      }, 300);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, board]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!boardName.trim() || !board || boardName.trim() === initialName)
        return;
      updateBoard({
        variables: {
          id: board.id,
          name: boardName.trim(),
        },
      });
    } else if (e.key === "Escape") {
      onCloseAction();
    }
  };

  if (!isOpen || !board) return null;

  const hasChanges =
    boardName.trim() !== initialName && boardName.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[10000] flex min-h-[100vh] items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative flex w-full flex-col rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          // Responsive sizing and spacing
          isSmallScreen 
            ? "mx-4 max-w-sm" 
            : "mx-4 max-w-md sm:mx-8"
        } ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b border-gray-100 ${isSmallScreen ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg ${isSmallScreen ? 'h-8 w-8' : 'h-10 w-10'}`}>
              <Edit3 className={`text-white ${isSmallScreen ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </div>
            <div>
              <h2 className={`font-bold text-gray-900 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>Rename Board</h2>
              <p className={`text-gray-600 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
                Give your board a new name
              </p>
            </div>
          </div>
          <button
            onClick={onCloseAction}
            className={`rounded-xl transition-colors duration-200 hover:bg-gray-100 ${isSmallScreen ? 'p-1.5' : 'p-2'}`}
            disabled={isUpdating}
            aria-label="Close modal"
          >
            <X className={`text-gray-600 ${isSmallScreen ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        </div>
        <div className={`flex-1 ${isSmallScreen ? 'space-y-4 p-4' : 'space-y-6 p-6'}`}>
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm text-gray-600">Current name</p>
                <p className="truncate font-medium text-gray-900">
                  {initialName}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label
              htmlFor="boardName"
              className="block text-sm font-medium text-gray-900"
            >
              New Board Name
            </label>
            <div className="relative">
              <input
                id="boardName"
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter new board name..."
                className={`w-full rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 font-light transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSmallScreen 
                    ? 'text-sm px-3 py-2.5' 
                    : 'text-md px-4 py-3'
                } ${isMobile ? 'touch-manipulation' : ''}`}
                autoFocus
                maxLength={100}
                disabled={isUpdating}
                aria-describedby="char-count"
              />
              {hasChanges && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span id="char-count" className="text-gray-500">
                {boardName.length}/100 characters
              </span>
              {hasChanges && (
                <span className="font-medium text-green-600">
                  Ready to save
                </span>
              )}
            </div>
          </div>
          <div className={`flex flex-col gap-3 ${isSmallScreen ? 'pt-3' : 'pt-4'} sm:flex-row`}>
            <button
              onClick={onCloseAction}
              className={`flex-1 rounded-xl bg-gray-100 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSmallScreen ? 'px-4 py-2.5' : 'px-6 py-3'
              } ${isMobile ? 'touch-manipulation' : ''}`}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (
                  !boardName.trim() ||
                  !board ||
                  boardName.trim() === initialName
                )
                  return;
                updateBoard({
                  variables: { id: board.id, name: boardName.trim() },
                });
              }}
              disabled={!hasChanges || isUpdating}
              className={`flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none ${
                isSmallScreen ? 'px-4 py-2.5' : 'px-6 py-3'
              } ${isMobile ? 'touch-manipulation' : ''}`}
            >
              {isUpdating ? (
                <>
                  <Loader2 className={`animate-spin ${isSmallScreen ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  Saving...
                </>
              ) : (
                <>
                  <Save className={isSmallScreen ? 'h-4 w-4' : 'h-5 w-5'} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
