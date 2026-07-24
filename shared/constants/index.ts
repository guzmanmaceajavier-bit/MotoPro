export const API_BASE = '/api';

export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'administrador',
  EDITOR: 'editor',
  VENDEDOR: 'vendedor',
  TECNICO: 'técnico',
  ATENCION_CLIENTE: 'atención_cliente',
} as const;

export const SERVICE_REQUEST_STATUS = [
  { value: 'solicitud', label: 'Solicitud', color: 'badge-blue' },
  { value: 'diagnóstico', label: 'Diagnóstico', color: 'badge-yellow' },
  { value: 'esperando_aprobación', label: 'Esperando aprobación', color: 'badge-amber' },
  { value: 'esperando_repuestos', label: 'Esperando repuestos', color: 'badge-yellow' },
  { value: 'en_reparación', label: 'En reparación', color: 'badge-blue' },
  { value: 'control_calidad', label: 'Control de calidad', color: 'badge-blue' },
  { value: 'listo', label: 'Listo', color: 'badge-green' },
  { value: 'entregado', label: 'Entregado', color: 'badge-green' },
] as const;

export const ENTITY_TYPES = [
  'product', 'category', 'brand', 'service', 'blog',
  'gallery', 'testimonial', 'team', 'hero', 'offer',
  'before_after', 'value', 'homepage', 'about',
] as const;
