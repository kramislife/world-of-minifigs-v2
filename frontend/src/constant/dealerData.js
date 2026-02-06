import {
  Boxes,
  Sparkles,
  Star,
  Zap,
  MousePointerClick,
  Handbag,
  Shirt,
  Truck,
  CircleUser,
  Crown,
  Footprints,
  Origami,
  TrendingUp,
} from "lucide-react";

export const dealerHero = {
  badge: "100% Genuine LEGO Parts",
  title: "Build a Minifig",
  highlight: "Parts",
  description: "Get 100% Genuine LEGO Parts. Minimum Dupes, Maximum Variety!",
};

export const dealerFeatures = [
  {
    icon: Boxes,
    label: "Bulk Pricing",
  },
  {
    icon: Sparkles,
    label: "Low Duplicates",
  },
  {
    icon: Star,
    label: "Premium Torsos",
  },
  {
    icon: Zap,
    label: "Fast Shipping",
  },
];

export const dealerProcess = {
  badge: "EASY PROCESS",
  title: "How it Works",
  steps: [
    {
      title: "Select Your Bag Quantity",
      description:
        " Choose up to 300+ top-quality, 100% genuine LEGO minifigures",
      icon: MousePointerClick,
    },
    {
      title: "Secure Your Bag Add-Ons",
      description:
        "Add a specific number of extra minifig part bags and select premium parts",
      icon: Handbag,
    },
    {
      title: "Choose Your LEGO Torso",
      description:
        "Pick your favorite LEGO minifigure torsos and mix & match designs to build your perfect set",
      icon: Shirt,
    },
    {
      title: "Payment and Delivery",
      description:
        "Pay securely, ship fast — your bulk minifig parts are packed and on the way in no time",
      icon: Truck,
    },
  ],
};

export const dealerIncluded = {
  badge: "PARTS BREAKDOWN",
  title: "What's Included",
  highlight: "Per Minifig",
  description: "Each minifig in your order includes these 4 essential parts",
  footer:
    "Only LEGO torsos are selectable at the moment. All other parts are included as a standard mix",
  items: [
    {
      title: "1 Torso",
      description: "You choose!",
      icon: Shirt,
    },
    {
      title: "1 Head",
      description: "Standard mix",
      icon: CircleUser,
    },
    {
      title: "1 Hair / Headgear",
      description: "Standard mix",
      icon: Crown,
    },
    {
      title: "1 Pair of Legs",
      description: "Standard mix",
      icon: Footprints,
    },
  ],
};

export const dealerBenefits = {
  badge: "DEALER EXCLUSIVE",
  title: "Why Partner",
  highlight: "With Us",
  description:
    "We provide the highest quality LEGO parts and the most reliable service in the industry",
  features: [
    {
      title: "Premium Quality",
      description:
        "Every single part is hand-sorted and 100% genuine LEGO. No fakes, no knock-offs",
      icon: Star,
    },
    {
      title: "Market Ready",
      description:
        "Our parts are cleaned and ready to be put on your shelves immediately",
      icon: TrendingUp,
    },
    {
      title: "Design Variety",
      description:
        "Access thousands of unique torso designs and rare part combinations",
      icon: Origami,
    },
  ],
};

export const dealerCta = {
  title: "Ready to stock your",
  highlight: "Shelves?",
  description:
    "Join our network of successful dealers today and get access to the best LEGO parts at the best prices",
  buttonText: "Register as Dealer",
};
