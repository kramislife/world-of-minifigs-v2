import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/assets/media/Logo.png";
import {
  useFeaturedCollections,
  getCollectionLink,
} from "@/hooks/useCollections";

const FeaturedCollections = () => {
  const { collections, isLoading, isError, hasCollections } =
    useFeaturedCollections();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-lg">Loading featured collections...</p>
      </div>
    );
  }

  if (isError || !hasCollections) {
    return null;
  }

  return (
    <section className="p-5">
      <div className="flex flex-col gap-2">
        {collections.slice(0, 2).map((collection) => (
          <Link
            key={collection._id}
            to={getCollectionLink(collection)}
            className="group relative block overflow-hidden"
          >
            {/* Banner Image */}
            <div className="aspect-4/3 sm:aspect-16/5 flex items-center justify-center border">
              {collection.image?.url ? (
                <img
                  src={collection.image.url}
                  alt={collection.collectionName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <img
                  src={Logo}
                  alt="Placeholder"
                  className="max-h-40 max-w-40 object-contain opacity-80"
                />
              )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <h2 className="text-3xl sm:text-4xl font-bold text-background dark:text-foreground uppercase mb-2">
                {collection.collectionName}
              </h2>
              {collection.description && (
                <p className="text-xs sm:text-sm text-background dark:text-foreground max-w-xl">
                  {collection.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;
