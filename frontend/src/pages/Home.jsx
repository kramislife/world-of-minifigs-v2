import React from "react";
import Banner from "@/components/home/Banner";
import CollectionsCarousel from "@/components/home/CollectionsCarousel";
import LatestProduct from "@/components/home/LatestProduct";
import FeaturedCollections from "@/components/home/FeaturedCollections";

const Home = () => {
  return (
    <div>
      <Banner />
      <CollectionsCarousel />
      <LatestProduct />
      <FeaturedCollections />
    </div>
  );
};

export default Home;
