/** @type {import('tailwindcss').Config} */
import preset from '../shared/theme/tailwind.preset.ts';

export default {
  presets: [preset],
  darkMode: ['class', '.light'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
};
