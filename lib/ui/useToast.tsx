"use client";

import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";

type ToastOptions = {
  description?: ReactNode;
  action?: { label: string; onClick: () => void };
  cancel?: { label: string; onClick: () => void };
  duration?: number;
};

export const toast = {
  success: (title: ReactNode, options: ToastOptions = {}) =>
    sonnerToast.success(title as any, mapOptions(options)),
  error: (title: ReactNode, options: ToastOptions = {}) =>
    sonnerToast.error(title as any, mapOptions(options)),
  info: (title: ReactNode, options: ToastOptions = {}) =>
    sonnerToast.info(title as any, mapOptions(options)),
  warning: (title: ReactNode, options: ToastOptions = {}) =>
    sonnerToast.warning(title as any, mapOptions(options)),
  message: (title: ReactNode, options: ToastOptions = {}) =>
    sonnerToast(title as any, mapOptions(options)),
};

function mapOptions(options: ToastOptions) {
  const { description, action, cancel, duration } = options;
  return {
    description,
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    cancel: cancel
      ? {
          label: cancel.label,
          onClick: cancel.onClick,
        }
      : undefined,
  } as any;
}

export default toast;


