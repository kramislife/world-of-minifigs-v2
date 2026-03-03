import React from "react";
import { Link } from "react-router-dom";
import CommonImage from "@/components/shared/CommonImage";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import {
  useFeaturedCollections,
  getCollectionLink,
} from "@/hooks/useCollections";

const FeaturedCollections = () => {
  const { collections, isLoading, isError, hasCollections } =
    useFeaturedCollections();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorState
        title="No featured collections available"
        description="We're having trouble loading featured collections. Please refresh the page or try again later."
        minHeight="min-h-[200px]"
      />
    );
  }

  if (!hasCollections) {
    return (
      <ErrorState
        title="No featured collections available"
        description="There are no featured collections to display at this time. Please check back soon!"
        minHeight="min-h-[200px]"
      />
    );
  }

  return (
    <section>
      <div className="flex flex-col gap-5">
        {collections.slice(0, 2).map((collection) => (
          <Link
            key={collection._id}
            to={getCollectionLink(collection)}
            className="group block"
          >
            <div className="relative aspect-4/3 sm:aspect-16/5 border">
              {/* Banner Image */}
              <CommonImage
                src={collection.image?.url}
                alt={collection.collectionName}
                className="w-full h-full"
                imgClassName="transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end px-5 py-10">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase text-background dark:text-foreground">
                  {collection.collectionName}
                </h2>
                {collection.description && (
                  <p className="text-sm sm:text-lg text-background dark:text-foreground max-w-3xl">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;
