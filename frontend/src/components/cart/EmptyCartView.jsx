import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmptyCartView = ({ onContinue }) => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <h1 className="text-5xl font-extrabold uppercase max-w-md pb-10">
      Your cart looks lonely
    </h1>
    <Button
      variant="bannerOutline"
      className="text-black border-black hover:bg-black hover:text-white duration-300"
      onClick={onContinue}
      asChild
    >
      <Link to="/products">Start Shopping</Link>
    </Button>
  </div>
);

export default EmptyCartView;
