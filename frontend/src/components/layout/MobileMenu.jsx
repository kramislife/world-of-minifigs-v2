import React from "react";
import { NavLink } from "react-router-dom";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";
import { headerNavigation } from "@/constant/headerNavigation";

const MobileMenu = () => {
  return (
    <SheetContent>
      <SheetHeader className="p-4 pb-2">
        <SheetTitle className="text-lg">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          This is the mobile menu on a mobile device.
        </SheetDescription>
      </SheetHeader>
      <nav className="flex flex-col gap-5 text-lg p-5">
        {headerNavigation.map((item) => (
          <SheetClose asChild key={item.id}>
            <NavLink to={item.path} className="flex items-center gap-3">
              {<item.icon size={20} />}
              {item.label}
            </NavLink>
          </SheetClose>
        ))}
      </nav>
    </SheetContent>
  );
};

export default MobileMenu;
