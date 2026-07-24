import { tokens } from './tokens';

export const spacing = tokens.space;

export type SpacingKey = keyof typeof spacing;

export function getSpacing(key: SpacingKey): string {
  return spacing[key];
}

export function pxToRem(px: number): string {
  return `${px / 16}rem`;
}

export function multiplySpacing(key: SpacingKey, factor: number): string {
  const px = parseInt(spacing[key]);
  return `${px * factor}px`;
}