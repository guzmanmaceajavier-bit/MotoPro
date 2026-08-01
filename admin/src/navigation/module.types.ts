import type { ComponentType } from 'react';

export interface AdminModule {
  id: string;
  label: string;
  path: string;
  icon?: ComponentType;
  children?: AdminModule[];
}
