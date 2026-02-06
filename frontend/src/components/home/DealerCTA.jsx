import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import dealerVideo from "@/assets/media/dealer.mp4";
import { dealerCta } from "@/constant/dealerData";
import Auth from "@/pages/Auth";

const DealerCTA = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <section className="relative w-full h-full aspect-4/5 md:aspect-16/5 overflow-hidden flex items-center justify-center ">
      <Auth open={authOpen} onOpenChange={setAuthOpen} defaultTab="register" />

      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={dealerVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative text-center max-w-4xl mx-auto flex flex-col items-center text-background dark:text-foreground">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-5">
          {dealerCta.title} <br />
          <span className="text-accent">{dealerCta.highlight}</span>
        </h2>
        <p className="mb-10 text-sm sm:text-lg max-w-2xl mx-auto">
          {dealerCta.description}
        </p>
        <Button
          variant="bannerOutline"
          className="h-14 text-md"
          onClick={() => setAuthOpen(true)}
        >
          {dealerCta.buttonText}
        </Button>
      </div>
    </section>
  );
};

export default DealerCTA;
