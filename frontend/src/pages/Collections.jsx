import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/assets/media/Logo.png";
import PageHero from "@/components/shared/PageHero";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { useCollections, getCollectionLink } from "@/hooks/useCollections";

const Collections = () => {
  const { collections, isLoading, isError, hasCollections } = useCollections();

  if (isLoading) {
    return <LoadingSpinner minHeight="min-h-screen" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load collections"
        description="We're experiencing issues loading collections. Please refresh the page or try again later."
        minHeight="min-h-screen"
      />
    );
  }

  if (!hasCollections) {
    return (
      <ErrorState
        title="No collections available"
        description="There are no collections to display at this time. Please check back soon!"
        minHeight="min-h-screen"
      />
    );
  }

  return (
    <div>
      <PageHero
        title="Browse Our"
        highlight="Collections"
        description="Explore our curated collections of custom minifigures, accessories, and more."
      />

      {/* Collections Grid */}
      <section className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-7">
          {collections.map((collection) => (
            <Link
              key={collection._id}
              to={getCollectionLink(collection)}
              className="group"
            >
              {/* Image Container */}
              <div className="aspect-square overflow-hidden mb-2 flex items-center justify-center border">
                {collection.image?.url ? (
                  <img
                    src={collection.image.url}
                    alt={collection.collectionName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={Logo}
                    alt="Placeholder"
                    className="max-h-40 max-w-40 object-contain opacity-80"
                  />
                )}
              </div>

              {/* Collection Name */}
              <h3 className="text-3xl font-extrabold tracking-tight">
                {collection.collectionName}
                {collection.count > 0 && (
                  <sup className="text-sm font-bold text-muted-foreground ml-2">
                    {collection.count}
                  </sup>
                )}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Collections;
