import React from "react";
import { ChevronRight, Funnel } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PRICE_RANGES } from "@/constant/productFilters";

// --------------------------------------------------------------- Components ----------------------------------------------------

// Reusable Filter Item Component
const FilterItem = ({ checked, onToggle, label, count, colorSwatch }) => (
  <Label className="p-2 hover:bg-muted-foreground/10 rounded-md cursor-pointer flex items-center justify-between group transition-colors">
    <div className="flex items-center space-x-2 flex-1 min-w-0">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      {colorSwatch && (
        <div
          className="w-4 h-4 rounded border border-border shrink-0"
          style={{ backgroundColor: colorSwatch || "#ccc" }}
        />
      )}
      <span className="text-sm truncate">{label}</span>
    </div>
    {count !== undefined && (
      <span className="text-xs text-muted-foreground shrink-0">
        ({count || 0})
      </span>
    )}
  </Label>
);

// Reusable Filter Item with Sub-items Component
const FilterItemWithSubItems = ({
  checked,
  onToggle,
  label,
  count,
  hasSubItems,
  isExpanded,
  onExpand,
  subItems,
  checkedSubItems,
  onSubItemToggle,
}) => {
  return (
    <div className="space-y-2">
      <div className="p-2 hover:bg-muted-foreground/10 rounded-md flex items-center justify-between group transition-colors">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Checkbox checked={checked} onCheckedChange={onToggle} />
          <span
            className={`text-sm truncate flex-1 cursor-pointer`}
            onClick={
              hasSubItems
                ? (e) => {
                    e.stopPropagation();
                    onExpand();
                  }
                : undefined
            }
          >
            {label}
          </span>
        </div>

        {hasSubItems ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-5 text-accent-foreground shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          >
            <ChevronRight
              className={`size-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0">
            ({count || 0})
          </span>
        )}
      </div>
      {hasSubItems && isExpanded && (
        <div className="ml-5 space-y-2">
          {subItems.map((subItem) => (
            <FilterItem
              key={subItem._id}
              checked={checkedSubItems.includes(subItem._id)}
              onToggle={() => onSubItemToggle(subItem._id)}
              label={subItem.name}
              count={subItem.count}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Reusable Filter Section Component
const FilterSection = ({ value, title, children }) => (
  <AccordionItem value={value} className="border border-border rounded-md">
    <AccordionTrigger className="p-3 text-base font-semibold">
      {title}
    </AccordionTrigger>
    <AccordionContent className="max-h-[70vh] overflow-y-auto pr-2 py-2">
      <div className="space-y-3">{children}</div>
    </AccordionContent>
  </AccordionItem>
);

// --------------------------------------------------------------- Main Component ----------------------------------------------------

const ProductFilters = ({
  priceRange,
  categoryIds,
  subCategoryIds,
  collectionIds,
  subCollectionIds,
  colorIds,
  skillLevelIds,
  categories,
  collections,
  colors,
  skillLevels,
  expandedCategories,
  expandedCollections,
  hasActiveFilters,
  onPriceRangeChange,
  onCategoryToggle,
  onSubCategoryToggle,
  onCollectionToggle,
  onSubCollectionToggle,
  onColorToggle,
  onSkillLevelToggle,
  onCategoryExpansion,
  onCollectionExpansion,
  onClearFilters,
}) => {
  return (
    <div className="w-full space-y-5 pb-10">
      {/* Filters Header with Clear Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Funnel className="size-5" />
          <h2 className="text-lg font-bold">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button variant="link" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>
      <Accordion
        type="multiple"
        defaultValue={["price-range", "categories"]}
        className="w-full space-y-3"
      >
        {/* 1. Price Range */}
        <FilterSection value="price-range" title="Price Range">
          {PRICE_RANGES.map(({ value, label }) => (
            <FilterItem
              key={value}
              checked={priceRange === value}
              onToggle={() => onPriceRangeChange(value)}
              label={label}
            />
          ))}
        </FilterSection>

        {/* 2. Categories */}
        <FilterSection value="categories" title="Categories">
          {categories.map((item) => (
            <FilterItemWithSubItems
              key={item._id}
              label={item.categoryName}
              count={item.count}
              checked={categoryIds.includes(item._id)}
              onToggle={() => onCategoryToggle(item._id)}
              hasSubItems={item.subCategories?.length > 0}
              isExpanded={expandedCategories.has(item._id)}
              onExpand={() => onCategoryExpansion(item._id)}
              subItems={
                item.subCategories?.map((sub) => ({
                  _id: sub._id,
                  name: sub.subCategoryName,
                  count: sub.count,
                })) || []
              }
              checkedSubItems={subCategoryIds}
              onSubItemToggle={onSubCategoryToggle}
            />
          ))}
        </FilterSection>

        {/* 3. Collections */}
        <FilterSection value="collections" title="Collections">
          {collections.map((item) => (
            <FilterItemWithSubItems
              key={item._id}
              label={item.collectionName}
              count={item.count}
              checked={collectionIds.includes(item._id)}
              onToggle={() => onCollectionToggle(item._id)}
              hasSubItems={item.subCollections?.length > 0}
              isExpanded={expandedCollections.has(item._id)}
              onExpand={() => onCollectionExpansion(item._id)}
              subItems={
                item.subCollections?.map((sub) => ({
                  _id: sub._id,
                  name: sub.subCollectionName,
                  count: sub.count,
                })) || []
              }
              checkedSubItems={subCollectionIds}
              onSubItemToggle={onSubCollectionToggle}
            />
          ))}
        </FilterSection>

        {/* 4. Colors */}
        <FilterSection value="colors" title="Colors">
          {colors.map((item) => (
            <FilterItem
              key={item._id}
              label={item.colorName}
              count={item.count}
              colorSwatch={item.hexCode}
              checked={colorIds.includes(item._id)}
              onToggle={() => onColorToggle(item._id)}
            />
          ))}
        </FilterSection>

        {/* 5. Skill Level */}
        <FilterSection value="skill-levels" title="Skill Level">
          {skillLevels.map((item) => (
            <FilterItem
              key={item._id}
              label={item.skillLevelName}
              count={item.count}
              checked={skillLevelIds.includes(item._id)}
              onToggle={() => onSkillLevelToggle(item._id)}
            />
          ))}
        </FilterSection>
      </Accordion>
    </div>
  );
};

export default ProductFilters;
