import { Variants } from 'framer-motion';

export const headerAnimations = {
  header: {
    transparent: {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      backdropFilter: 'blur(0px)',
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
    },
    hidden: {
      y: '-100%',
      opacity: 0,
    },
    visible: {
      y: '0%',
      opacity: 1,
    },
  },
  logo: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  fadeInUp: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.4, 
      ease: [0.4, 0, 0.2, 1] 
    },
  },
  dropdown: {
    initial: { opacity: 0, scale: 0.98, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -8 },
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0, 0.2, 1] 
    },
  },
  mobileMenu: {
    initial: { opacity: 0, y: -16 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.04
      }
    },
    exit: {
      opacity: 0,
      y: -16,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
  },
  mobileMenuItem: {
    initial: { opacity: 0, x: -16 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { opacity: 0, x: -16 }
  },
} as const;

export const darkHeaderAnimations = {
  header: {
    transparent: {
      backgroundColor: 'rgba(10, 10, 11, 0)',
      backdropFilter: 'blur(0px)',
    },
    glass: {
      backgroundColor: 'rgba(10, 10, 11, 0.8)',
      backdropFilter: 'blur(20px)',
    },
    hidden: {
      y: '-100%',
      opacity: 0,
    },
    visible: {
      y: '0%',
      opacity: 1,
    },
  },
  logo: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  fadeInUp: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.4, 
      ease: [0.4, 0, 0.2, 1] 
    },
  },
  dropdown: {
    initial: { opacity: 0, scale: 0.98, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -8 },
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0, 0.2, 1] 
    },
  },
  mobileMenu: {
    initial: { opacity: 0, y: -16 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.04
      }
    },
    exit: {
      opacity: 0,
      y: -16,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
  },
  mobileMenuItem: {
    initial: { opacity: 0, x: -16 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { opacity: 0, x: -16 }
  },
} as const; 