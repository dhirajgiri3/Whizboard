import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TextElement } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to create default text formatting
export function createDefaultTextFormatting(): TextElement['formatting'] {
  return {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    highlight: false,
    highlightColor: "#ffff00",
    fontFamily: "Comic Sans MS",
    fontSize: 16,
    color: "#000000",
    align: "left",
    lineHeight: 1.2,
    letterSpacing: 0,
    textTransform: "none",
    listType: "none",
    listStyle: "",
    listLevel: 0,
  };
}

// Utility function to create a complete default text element
export function createDefaultTextElement(overrides?: Partial<TextElement>): Omit<TextElement, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> {
  return {
    type: "text",
    x: 0,
    y: 0,
    width: 200,
    height: 50,
    text: "Type your text here...",
    formatting: createDefaultTextFormatting(),
    style: {
      opacity: 1,
    },
    rotation: 0,
    isEditing: false,
    isSelected: false,
    version: 1,
    ...overrides,
  };
}

// Utility function to merge formatting with defaults
export function mergeTextFormatting(
  current?: Partial<TextElement['formatting']> | null,
  updates?: Partial<TextElement['formatting']>
): TextElement['formatting'] {
  const defaults = createDefaultTextFormatting();
  return {
    ...defaults,
    ...(current || {}),
    ...(updates || {}),
  };
} 