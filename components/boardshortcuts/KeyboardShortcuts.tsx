import React from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsProps {
  show: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ show, onClose }: KeyboardShortcutsProps) {
  if (!show) return null;

  return (
    <div className="fixed z-45 bg-gradient-to-br from-slate-900/95 to-slate-800/95 text-white rounded-2xl px-5 py-4 text-xs opacity-90 hover:opacity-100 transition-all duration-300 backdrop-blur-xl border border-slate-700/50 shadow-2xl
                     bottom-4 left-4 lg:bottom-4 lg:left-4 
                     max-lg:bottom-32 max-lg:left-4 max-lg:max-w-xs
                     max-sm:bottom-36 max-sm:left-2 max-sm:right-2 max-sm:mx-auto max-sm:w-auto max-sm:text-center">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⌨️</span>
          <div className="font-semibold text-amber-300">Keyboard Shortcuts</div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/50"
          title="Hide shortcuts (Press ? to toggle)"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Tools Section */}
        <div>
          <div className="text-cyan-300 font-medium mb-2 text-xs">Tools</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘V
              </kbd>
              <span className="text-slate-300">Select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘P
              </kbd>
              <span className="text-slate-300">Pen</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘⇧S
              </kbd>
              <span className="text-slate-300">Sticky Note</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘⇧C
              </kbd>
              <span className="text-slate-300">Color Picker</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘E
              </kbd>
              <span className="text-slate-300">Eraser</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘R
              </kbd>
              <span className="text-slate-300">Rename</span>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div>
          <div className="text-green-300 font-medium mb-2 text-xs">Actions</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘Z
              </kbd>
              <span className="text-slate-300">Undo</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘Y
              </kbd>
              <span className="text-slate-300">Redo</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘S
              </kbd>
              <span className="text-slate-300">Export</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘/
              </kbd>
              <span className="text-slate-300">Share</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono text-xs">
                Del
              </kbd>
              <span className="text-slate-300">Delete selected</span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <div className="text-orange-300 font-medium mb-2 text-xs">Navigation</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono text-xs">
                Space
              </kbd>
              <span className="text-slate-300">Pan canvas</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono text-xs">
                Scroll
              </kbd>
              <span className="text-slate-300">Zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘0
              </kbd>
              <span className="text-slate-300">Reset view</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘G
              </kbd>
              <span className="text-slate-300">Toggle grid</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘+
              </kbd>
              <span className="text-slate-300">Zoom in</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘-
              </kbd>
              <span className="text-slate-300">Zoom out</span>
            </div>
          </div>
        </div>

        {/* Drawing Section */}
        <div>
          <div className="text-pink-300 font-medium mb-2 text-xs">Drawing</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-mono text-xs">
                1-9
              </kbd>
              <span className="text-slate-300">Brush size</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-mono text-xs">
                H
              </kbd>
              <span className="text-slate-300">Highlighter</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-mono text-xs">
                F
              </kbd>
              <span className="text-slate-300">Frame tool</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘T
              </kbd>
              <span className="text-slate-300">Text tool</span>
            </div>
          </div>
        </div>

        {/* Text Editing Section */}
        <div>
          <div className="text-indigo-300 font-medium mb-2 text-xs">Text Editing</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘B
              </kbd>
              <span className="text-slate-300">Bold</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘I
              </kbd>
              <span className="text-slate-300">Italic</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘U
              </kbd>
              <span className="text-slate-300">Underline</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">
                Esc
              </kbd>
              <span className="text-slate-300">Finish editing</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘Enter
              </kbd>
              <span className="text-slate-300">Finish editing</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">
                Tab
              </kbd>
              <span className="text-slate-300">Insert spaces</span>
            </div>
          </div>
        </div>

        {/* General Section */}
        <div>
          <div className="text-yellow-300 font-medium mb-2 text-xs">General</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded font-mono text-xs">
                Esc
              </kbd>
              <span className="text-slate-300">Close panels</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ?
              </kbd>
              <span className="text-slate-300">Toggle shortcuts</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded font-mono text-xs">
                F11
              </kbd>
              <span className="text-slate-300">Fullscreen</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded font-mono text-xs">
                ⌘K
              </kbd>
              <span className="text-slate-300">Command palette</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <div className="text-slate-400 text-xs text-center">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-300">💡</span>
            Pro tip: Hold <kbd className="bg-slate-700/50 px-1 py-0.5 rounded text-xs">Shift</kbd> for more options
          </span>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcuts;