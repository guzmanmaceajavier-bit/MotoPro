import { tokens } from './tokens';

export const duration = tokens.duration;
export const ease = tokens.ease;

export type DurationKey = keyof typeof duration;
export type EaseKey = keyof typeof ease;

export function getDuration(key: DurationKey): string {
  return duration[key];
}

export function getEasing(key: EaseKey): string {
  const e = ease[key];
  if (!e) return 'linear';
  return `cubic-bezier(${e.join(', ')})`;
}

export const motion = {
  duration: {
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
  },
  ease: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
  },
} as const;