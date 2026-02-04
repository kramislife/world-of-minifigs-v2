import {
  LayoutDashboard,
  Package,
  Palette,
  ChartColumnStacked,
  FolderKanban,
  Gem,
  Gauge,
  PenTool,
  ShoppingCart,
  Users,
  Handshake,
  Image,
} from "lucide-react";

export const adminNavigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "banners",
    label: "Banners",
    path: "banners",
    icon: Image,
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
    id: "dealer-management",
    label: "Dealer",
    icon: Handshake,
    children: [
      {
        id: "dealer-bundles",
        label: "Bundles",
        path: "dealer-bundles",
      },
      {
        id: "dealer-addons",
        label: "Add-ons",
        path: "dealer-addons",
      },
      {
        id: "dealer-extra-bags",
        label: "Extra Bags",
        path: "dealer-extra-bags",
      },
      {
        id: "dealer-torso-bags",
        label: "Torso Bags",
        path: "dealer-torso-bags",
      },
    ],
  },
  {
    id: "reward-program",
    label: "Reward Program",
    icon: Gem,
    children: [
      {
        id: "reward-bundles",
        label: "Reward Bundles",
        path: "reward-bundles",
      },
      {
        id: "reward-subscriptions",
        label: "Subscriptions",
        path: "reward-subscriptions",
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
