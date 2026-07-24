/** @type {import('tailwindcss').Config} */
import preset from '../shared/theme/tailwind.preset.ts';

export default {
  presets: [preset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
};
