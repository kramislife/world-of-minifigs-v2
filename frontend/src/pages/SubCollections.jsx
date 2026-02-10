import React from "react";
import { Link, Navigate } from "react-router-dom";
import Logo from "@/assets/media/Logo.png";
import PageHero from "@/components/shared/PageHero";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { useSubCollections } from "@/hooks/useCollections";

const SubCollections = () => {
  const { collection, subCollections, isLoading, isError, hasSubCollections } =
    useSubCollections();

  // If collection not found, redirect to collections page
  if (!collection) {
    return <Navigate to="/collections" replace />;
  }

  if (isLoading) {
    return <LoadingSpinner minHeight="min-h-screen" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load sub-collections"
        description="We're experiencing issues loading sub-collections. Please refresh the page or try again later."
        minHeight="min-h-screen"
      />
    );
  }

  if (!hasSubCollections) {
    return (
      <ErrorState
        title="No sub-collections available"
        description="There are no sub-collections to display at this time. Please check back soon!"
        minHeight="min-h-screen"
      />
    );
  }

  return (
    <div>
      <PageHero
        title={collection.collectionName}
        description={collection.description}
      />

      {/* Sub-Collections Grid */}
      <section className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-7">
          {subCollections.map((subCollection) => (
            <Link
              key={subCollection._id}
              to={`/products?subCollectionIds=${subCollection._id}`}
              className="group"
            >
              {/* Sub-Collection Image */}
              <div className="aspect-square overflow-hidden mb-2 flex items-center justify-center border">
                {subCollection.image?.url ? (
                  <img
                    src={subCollection.image.url}
                    alt={subCollection.subCollectionName}
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

              {/* Sub-Collection Name */}
              <h3 className="text-3xl font-extrabold tracking-tight">
                {subCollection.subCollectionName}
                {subCollection.count > 0 && (
                  <sup className="text-sm font-bold text-muted-foreground ml-2">
                    {subCollection.count}
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

export default SubCollections;
