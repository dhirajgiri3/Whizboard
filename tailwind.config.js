// Enhanced tailwind.config.js
module.exports = {
    theme: {
      extend: {
        animation: {
          'orb-float': 'orb-float 8s ease-in-out infinite',
          'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.21, 1.11, 0.81, 0.99)',
          'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.21, 1.11, 0.81, 0.99)',
        },
        keyframes: {
          'orb-float': {
            '0%, 100%': { 
              transform: 'scale(1) rotate(0deg)',
              opacity: '0.6'
            },
            '50%': { 
              transform: 'scale(1.05) rotate(5deg)',
              opacity: '0.8'
            }
          },
          'fade-in-up': {
            '0%': { 
              opacity: '0',
              transform: 'translateY(24px)',
              filter: 'blur(4px)'
            },
            '100%': { 
              opacity: '1',
              transform: 'translateY(0)',
              filter: 'blur(0)'
            }
          },
          'pulse-glow': {
            '0%, 100%': { 
              opacity: '1',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)'
            },
            '50%': { 
              opacity: '0.8',
              boxShadow: '0 0 30px rgba(37, 99, 235, 0.5)'
            }
          }
        },
        backdropBlur: {
          'xs': '2px',
          'sm': '8px',
          'xl': '32px'
        },
        boxShadow: {
          'glow': '0 0 20px rgba(37, 99, 235, 0.3)',
          'glow-lg': '0 0 40px rgba(37, 99, 235, 0.4)',
          'premium': '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }
  