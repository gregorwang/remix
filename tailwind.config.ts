import type { Config } from "tailwindcss";

// 流体间距函数
const fluid = (min: number, max: number) => 
  `clamp(${min}rem, calc(${min}rem + (${max} - ${min}) * ((100vw - 20rem) / (90 - 20))), ${max}rem)`;

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "source-han-serif-sc",
          "Noto Serif SC",
          "serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        serif: [
          "source-han-serif-sc",
          "Noto Serif SC",
          "Georgia",
          "serif",
        ],
      },
      colors: {
        primary: {
          50: '#faf9f5',   // 主背景
          100: '#f5f4ed',  // 次背景
          950: '#141413',  // 主文字
        },
        accent: {
          DEFAULT: '#d97757',  // 陶土橙（展示）
          hover: '#c96442',    // 陶土橙（交互）
        }
      },
      spacing: {
        'section-sm': fluid(4, 6),      // 64-96px
        'section-md': fluid(6, 8),       // 96-128px
        'section-lg': fluid(8, 12.5),   // 128-200px
        'section-xl': fluid(13, 15),    // 208-240px
      },
      borderRadius: {
        'xs': '0.25rem',    // 4px
        'DEFAULT': '0.75rem', // 12px - main作为默认值
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '300': '300ms',
        '600': '600ms',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'fade-in': 'fadeIn 600ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'bounce-slow': {
          '0%, 100%': { 
            transform: 'translateY(0)', 
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)' 
          },
          '50%': { 
            transform: 'translateY(-25%)', 
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)' 
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
