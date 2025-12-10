import {
  Home,
  ShoppingBag,
  Phone,
  Info,
  LayoutDashboard,
  ShoppingCart,
  UserRound,
  Settings,
  LogOut,
  Wrench,
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
    label: "Product",
    path: "/products",
    icon: ShoppingBag,
  },
  {
    id: "contact",
    label: "Contact",
    path: "/contact",
    icon: Phone,
  },
  {
    id: "about",
    label: "About",
    path: "/about",
    icon: Info,
  },
  {
    id: "builder",
    label: "Builder",
    path: "/builder",
    icon: Wrench  ,
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
    id: "orders",
    label: "Orders",
    path: "/orders",
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
  {
    id: "logout",
    label: "Log out",
    path: "/logout",
    icon: LogOut,
  },
];
