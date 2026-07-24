import { tokens } from './tokens';

export const density = tokens.density;

export type DensityMode = keyof typeof density;

export function getDensityValues(mode: DensityMode) {
  return density[mode];
}

export const densityConfig = {
  comfort: {
    cardPadding: 'var(--space-6)',
    gridGap: 'var(--space-6)',
    inputHeight: '44px',
    rowHeight: '56px',
    sectionPadding: 'py-12 sm:py-16 lg:py-20',
  },
  balanced: {
    cardPadding: 'var(--space-5)',
    gridGap: 'var(--space-5)',
    inputHeight: '40px',
    rowHeight: '48px',
    sectionPadding: 'py-8 sm:py-12 lg:py-16',
  },
  compact: {
    cardPadding: 'var(--space-4)',
    gridGap: 'var(--space-4)',
    inputHeight: '36px',
    rowHeight: '40px',
    sectionPadding: 'py-6 sm:py-8 lg:py-12',
  },
} as const;