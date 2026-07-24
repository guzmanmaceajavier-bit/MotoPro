import { tokens } from './tokens';

export interface Theme {
  colors: typeof tokens.color;
  fonts: typeof tokens.font;
  text: typeof tokens.text;
  space: typeof tokens.space;
  radius: typeof tokens.radius;
  duration: typeof tokens.duration;
  ease: typeof tokens.ease;
  z: typeof tokens.z;
  elevation: typeof tokens.elevation;
  density: typeof tokens.density;
  semantic: typeof tokens.semantic;
}

export const theme: Theme = {
  colors: tokens.color,
  fonts: tokens.font,
  text: tokens.text,
  space: tokens.space,
  radius: tokens.radius,
  duration: tokens.duration,
  ease: tokens.ease,
  z: tokens.z,
  elevation: tokens.elevation,
  density: tokens.density,
  semantic: tokens.semantic,
};

export default theme;