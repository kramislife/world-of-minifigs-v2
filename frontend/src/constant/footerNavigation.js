import { Facebook, Instagram } from "lucide-react";

export const footerNavigation = [
  {
    id: 1,
    title: "Account",
    links: [
      { label: "My Account", action: "myAccount" },
      { label: "Login", path: "/login" },
      { label: "Register", path: "/register" },
      { label: "Cart", action: "cart" },
    ],
  },
  {
    id: 2,
    title: "Quick Links",
    links: [
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms Of Use", path: "/terms-of-use" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    id: 3,
    title: "Support",
    links: [
      { label: "Lehi, Utah 84043", action: "location" },
      { label: "brickextremeofficial@gmail.com", action: "email" },
    ],
  },
  {
    id: 4,
    title: "World of Minifigs",
    description:
      "Follow us on social media to stay updated on new releases, exclusive promotions, and our latest collections.",
    isSocial: true,
    links: [
      {
        id: "facebook",
        icon: Facebook,
        href: "https://www.facebook.com/profile.php?id=61552234252330",
        label: "Facebook",
      },
      {
        id: "instagram",
        icon: Instagram,
        href: "https://www.instagram.com/theworldofminifigs/",
        label: "Instagram",
      },
    ],
  },
];
