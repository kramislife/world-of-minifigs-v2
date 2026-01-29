import React from "react";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import CollectionsCarousel from "@/components/home/CollectionsCarousel";

const Home = () => {
  return (
    <div>
      <FeaturedCollections />
      <CollectionsCarousel />
    </div>
  );
};

export default Home;
