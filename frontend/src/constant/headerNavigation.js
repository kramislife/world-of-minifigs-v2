import {
  Home,
  ShoppingBag,
  Phone,
  Info,
  LayoutDashboard,
  ShoppingCart,
  UserRound,
  Settings,
  PenTool,
  Handshake,
} from "lucide-react";

export const headerNavigation = [
  {
    id: "home",
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    id: "products",
    label: "Products",
    path: "/products",
    icon: ShoppingBag,
  },
  {
    id: "contact",
    label: "Contact Us",
    path: "/contact-us",
    icon: Phone,
  },
  {
    id: "about",
    label: "About",
    path: "/about",
    icon: Info,
  },
  // {
  //   id: "designer",
  //   label: "Designer",
  //   path: "/designer",
  //   icon: PenTool,
  // },
  {
    id: "dealers",
    label: "Dealers",
    path: "/dealers",
    icon: Handshake,
  },
];

export const userMenu = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "purchase",
    label: "My Purchases",
    path: "/purchase",
    icon: ShoppingCart,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    icon: UserRound,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];
