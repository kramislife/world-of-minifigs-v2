import { Facebook, Instagram } from "lucide-react";
import { APP_NAME, APP_EMAIL, APP_ADDRESS, APP_SOCIAL_LINKS } from "@/constant/appConfig";

export const footerNavigation = [
  {
    title: "Account",
    links: [
      { label: "My Account", path: "/my-account" },
      { label: "Cart", path: "/cart" },
      { label: "Contact Us", path: "/contact-us" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Products", path: "/products" },
      { label: "About", path: "/about" },
      { label: "Designer", path: "/designer" },
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms Of Use", path: "/terms-of-use" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: APP_ADDRESS},
      {
        label: APP_EMAIL,
        path: `mailto: ${APP_EMAIL}`,
      },
    ],
  },
  {
    title: APP_NAME,
    description:
      "Follow us on social media to stay updated on new releases, exclusive promotions, and our latest collections.",
    isSocial: true,
    links: [
      {
        icon: Facebook,
        path: APP_SOCIAL_LINKS.facebook,
        label: "Facebook",
      },
      {
        icon: Instagram,
        path: APP_SOCIAL_LINKS.instagram,
        label: "Instagram",
      },
    ],
  },
];
