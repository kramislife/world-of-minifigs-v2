import React, { useState } from "react";
import dealerVideo from "@/assets/media/dealer.mp4";
import PageCTA from "@/components/shared/PageCTA";
import Auth from "@/pages/Auth";
import { dealerCta } from "@/constant/dealerData";

const DealerCTA = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Auth open={authOpen} onOpenChange={setAuthOpen} defaultTab="register" />
      <PageCTA
        title={dealerCta.title}
        highlight={dealerCta.highlight}
        description={dealerCta.description}
        buttonText={dealerCta.buttonText}
        buttonOnClick={() => setAuthOpen(true)}
        backgroundVideo={dealerVideo}
      />
    </>
  );
};

export default DealerCTA;
