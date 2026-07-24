import { tokens } from './tokens';

export const radius = tokens.radius;

export type RadiusKey = keyof typeof radius;

export function getRadius(key: RadiusKey): string {
  return radius[key];
}

export const borderRadius = {
  none: '0',
  sm: '6px',
  lg: '12px',
  full: '9999px',
} as const;