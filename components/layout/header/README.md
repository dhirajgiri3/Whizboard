# Header Component System

## Overview

The header component has been reorganized into a modular system with dark/light theme support based on the `#hero` element visibility.

## Structure

```
components/layout/header/
├── components/           # Individual header components
│   ├── Logo.tsx
│   ├── NavigationLink.tsx
│   ├── DropdownMenu.tsx
│   ├── CreateBoardButton.tsx
│   ├── UserAvatar.tsx
│   ├── UserDropdown.tsx
│   ├── MobileMenu.tsx
│   └── index.ts
├── data/                # Menu items and navigation data
│   └── menuItems.ts
├── hooks/               # Custom hooks
│   └── useHeaderTheme.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utilities and animations
│   └── animations.ts
├── Header.tsx           # Main header component
└── README.md
```

## Theme System

The header automatically switches between dark and light themes based on the `#hero` element visibility:

- **Dark Mode (Default)**: When header is not over the hero section
- **Light Mode**: When header is over the hero section (`#hero` element)

### Theme Detection Logic

The `useHeaderTheme` hook monitors scroll position and checks if the header is over the `#hero` element:

```typescript
const { isLightMode } = useHeaderTheme();
```

## Components

### Logo
- Responsive logo component with theme support
- Hover animations and scaling effects

### NavigationLink
- Individual navigation links with theme-aware styling
- Hover and active states

### DropdownMenu
- Company and Support dropdown menus
- Theme-aware styling and animations
- Accessible keyboard navigation

### CreateBoardButton
- Primary CTA button for creating new boards
- Theme-aware gradient styling

### UserAvatar
- User profile avatar with dropdown trigger
- Online status indicator

### UserDropdown
- User menu with profile, settings, and sign out options
- Theme-aware styling and animations

### MobileMenu
- Full-screen mobile navigation menu
- Organized sections for different user states
- Smooth animations and transitions

## Usage

```tsx
import Header from '@/components/layout/header/Header';

// The header automatically handles theme switching
// based on #hero element visibility
<Header />
```

## Theme Classes

### Light Mode
- Background: `bg-white/80 backdrop-blur-md`
- Text: `text-gray-700 hover:text-gray-950`
- Borders: `border-gray-200/60`

### Dark Mode
- Background: `bg-gray-900/80 backdrop-blur-md`
- Text: `text-white/70 hover:text-white`
- Borders: `border-white/10`

## Animation System

The header uses Framer Motion for smooth animations:

- **Header Visibility**: Slide up/down based on scroll direction
- **Dropdown Animations**: Scale and fade effects
- **Mobile Menu**: Slide and stagger animations
- **Hover Effects**: Subtle scaling and color transitions

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support

## Performance

- Optimized animations with GPU acceleration
- Efficient re-renders with proper memoization
- Passive scroll listeners
- Cleanup on unmount

## Customization

To customize the header:

1. Modify theme classes in individual components
2. Update animation variants in `utils/animations.ts`
3. Add new menu items in `data/menuItems.ts`
4. Extend types in `types/index.ts` 