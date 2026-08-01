import type { AdminModule } from './module.types';

export const sidebarModules: AdminModule[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
  { id: 'operations', label: 'Operaciones', path: '/admin/operations' },
  { id: 'crm', label: 'CRM', path: '/admin/crm' },
  { id: 'commercial', label: 'Comercial', path: '/admin/commercial' },
  { id: 'inventory', label: 'Inventario', path: '/admin/inventory' },
  { id: 'marketing', label: 'Marketing', path: '/admin/marketing' },
  { id: 'cms', label: 'CMS', path: '/admin/cms' },
  { id: 'reports', label: 'Reportes', path: '/admin/reports' },
  { id: 'settings', label: 'Configuración', path: '/admin/settings' },
];

export default sidebarModules;
