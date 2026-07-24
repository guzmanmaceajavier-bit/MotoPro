import { tokens } from './tokens';

export const typography = tokens.text;

export type TextToken = keyof typeof typography;

export function getFontSize(token: TextToken): string {
  return typography[token].size;
}

export function getFontFamily(kind: 'heading' | 'body' | 'mono'): string {
  return tokens.font[kind];
}

export function buildHeadingClass(token: TextToken): string {
  const t = typography[token];
  return `${t.size} / ${t.lineHeight} ${t.weight}`;
}

export const fontFamily = tokens.font;

export const textScale = {
  display: 'font-heading text-display font-bold',
  h1: 'font-heading text-h1 font-bold',
  h2: 'font-heading text-h2 font-semibold',
  h3: 'font-heading text-h3 font-semibold',
  h4: 'font-heading text-h4 font-semibold',
  h5: 'font-heading text-h5 font-semibold',
  h6: 'font-heading text-h6 font-semibold',
  body: 'font-body text-body',
  'body-sm': 'font-body text-body-sm',
  caption: 'font-body text-caption font-medium',
  tiny: 'font-body text-tiny font-medium',
} as const;