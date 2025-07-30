# Whizboard Design System - Minimal Modern Dark Theme

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#2563EB` (Tailwind: `blue-600`)
- **Primary Blue Light**: `#3B82F6` (Tailwind: `blue-500`)
- **Primary Blue Ultra Light**: `#60A5FA` (Tailwind: `blue-400`)

### Background Colors
- **Primary Background**: `#0A0A0B` (Near black)
- **Secondary Background**: `#0F0F10` (Card backgrounds)
- **Elevated Background**: `#141416` (Modals, dropdowns)
- **Subtle Background**: `#1A1A1C` (Hover states)

### Text Colors
- **Primary Text**: `#FFFFFF` (Pure white for headings)
- **Secondary Text**: `#E5E5E7` (Body text)
- **Muted Text**: `#A1A1A6` (Supporting text)
- **Disabled Text**: `#6C6C70` (Disabled states)

### Accent Colors
- **Success**: `#059669` (Tailwind: `emerald-600`)
- **Warning**: `#D97706` (Tailwind: `amber-600`)
- **Error**: `#DC2626` (Tailwind: `red-600`)
- **Neutral Accent**: `#6B7280` (Tailwind: `gray-500`)

### Gradient Orbs & Effects
```css
/* Primary Gradient Orb */
.gradient-orb-blue {
  background: radial-gradient(circle, 
    rgba(37, 99, 235, 0.4) 0%, 
    rgba(37, 99, 235, 0.1) 50%, 
    transparent 70%);
  filter: blur(60px);
}

/* Secondary Gradient Orb (Neutral) */
.gradient-orb-neutral {
  background: radial-gradient(circle, 
    rgba(107, 114, 128, 0.2) 0%, 
    rgba(107, 114, 128, 0.05) 50%, 
    transparent 70%);
  filter: blur(80px);
}

/* Tertiary Gradient Orb (Subtle Blue) */
.gradient-orb-subtle-blue {
  background: radial-gradient(circle, 
    rgba(37, 99, 235, 0.2) 0%, 
    rgba(37, 99, 235, 0.05) 50%, 
    transparent 70%);
  filter: blur(40px);
}

/* Grid Pattern Background */
.grid-pattern {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* Subtle Card Gradient */
.card-gradient {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 50%, 
    rgba(255, 255, 255, 0.01) 100%);
}
```

## 🔤 Typography System

### Font Configuration
- **Primary Font**: Maison Neue
- **Font Display**: swap
- **Optimization**: Variable font loading

### Typography Scale
```css
/* Hero Display */
.display-xl {
  font-size: clamp(2.5rem, 5vw, 4rem); /* 40-64px */
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Section Headlines */
.headline-lg {
  font-size: clamp(1.75rem, 3vw, 2.25rem); /* 28-36px */
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Main Heading (e.g., in Feature Section) */
.heading-main {
  font-size: clamp(2rem, 4vw, 3.125rem); /* 32-50px */
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.03em;
  background-clip: text;
  color: transparent;
  background-image: linear-gradient(to right, #60A5FA, #3B82F6); /* blue-400 to blue-500 */
}

/* Card Titles */
.title-md {
  font-size: 1.25rem; /* 20px */
  line-height: 1.3;
  font-weight: 500;
}

/* Body Text */
.body-base {
  font-size: 1rem; /* 16px */
  line-height: 1.6;
  font-weight: 400;
}

/* Small Text */
.text-sm {
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 400;
}

/* Micro Text */
.text-xs {
  font-size: 0.75rem;
  line-height: 1.4;
  font-weight: 500;
}
```

## 🎭 Minimal Visual Effects

### Glass Morphism (Subtle)
```css
.glass-minimal {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-elevated {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Small backdrop blur for cards/elements */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
```

### Subtle Glow Effects
```css
.glow-minimal {
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.15);
}

.glow-focus {
  box-shadow: 
    0 0 0 3px rgba(37, 99, 235, 0.1),
    0 0 20px rgba(37, 99, 235, 0.2);
}
```

### Grid & Pattern Effects
```css
.dot-pattern {
  background-image: radial-gradient(
    circle at 1px 1px, 
    rgba(255, 255, 255, 0.05) 1px, 
    transparent 0
  );
  background-size: 20px 20px;
}

.mesh-gradient {
  background: 
    radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
    radial-gradient(at 100% 100%, rgba(107, 114, 128, 0.08) 0%, transparent 50%);
}
```

## 🎯 Layout System - Bento Grid Approach

### Bento Grid Container
```tsx
// Main Bento Container (e.g., for Features section)
<div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 sm:gap-6 auto-rows-[240px]">
  {/* Bento items with different spans */}
</div>
```

### Bento Grid Patterns
```css
/* Large Feature Card (Drawing & Design) */
.bento-large {
  @apply col-span-1 md:col-span-3 lg:col-span-5 row-span-2;
}

/* Medium Card (e.g., Collaboration, Cross-Platform) */
.bento-medium {
  @apply col-span-1 md:col-span-3 lg:col-span-4 row-span-1;
}

/* Small Card (e.g., Canvas, Security) */
.bento-small {
  @apply col-span-1 md:col-span-3 lg:col-span-3 row-span-1;
}

/* Tall Card (not explicitly used in current Features, but for reference) */
.bento-tall {
  @apply col-span-1 md:col-span-1 lg:col-span-2 row-span-2;
}

/* Wide Card (not explicitly used in current Features, but for reference) */
.bento-wide {
  @apply col-span-1 md:col-span-4 lg:col-span-4 row-span-1;
}
```

## 🧩 Minimal Component System

### Button Components
```tsx
// Primary Button (Minimal)
<button className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200">
  <span className="relative z-10">Get Started</span>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
</button>

// Ghost Button
<button className="text-white/80 hover:text-white hover:bg-white/5 font-medium px-6 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
  Learn More
</button>

// Icon Button
<button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200">
  <Icon className="w-5 h-5" />
</button>
```

### Card Components
```tsx
// Minimal Feature Card (General Base)
<div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm">
  <div className="inline-flex p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
    <Icon className="w-6 h-6 text-blue-400" />
  </div>
  <h3 className="text-lg font-medium text-white">Feature Title</h3>
  <p className="text-white/60 text-sm leading-relaxed">Feature description with clean, minimal styling.</p>
</div>

// Bento Grid Card (Large Example from Features Section)
<div className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] overflow-hidden group hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm">
  {/* Gradient Orb Background */}
  <div className="absolute -top-20 -right-20 w-40 h-40 gradient-orb-blue group-hover:scale-110 transition-transform duration-500"></div>
  
  {/* Content */}
  <div className="relative z-10 h-full flex flex-col justify-between">
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <div className="inline-flex p-4 rounded-xl bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
        <Icon className="h-8 w-8 text-blue-400" />
      </div>
      <div className="flex flex-col space-y-3 sm:space-y-4">
        <h3 className="text-xl sm:text-2xl font-semibold text-white">Card Title</h3>
        <p className="text-white/70 leading-relaxed">Clean card content with professional-grade capabilities.</p>
      </div>
      <div className="flex flex-col space-y-3">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <span className="text-white/60 text-sm">Detail point one</span>
        </div>
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <span className="text-white/60 text-sm">Detail point two</span>
        </div>
      </div>
    </div>
    {/* Enhanced stats */}
    <div className="flex items-center gap-4 text-xs text-white/50">
      <div className="flex items-center space-x-1">
        <Users className="h-3 w-3 text-blue-400" />
        <span>50k+ users</span>
      </div>
      <div className="flex items-center space-x-1">
        <Star className="h-3 w-3 text-yellow-400" />
        <span>4.9 rating</span>
      </div>
      <div className="flex items-center space-x-1">
        <Clock className="h-3 w-3 text-emerald-400" />
        <span>2x faster</span>
      </div>
    </div>
    <a className="inline-flex items-center space-x-2 text-blue-400 font-medium hover:text-blue-300 transition-colors group/link self-start">
      <Play className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
      <span>Watch Demo</span>
    </a>
  </div>
</div>

// Stats Card (Minimal Example)
<div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col space-y-3 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
  <div className="text-2xl font-semibold text-white">5.2k</div>
  <div className="text-white/60 text-sm">Active Users</div>
  <div className="flex items-center text-emerald-400 text-xs">
    <TrendingUp className="w-3 h-3 mr-1" />
    +12% from last month
  </div>
</div>
```

### Navigation (Minimal)
```tsx
// Top Navigation
<nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-black/80 backdrop-blur-xl">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <div className="flex items-center space-x-8">
      <Logo />
      <div className="hidden md:flex items-center space-x-6">
        {navItems.map(item => (
          <a className="text-white/70 hover:text-white text-sm font-medium transition-colors">
            {item.name}
          </a>
        ))}
      </div>
    </div>
  </div>
</nav>

// Sidebar (Minimal)
<aside className="w-64 border-r border-white/[0.05] bg-white/[0.01] backdrop-blur-xl">
  <div className="p-6 space-y-2">
    {sidebarItems.map(item => (
      <a className="flex items-center px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.05] transition-all duration-200">
        <Icon className="w-5 h-5 mr-3" />
        {item.name}
      </a>
    ))}
  </div>
</aside>
```

## 📐 Spacing & Layout System

### Container System
```css
.container-narrow { max-width: 768px; margin: 0 auto; }
.container-base { max-width: 1200px; margin: 0 auto; }
.container-wide { max-width: 1400px; margin: 0 auto; }
```

### Spacing Scale (Minimal)
- **xs**: 4px (`space-1`)
- **sm**: 8px (`space-2`) 
- **base**: 16px (`space-4`)
- **lg**: 24px (`space-6`)
- **xl**: 32px (`space-8`)
- **2xl**: 48px (`space-12`)
- **3xl**: 64px (`space-16`)

### Section Layouts
```tsx
// Hero Section with Gradient Orbs (updated for new responsive padding)
<section className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 md:py-24">
  {/* Background Elements */}
  <div className="absolute inset-0 grid-pattern opacity-30"></div>
  <div className="absolute top-1/4 left-1/4 w-96 h-96 gradient-orb-blue"></div>
  <div className="absolute bottom-1/4 right-1/4 w-80 h-80 gradient-orb-neutral"></div>
  <div className="absolute top-3/4 left-1/3 w-64 h-64 gradient-orb-subtle-blue"></div>
  
  {/* Content */}
  <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="display-xl text-white mb-6">
      Build Better Products <br />
      <span className="text-blue-400">Faster</span>
    </h1>
    <p className="body-base text-white/70 mb-8 max-w-2xl mx-auto">
      Clean, minimal design system for modern applications
    </p>
    <div className="flex items-center justify-center gap-4">
      <Button variant="primary">Get Started</Button>
      <Button variant="ghost">View Demo</Button>
    </div>
  </div>
</section>

// Features Section (Bento Grid) - example reflecting new header structure
<section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto h-full flex flex-col">
    {/* Header */}
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16 lg:pb-20">
      <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm">
        <Zap className="h-4 w-4 text-blue-400" />
        <span className="text-white/70 text-sm font-medium">Professional Toolkit</span>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight text-center">
          Complete Professional Toolkit
        </h2>
        <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
          Everything you need to create, collaborate, and bring your ideas to life
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 text-sm">
        <div className="flex items-center space-x-2 text-white/60">
          <Users className="h-4 w-4 text-blue-400" />
          <span>150k+ users worldwide</span>
        </div>
        <div className="flex items-center space-x-2 text-white/60">
          <Star className="h-4 w-4 text-yellow-400" />
          <span>4.9/5 rating</span>
        </div>
        <div className="flex items-center space-x-2 text-white/60">
          <Award className="h-4 w-4 text-emerald-400" />
          <span>Enterprise ready</span>
        </div>
      </div>
    </div>
    
    {/* Bento Grid */}
    <div className="flex-1 pb-16 lg:pb-20">
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 sm:gap-6 auto-rows-[240px]">
        {/* FeatureCard components */}
        <FeatureCard className="bento-large" />
        <FeatureCard className="bento-medium" />
        <FeatureCard className="bento-small" />
        <FeatureCard className="bento-medium" />
        <FeatureCard className="bento-small" />
      </div>
    </div>
  </div>
</section>
```

## 🎪 Framer Motion Animations (Minimal)

### Page Transitions
```javascript
export const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};
```

### Component Animations
```javascript
// Minimal Hover Effects
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" }
};

export const cardHoverVariants = {
  hover: {
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

// Stagger Children
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

// Gradient Orb Animation
export const orbAnimation = {
  scale: [1, 1.1, 1],
  opacity: [0.4, 0.6, 0.4],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut"
  }
};
```

## 🎨 Background Patterns & Effects

### Animated Background Orbs
```tsx
// Background Component
const BackgroundOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <motion.div 
      className="absolute top-1/4 left-1/4 w-96 h-96 gradient-orb-blue"
      animate={orbAnimation}
    />
    <motion.div 
      className="absolute bottom-1/4 right-1/4 w-80 h-80 gradient-orb-neutral"
      animate={{...orbAnimation, transition: {...orbAnimation.transition, delay: 2}}}
    />
    <motion.div 
      className="absolute top-3/4 left-1/3 w-64 h-64 gradient-orb-subtle-blue"
      animate={{...orbAnimation, transition: {...orbAnimation.transition, delay: 4}}}
    />
  </div>
);
```

### Grid Overlay Component
```tsx
const GridOverlay = () => (
  <div className="absolute inset-0 opacity-30">
    <div className="grid-pattern w-full h-full"></div>
  </div>
);
```

## 📱 Responsive Design (Mobile-First)

### Breakpoints
```css
/* Mobile First Approach */
.responsive-grid {
  @apply grid grid-cols-1 gap-4;
  @apply md:grid-cols-2 md:gap-6;
  @apply lg:grid-cols-3 lg:gap-8;
  @apply xl:grid-cols-4;
}

/* Bento Grid Responsive (updated to current Features implementation) */
/* Large Feature Card */
.bento-large {
  @apply col-span-1 md:col-span-3 lg:col-span-5 row-span-2;
}

/* Medium Card */
.bento-medium {
  @apply col-span-1 md:col-span-3 lg:col-span-4 row-span-1;
}

/* Small Card */
.bento-small {
  @apply col-span-1 md:col-span-3 lg:col-span-3 row-span-1;
}
```

### Mobile Optimizations
- Reduce gradient orb sizes by 50% on mobile
- Simplify animations for better performance
- Stack bento grid items vertically
- Increase touch targets to 44px minimum

## 🔧 Implementation Guidelines

### CSS Custom Properties
```css
:root {
  --gradient-orb-blue: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 70%);
  --gradient-orb-neutral: radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, transparent 70%);
  --gradient-orb-subtle-blue: radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
  --glass-minimal: rgba(255, 255, 255, 0.03);
  --border-minimal: rgba(255, 255, 255, 0.08);
}
```

### Tailwind Extensions
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'orb-float': 'orb-float 8s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', // For badge icon
      },
      keyframes: {
        'orb-float': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(5deg)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 }
        }
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '8px' // New small blur for cards
      }
    }
  }
}
```

## 🎯 Design Principles

### Minimal Philosophy
1. **Less is More**: Remove unnecessary elements
2. **Purposeful Space**: Every pixel has intention
3. **Subtle Interactions**: Gentle, not jarring
4. **Content First**: Design serves content
5. **Performance**: Fast, smooth, responsive

### Visual Hierarchy
1. **Typography Scale**: Clear size relationships
2. **Color Contrast**: Accessible, readable
3. **Spacing Rhythm**: Consistent, harmonious
4. **Animation Purpose**: Meaningful, not decorative

This enhanced design system provides a comprehensive foundation for building a clean, minimal, yet modern Whizboard interface with sophisticated visual effects while maintaining excellent usability and performance.

## 🚫 Design Restrictions - Avoiding AI-Generated Aesthetics

### Strictly Avoid These Elements
- **Purple/Violet/Pink Gradients**: No purple (`#7C3AED`), violet, magenta, or pink color combinations
- **Sparkle Effects**: No sparkle animations, glitter, or twinkling elements
- **Neon Glows**: Avoid bright neon colors or excessive glow effects
- **Rainbow Gradients**: No multi-color rainbow or spectrum gradients
- **Holographic Effects**: No iridescent or holographic-style gradients
- **Overly Saturated Colors**: Keep colors professional and muted

### Premium Design Principles
1. **Monochromatic Focus**: Stick to blue tones with neutral accents
2. **Subtle Sophistication**: Use understated effects that enhance usability
3. **Professional Palette**: Maintain corporate-grade color schemes
4. **Minimal Ornamentation**: Avoid decorative elements that don't serve function
5. **Clean Typography**: No fancy fonts or excessive text effects
6. **Purposeful Animation**: Every animation should have clear UX purpose

### Recommended Alternatives
- Instead of purple gradients → Use neutral gray or additional blue tones
- Instead of sparkles → Use subtle fade-in animations
- Instead of neon glows → Use soft shadows and borders
- Instead of rainbow effects → Use monochromatic blue variations
- Instead of holographic → Use glass morphism with subtle transparency

This ensures Whizboard maintains a premium, professional appearance that stands apart from typical AI-generated interfaces.