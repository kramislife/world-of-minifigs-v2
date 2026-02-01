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
import { PRICE_RANGES } from "@/constant/filterOptions";

// Reusable Filter Item Component
const FilterItem = ({ checked, onToggle, label, count, colorSwatch }) => (
  <Label className="p-2 hover:bg-muted-foreground/10 rounded-md cursor-pointer flex items-center justify-between">
    <div className="flex items-center space-x-2 flex-1">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      {colorSwatch && (
        <div
          className="w-4 h-4 rounded border shrink-0"
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
  const chevronClassName = isExpanded
    ? "size-4 transition-transform rotate-90 text-muted-foreground"
    : "size-4 transition-transform text-muted-foreground";

  return (
    <div className="space-y-2">
      <div className="p-2 hover:bg-muted-foreground/10 rounded-md flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Checkbox checked={checked} onCheckedChange={onToggle} />
          {hasSubItems ? (
            <span
              className="text-sm truncate flex-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
            >
              {label}
            </span>
          ) : (
            <span className="text-sm truncate flex-1">{label}</span>
          )}
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
            <ChevronRight className={chevronClassName} />
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
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button variant="link" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>
      <Accordion
        type="single"
        defaultValue="price-range"
        className="w-full space-y-2"
      >
        {/* Price Range Filter */}
        <FilterSection value="price-range" title="Price Range">
          {PRICE_RANGES.map(({ value, label }) => {
            const isChecked = priceRange === value;
            return (
              <FilterItem
                key={value}
                checked={isChecked}
                onToggle={() => onPriceRangeChange(isChecked ? null : value)}
                label={label}
              />
            );
          })}
        </FilterSection>

        {/* Categories Filter */}
        <FilterSection value="categories" title="Categories">
          {categories.map((category) => {
            const hasSubCategories =
              category.subCategories && category.subCategories.length > 0;
            const isExpanded = expandedCategories.has(category._id);
            const isChecked = categoryIds.includes(category._id);
            return (
              <FilterItemWithSubItems
                key={category._id}
                checked={isChecked}
                onToggle={() => onCategoryToggle(category._id)}
                label={category.categoryName}
                count={category.count}
                hasSubItems={hasSubCategories}
                isExpanded={isExpanded}
                onExpand={() => onCategoryExpansion(category._id)}
                subItems={
                  hasSubCategories
                    ? category.subCategories.map((sub) => ({
                        _id: sub._id,
                        name: sub.subCategoryName,
                        count: sub.count,
                      }))
                    : []
                }
                checkedSubItems={subCategoryIds}
                onSubItemToggle={onSubCategoryToggle}
              />
            );
          })}
        </FilterSection>

        {/* Collections Filter */}
        <FilterSection value="collections" title="Collections">
          {collections.map((collection) => {
            const hasSubCollections = collection.subCollections?.length > 0;
            const isExpanded = expandedCollections.has(collection._id);
            const isChecked = collectionIds.includes(collection._id);
            return (
              <FilterItemWithSubItems
                key={collection._id}
                checked={isChecked}
                onToggle={() => onCollectionToggle(collection._id)}
                label={collection.collectionName}
                count={collection.count}
                hasSubItems={hasSubCollections}
                isExpanded={isExpanded}
                onExpand={() => onCollectionExpansion(collection._id)}
                subItems={
                  hasSubCollections
                    ? collection.subCollections.map((sub) => ({
                        _id: sub._id,
                        name: sub.subCollectionName,
                        count: sub.count,
                      }))
                    : []
                }
                checkedSubItems={subCollectionIds}
                onSubItemToggle={onSubCollectionToggle}
              />
            );
          })}
        </FilterSection>

        {/* Colors Filter */}
        <FilterSection value="colors" title="Colors">
          {colors.map((color) => (
            <FilterItem
              key={color._id}
              checked={colorIds.includes(color._id)}
              onToggle={() => onColorToggle(color._id)}
              label={color.colorName}
              count={color.count}
              colorSwatch={color.hexCode}
            />
          ))}
        </FilterSection>

        {/* Skill Level Filter */}
        <FilterSection value="skill-levels" title="Skill Level">
          {skillLevels.map((skillLevel) => (
            <FilterItem
              key={skillLevel._id}
              checked={skillLevelIds.includes(skillLevel._id)}
              onToggle={() => onSkillLevelToggle(skillLevel._id)}
              label={skillLevel.skillLevelName}
              count={skillLevel.count}
            />
          ))}
        </FilterSection>
      </Accordion>
    </div>
  );
};
export default ProductFilters;
