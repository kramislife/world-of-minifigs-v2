import {
  LayoutDashboard,
  Package,
  Palette,
  ChartColumnStacked,
  FolderKanban,
  Gauge,
  PenTool,
  ShoppingCart,
  Users,
  Handshake,
} from "lucide-react";

export const adminNavigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "products",
    label: "Products",
    path: "products",
    icon: Package,
  },
  {
    id: "product-color",
    label: "Product Color",
    path: "product-color",
    icon: Palette,
  },
  {
    id: "categories",
    label: "Categories",
    icon: ChartColumnStacked,
    children: [
      {
        id: "all-categories",
        label: "All Categories",
        path: "categories",
      },
      {
        id: "sub-categories",
        label: "Sub Categories",
        path: "sub-categories",
      },
    ],
  },
  {
    id: "collections",
    label: "Collections",
    icon: FolderKanban,
    children: [
      {
        id: "all-collections",
        label: "All Collections",
        path: "collections",
      },
      {
        id: "sub-collections",
        label: "Sub Collections",
        path: "sub-collections",
      },
    ],
  },
  {
    id: "skill-level",
    label: "Skill Level",
    path: "skill-level",
    icon: Gauge,
  },
  {
    id: "designers",
    label: "Designers",
    path: "designers",
    icon: PenTool,
  },
  {
    id: "dealers",
    label: "Dealers",
    path: "dealers",
    icon: Handshake,
  },
  {
    id: "orders",
    label: "Orders",
    path: "orders",
    icon: ShoppingCart,
  },
  {
    id: "users",
    label: "Users",
    path: "users",
    icon: Users,
  },
];
