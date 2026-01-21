import Home from "@/pages/Home.jsx";
import Products from "@/pages/Products.jsx";
import Contact from "@/pages/Contact.jsx";
import About from "@/pages/About.jsx";
import Designer from "@/pages/Designer.jsx";
import Dealers from "@/pages/Dealers.jsx";
import PrivacyPolicy from "@/pages/PrivacyPolicy.jsx";
import TermsOfUse from "@/pages/TermsOfUse.jsx";
import VerifyEmail from "@/components/auth/VerifyEmail.jsx";
import ResetPassword from "@/components/auth/ResetPassword.jsx";
import NotFound from "@/components/layout/NotFound.jsx";
import Profile from "@/pages/Profile.jsx";
import Settings from "@/pages/Settings.jsx";
import Purchase from "@/pages/Purchase.jsx";
import AdminPanel from "@/pages/AdminPanel.jsx";
import Dashboard from "@/pages/admin/Dashboard.jsx";
import ProductManagement from "@/pages/admin/ProductManagement.jsx";
import ColorManagement from "@/pages/admin/ColorManagement.jsx";
import CategoryManagement from "@/pages/admin/categories/CategoryManagement.jsx";
import SubCategoryManagement from "@/pages/admin/categories/SubCategoryManagement.jsx";
import CollectionManagement from "@/pages/admin/collections/CollectionManagement.jsx";
import SubCollectionManagement from "@/pages/admin/collections/SubCollectionManagement.jsx";
import SkillLevelManagement from "@/pages/admin/SkillLevelManagement.jsx";
import DesignerManagement from "@/pages/admin/DesignerManagement.jsx";
import OrderManagement from "@/pages/admin/OrderManagement.jsx";
import UserManagement from "@/pages/admin/UserManagement.jsx";
import DealerManagement from "@/pages/admin/DealerManagement.jsx";

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
  {
    path: "/dealers",
    element: Dealers,
    requiredRoles: ["dealer", "admin"],
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
      {
        path: "dealers",
        element: DealerManagement,
      },
    ],
  },
];

// 404 route
export const notFoundRoute = {
  path: "*",
  element: NotFound,
};
