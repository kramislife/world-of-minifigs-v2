import React, { useState } from "react";
import { Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import ErrorState from "@/components/shared/ErrorState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ProductFilters from "@/components/products/ProductFilters";
import ProductSort from "@/components/products/ProductSort";
import ProductGrid from "@/components/products/ProductGrid";
import { useProducts } from "@/hooks/useProducts";

const Products = () => {
  const {
    products,
    categories,
    collections,
    colors,
    skillLevels,
    sortBy,
    priceRange,
    categoryIds,
    subCategoryIds,
    collectionIds,
    subCollectionIds,
    colorIds,
    skillLevelIds,
    expandedCategories,
    expandedCollections,
    startItem,
    totalItems,
    totalPages,
    page,
    hasActiveFilters,
    pageNumbers,
    hasProducts,
    showPagination,
    isFirstPage,
    isLastPage,
    isLoading,
    isError,
    handlePriceRangeChange,
    handleCategoryToggle,
    handleSubCategoryToggle,
    handleCollectionToggle,
    handleSubCollectionToggle,
    handleColorToggle,
    handleSkillLevelToggle,
    handleCategoryExpansion,
    handleCollectionExpansion,
    handleSortChange,
    handlePreviousPage,
    handleNextPage,
    handlePageNumberClick,
    handleClearFilters,
  } = useProducts();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner minHeight="min-h-screen" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load products"
        description="We're experiencing issues loading products. Please refresh the page or try again laters."
        minHeight="min-h-screen"
      />
    );
  }

  // Filter sidebar content (used in both desktop and mobile)
  const filterContent = (
    <ProductFilters
      priceRange={priceRange}
      categoryIds={categoryIds}
      subCategoryIds={subCategoryIds}
      collectionIds={collectionIds}
      subCollectionIds={subCollectionIds}
      colorIds={colorIds}
      skillLevelIds={skillLevelIds}
      categories={categories}
      collections={collections}
      colors={colors}
      skillLevels={skillLevels}
      expandedCategories={expandedCategories}
      expandedCollections={expandedCollections}
      hasActiveFilters={hasActiveFilters}
      onPriceRangeChange={handlePriceRangeChange}
      onCategoryToggle={handleCategoryToggle}
      onSubCategoryToggle={handleSubCategoryToggle}
      onCollectionToggle={handleCollectionToggle}
      onSubCollectionToggle={handleSubCollectionToggle}
      onColorToggle={handleColorToggle}
      onSkillLevelToggle={handleSkillLevelToggle}
      onCategoryExpansion={handleCategoryExpansion}
      onCollectionExpansion={handleCollectionExpansion}
      onClearFilters={handleClearFilters}
    />
  );

  return (
    <div className="p-5">
      {/* Mobile Filter Button & Sort - Side by Side */}
      <div className="mb-4 lg:hidden flex items-center gap-3">
        <Sheet
          open={mobileFiltersOpen}
          onOpenChange={setMobileFiltersOpen}
          closeOnDesktop
        >
          <SheetTrigger asChild>
            <Label className="flex-1 flex items-center text-lg gap-2 cursor-pointer hover:text-primary transition-colors">
              <Filter className="size-5" />
              Filters
            </Label>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[400px] overflow-y-auto px-3 py-5"
          >
            <div>{filterContent}</div>
            <SheetTitle className="sr-only">Mobile Filter Sidebar</SheetTitle>
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <ProductSort
            sortBy={sortBy}
            onSortChange={handleSortChange}
            id="sort-select-mobile"
            variant="mobile"
            className="w-full"
          />
        </div>
      </div>

      {/* Main Content: Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Sidebar - Filters (Desktop) */}
        <aside className="hidden lg:block lg:w-1/4 pr-5 border-r border-border">
          <div className="sticky top-24 pb-10">{filterContent}</div>
        </aside>

        {/* Right Content Area - Products (Desktop & Mobile) */}
        <main className="flex-1 lg:w-3/4">
          <ProductGrid
            products={products}
            sortBy={sortBy}
            startItem={startItem}
            totalItems={totalItems}
            page={page}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            hasProducts={hasProducts}
            showPagination={showPagination}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
            onSortChange={handleSortChange}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            onPageNumberClick={handlePageNumberClick}
            hideProductCountOnMobile={true}
            hideSortOnMobile={true}
          />
        </main>
      </div>
    </div>
  );
};

export default Products;
