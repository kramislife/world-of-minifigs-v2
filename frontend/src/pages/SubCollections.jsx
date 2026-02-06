import React from "react";
import { Link, Navigate } from "react-router-dom";
import Logo from "@/assets/media/Logo.png";
import { useSubCollections } from "@/hooks/useCollections";

const SubCollections = () => {
  const { collection, subCollections, isLoading, isError, hasSubCollections } =
    useSubCollections();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg">Loading sub-collections...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-destructive">
          Failed to load sub-collections
        </p>
      </div>
    );
  }

  // If collection not found, redirect to collections page
  if (!collection) {
    return <Navigate to="/collections" replace />;
  }

  // If no sub-collections, redirect to products filtered by this collection
  if (!hasSubCollections) {
    return (
      <Navigate to={`/products?collectionIds=${collection._id}`} replace />
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-40 border border-border/50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-64 h-64 md:w-96 md:h-96 rounded-full bg-accent" />
          <div className="absolute top-1/2 right-1/4 w-56 h-56 md:w-64 md:h-64 rounded-full bg-accent" />
          <div className="absolute -bottom-32 -right-32 w-52 h-52 md:w-64 md:h-64 rounded-full bg-accent" />
        </div>

        <div className="relative px-5 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            <span className="text-accent">{collection.collectionName}</span>
          </h1>
          {collection.description && (
            <div className="mx-auto max-w-xl">
              <p className="text-sm md:text-lg">{collection.description}</p>
            </div>
          )}
        </div>
      </section>

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
