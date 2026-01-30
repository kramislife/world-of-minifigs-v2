import React from "react";
import CollectionsCarousel from "@/components/home/CollectionsCarousel";
import LatestProduct from "@/components/home/LatestProduct";
import FeaturedCollections from "@/components/home/FeaturedCollections";

const Home = () => {
  return (
    <div>
      <CollectionsCarousel />
      <LatestProduct />
      <FeaturedCollections />
    </div>
  );
};

export default Home;
