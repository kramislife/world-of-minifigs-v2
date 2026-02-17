import {
  ProductResultItem,
  FilterResultItem,
} from "@/components/search/ResultItem";

const SearchResults = ({ categorizedResults, handleSelect }) => (
  <div className="flex flex-col gap-5 max-h-[50vh] overflow-y-auto overscroll-contain pt-5 border-t border-dashed">
    {categorizedResults.map(({ key, label, items }) => (
      <div key={key}>
        <div className="flex items-center gap-2 mb-3 px-5">
          <span className="text-sm font-semibold text-muted-foreground tracking-tight uppercase">
            {items.length}{" "}
            {items.length === 1 ? label.replace(/s$/, "") : label} found
          </span>
        </div>
        <div className="flex flex-col">
          {items.map((item) =>
            key === "products" ? (
              <ProductResultItem
                key={item._id}
                item={item}
                onSelect={handleSelect}
              />
            ) : (
              <FilterResultItem
                key={item._id}
                item={item}
                categoryKey={key}
                onSelect={handleSelect}
              />
            ),
          )}
        </div>
      </div>
    ))}
  </div>
);

export default SearchResults;
