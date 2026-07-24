import { tokens } from './tokens';

export const elevation = tokens.elevation;

export type ElevationLevel = keyof typeof elevation;

export function getElevationShadow(level: ElevationLevel, mode: 'dark' | 'light' = 'dark'): string {
  const e = elevation[level];
  if (!e) return 'none';
  if (mode === 'light' && 'shadow-light' in e) {
    return (e as any)['shadow-light'] as string;
  }
  return e.shadow;
}

export const shadows = {
  elevation: {
    0: 'none',
    1: 'var(--elevation-1-shadow)',
    2: 'var(--elevation-2-shadow)',
    3: 'var(--elevation-3-shadow)',
    4: 'var(--elevation-4-shadow)',
    5: 'var(--elevation-5-shadow)',
  },
} as const;