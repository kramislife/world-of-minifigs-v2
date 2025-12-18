import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Designer from "@/pages/Designer";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import VerifyEmail from "@/components/auth/VerifyEmail";
import ResetPassword from "@/components/auth/ResetPassword";
import NotFound from "@/components/layout/NotFound";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Purchase from "@/pages/Purchase";
import AdminPanel from "@/pages/admin/AdminPanel";
import Dashboard from "@/pages/admin/components/Dashboard";
import ProductManagement from "@/pages/admin/components/ProductManagement";
import ColorManagement from "@/pages/admin/components/ColorManagement";
import CategoryManagement from "@/pages/admin/components/categories/CategoryManagement";
import SubCategoryManagement from "@/pages/admin/components/categories/SubCategoryManagement";
import CollectionManagement from "@/pages/admin/components/collections/CollectionManagement";
import SubCollectionManagement from "@/pages/admin/components/collections/SubCollectionManagement";
import SkillLevelManagement from "@/pages/admin/components/SkillLevelManagement";
import DesignerManagement from "@/pages/admin/components/DesignerManagement";
import OrderManagement from "@/pages/admin/components/OrderManagement";
import UserManagement from "@/pages/admin/components/UserManagement";

// Public routes
export const publicRoutes = [
  {
    path: "/",
    element: Home,
  },
  {
    path: "/products",
    element: Products,
  },
  {
    path: "/contact-us",
    element: Contact,
  },
  {
    path: "/about",
    element: About,
  },
  {
    path: "/designer",
    element: Designer,
  },
  {
    path: "/privacy-policy",
    element: PrivacyPolicy,
  },
  {
    path: "/terms-of-use",
    element: TermsOfUse,
  },
  {
    path: "/verify-email",
    element: VerifyEmail,
  },
  {
    path: "/reset-password",
    element: ResetPassword,
  },
];

// Private routes (non-admin)
export const privateRoutes = [
  {
    path: "/purchase",
    element: Purchase,
  },
  {
    path: "/profile",
    element: Profile,
  },
  {
    path: "/settings",
    element: Settings,
  },
];

// Admin routes
export const adminRoutes = [
  {
    path: "/admin",
    element: AdminPanel,
    requiredRole: "admin",
    children: [
      {
        path: "dashboard",
        element: Dashboard,
      },
      {
        path: "products",
        element: ProductManagement,
      },
      {
        path: "product-color",
        element: ColorManagement,
      },
      {
        path: "categories",
        element: CategoryManagement,
      },
      {
        path: "sub-categories",
        element: SubCategoryManagement,
      },
      {
        path: "collections",
        element: CollectionManagement,
      },
      {
        path: "sub-collections",
        element: SubCollectionManagement,
      },
      {
        path: "skill-level",
        element: SkillLevelManagement,
      },
      {
        path: "designers",
        element: DesignerManagement,
      },
      {
        path: "orders",
        element: OrderManagement,
      },
      {
        path: "users",
        element: UserManagement,
      },
    ],
  },
];

// 404 route
export const notFoundRoute = {
  path: "*",
  element: NotFound,
};
