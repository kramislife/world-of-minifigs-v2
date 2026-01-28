import React from "react";
import { Link } from "react-router-dom";
import { useCollections } from "@/hooks/useCollections";

const Collections = () => {
  const { collections, isLoading, isError, hasCollections } = useCollections();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg">Loading collections...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-destructive">Failed to load collections</p>
      </div>
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
            Browse Our <span className="text-accent">Collections</span>
          </h1>
          <div className="mx-auto max-w-xl">
            <p className="text-sm md:text-lg">
              Explore our curated collections of custom minifigures,
              accessories, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="p-5">
        {!hasCollections ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <p className="text-lg text-muted-foreground">
              No collections found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-7">
            {collections.map((collection) => (
              <Link
                key={collection._id}
                to={`/products?collectionIds=${collection._id}`}
                className="group"
              >
                {/* Image Container */}
                <div className="aspect-square overflow-hidden mb-2">
                  <img
                    src={collection.image?.url}
                    alt={collection.collectionName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Collection Name */}
                <h3 className="text-2xl font-black tracking-tight">
                  {collection.collectionName}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Collections;
