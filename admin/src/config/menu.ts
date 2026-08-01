import { LayoutDashboard, Package, FolderTree, Store, Users, Image, Settings, Wallet } from "lucide-react";

interface NavItem {
  label: string;
  to?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: NavItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export const ADMIN_MENU: NavSection[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Caja", to: "/caja", icon: Wallet },
      { label: "Pedidos Tienda", to: "/pedidos-tienda", icon: Store },
      { label: "Clientes", to: "/clientes", icon: Users },
    ],
  },
  {
    label: "Inventario",
    items: [
      { label: "Productos", to: "/products", icon: Package },
      { label: "Categorías", to: "/categories", icon: FolderTree },
    ],
  },
  {
    label: "Contenido",
    items: [
      { label: "Multimedia", to: "/multimedia", icon: Image },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "General", to: "/settings", icon: Settings },
    ],
  },
];
