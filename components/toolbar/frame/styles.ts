export const cn = (...classes: (string | undefined | null | boolean)[]) =>
    classes.filter(Boolean).join(" ");
  
  export const toolbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(59, 130, 246, 0.4) transparent;
    }
  
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
  
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
    }
  
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(
        180deg,
        rgba(59, 130, 246, 0.6) 0%,
        rgba(79, 70, 229, 0.4) 100%
      );
      border-radius: 4px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        180deg,
        rgba(59, 130, 246, 0.8) 0%,
        rgba(79, 70, 229, 0.6) 100%
      );
      transform: scaleY(1.2);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }
  
    .custom-scrollbar::-webkit-scrollbar-corner {
      background: transparent;
    }
  
    .slider::-webkit-slider-thumb {
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4),
        0 0 0 1px rgba(59, 130, 246, 0.1);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  
    .slider::-webkit-slider-thumb:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: scale(1.2);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5),
        0 0 0 2px rgba(59, 130, 246, 0.3);
    }
  
    .slider::-webkit-slider-thumb:active {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4),
        0 0 0 3px rgba(59, 130, 246, 0.4);
    }
  
    .slider::-moz-range-thumb {
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  
    .slider::-moz-range-thumb:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: scale(1.2);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
    }
  
    .slider {
      background: linear-gradient(90deg, #dbeafe 0%, #bfdbfe 100%);
      border-radius: 8px;
      outline: none;
      transition: all 0.3s ease;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
  
    .slider:hover {
      background: linear-gradient(90deg, #bfdbfe 0%, #93c5fd 100%);
      border-color: rgba(59, 130, 246, 0.3);
    }
  
    .slider:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      border-color: rgba(59, 130, 246, 0.5);
    }
  
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  
    .animate-slide-in {
      animation: slideIn 0.4s ease-out;
    }
  
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  
    .shadow-3xl {
      box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.15),
        0 8px 16px -8px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.2);
    }
  
    .hover\:shadow-3xl:hover {
      box-shadow: 0 32px 64px -16px rgba(59, 130, 246, 0.2),
        0 12px 24px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.3);
    }
  
    .toolbar-dragging {
      cursor: grabbing !important;
      user-select: none !important;
      filter: brightness(1.05);
    }
  
    .toolbar-dragging * {
      cursor: grabbing !important;
    }
  
    @media (max-height: 600px) {
      .h-\\[70vh\\] {
        height: 90vh !important;
        max-height: 500px !important;
      }
    }
  
    @media (max-height: 400px) {
      .h-\\[70vh\\] {
        height: 95vh !important;
        max-height: 350px !important;
      }
    }
  
    @media (hover: hover) {
      .group:hover .group-hover\\:opacity-100 {
        opacity: 1;
      }
      
      .group:hover .group-hover\\:scale-110 {
        transform: scale(1.1);
      }
    }
  
    @media (hover: none) {
      .group-hover\\:opacity-100 {
        opacity: 1;
      }
    }
  
    .backdrop-blur-xl {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
  
    button:focus-visible {
      outline: 2px solid rgba(59, 130, 246, 0.6);
      outline-offset: 2px;
    }
  
    input:focus-visible {
      outline: 2px solid rgba(59, 130, 246, 0.6);
      outline-offset: 1px;
    }
  `;