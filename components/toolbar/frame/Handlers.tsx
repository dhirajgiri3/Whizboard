import { toast as sonnerToast } from "sonner";
import { FrameElement, FramePreset } from "./types";
import { AlertCircle, Copy } from "lucide-react";

export const handlePresetClick = (
  preset: FramePreset,
  onFrameCreateAction: (preset: FramePreset, x?: number, y?: number) => void,
  x?: number,
  y?: number
) => {
  onFrameCreateAction(preset, x, y);
  sonnerToast.success(`Created ${preset.name} frame`);
};

export const handleDeleteFrame = (
  selectedFrames: FrameElement[],
  selectedFrameIds: string[],
  onFrameDeleteAction?: (frameId: string) => void,
  onFrameDeleteMultipleAction?: (frameIds: string[]) => void
) => {
  if (selectedFrames.length === 0) return;

  const isMultiple = selectedFrames.length > 1;
  const actionText = isMultiple
    ? `Delete ${selectedFrames.length} Frames?`
    : "Delete Frame?";

  const toastId = sonnerToast(
    <div className="flex flex-col gap-1">
      <div className="font-medium">{actionText}</div>
      <div className="text-sm text-gray-500">
        This action cannot be undone.
      </div>
    </div>,
    {
      duration: 5000,
      action: {
        label: "Delete",
        onClick: () => {
          if (isMultiple && onFrameDeleteMultipleAction) {
            onFrameDeleteMultipleAction(selectedFrameIds);
            sonnerToast.success(`${selectedFrames.length} frames deleted`);
          } else if (!isMultiple && onFrameDeleteAction) {
            onFrameDeleteAction(selectedFrames[0].id);
            sonnerToast.success("Frame deleted");
          }
          sonnerToast.dismiss(toastId);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => sonnerToast.dismiss(toastId),
      },
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
    }
  );
};

export const handleStartRename = (
  selectedFrames: FrameElement[],
  setIsRenaming: (value: boolean) => void,
  setRenameValue: (value: string) => void
) => {
  if (selectedFrames.length === 1) {
    setIsRenaming(true);
    setRenameValue(selectedFrames[0].name);
    setTimeout(() => {
      const input = document.querySelector(
        "[data-rename-input]"
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 10);
  }
};

export const handleFinishRename = (
  selectedFrames: FrameElement[],
  renameValue: string,
  setIsRenaming: (value: boolean) => void,
  setRenameValue: (value: string) => void,
  onFrameRenameAction?: (frameId: string, newName: string) => void
) => {
  if (
    selectedFrames.length === 1 &&
    renameValue.trim() &&
    onFrameRenameAction
  ) {
    const trimmedName = renameValue.trim();
    if (trimmedName !== selectedFrames[0].name) {
      onFrameRenameAction(selectedFrames[0].id, trimmedName);
      sonnerToast.success("Frame renamed");
    }
  }
  setIsRenaming(false);
  setRenameValue("");
};

export const handleCancelRename = (
  setIsRenaming: (value: boolean) => void,
  setRenameValue: (value: string) => void
) => {
  setIsRenaming(false);
  setRenameValue("");
};

export const handleAlignFrames = (
  alignment: "left" | "center" | "right" | "top" | "middle" | "bottom",
  onFrameAlignAction?: (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => void
) => {
  if (onFrameAlignAction) {
    onFrameAlignAction(alignment);
    sonnerToast.success(`Frames aligned to ${alignment}`);
  }
};

export const handleDistributeFrames = (
  direction: "horizontal" | "vertical",
  onFrameDistributeAction?: (direction: "horizontal" | "vertical") => void
) => {
  if (onFrameDistributeAction) {
    onFrameDistributeAction(direction);
    sonnerToast.success(`Frames distributed ${direction}ly`);
  }
};

export const handleDuplicateFrames = (
  selectedFrames: FrameElement[],
  primarySelectedFrame: FrameElement | null,
  onFrameCreateAction: (preset: FramePreset) => void
) => {
  if (!primarySelectedFrame) return;

  const isMultiple = selectedFrames.length > 1;

  if (isMultiple) {
    selectedFrames.forEach((frame, index) => {
      const newFrame = {
        ...frame,
        id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
        x: frame.x + 20,
        y: frame.y + 20,
        name: `${frame.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };

      onFrameCreateAction({
        id: newFrame.id,
        name: newFrame.name,
        category: "custom",
        dimensions: { width: newFrame.width, height: newFrame.height },
        icon: <Copy size={16} />,
        frameType: newFrame.frameType,
        defaultStyle: newFrame.style || {},
      });
    });
    sonnerToast.success(`${selectedFrames.length} frames duplicated`);
  } else {
    const newFrame = {
      ...primarySelectedFrame,
      id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: primarySelectedFrame.x + 20,
      y: primarySelectedFrame.y + 20,
      name: `${primarySelectedFrame.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    onFrameCreateAction({
      id: newFrame.id,
      name: newFrame.name,
      category: "custom",
      dimensions: { width: newFrame.width, height: newFrame.height },
      icon: <Copy size={16} />,
      frameType: newFrame.frameType,
      defaultStyle: newFrame.style || {},
    });
    sonnerToast.success("Frame duplicated");
  }
};

export const handleDeselectFrames = (
  onFrameDeselectAction?: () => void
) => {
  if (onFrameDeselectAction) {
    onFrameDeselectAction();
    sonnerToast.success("Frames deselected");
  }
};