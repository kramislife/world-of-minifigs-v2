import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/media/Logo.png";

//------------------------------------------------ Base Component ------------------------------------------

const ResultItemBase = ({ onClick, children }) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className="flex gap-3 w-full h-auto p-3 text-left justify-start group hover:bg-muted-foreground/5 text-foreground"
  >
    {children}
    <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary" />
  </Button>
);

//------------------------------------------------ Product Result ------------------------------------------

export const ProductResultItem = ({ item, onSelect }) => (
  <ResultItemBase onClick={() => onSelect("products", item)}>
    <div className="relative w-20 h-20 overflow-hidden shrink-0">
      {item.displayImage ? (
        <img
          src={item.displayImage}
          alt={item.productName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-3 border">
          <img
            src={Logo}
            alt="No image"
            className="w-full h-full object-contain opacity-50"
          />
        </div>
      )}
    </div>

    <div className="flex-1 flex flex-col">
      <h4 className="font-bold text-lg leading-tight line-clamp-1 min-w-0">
        {item.productName}
      </h4>

      <div className="mt-1 space-y-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-bold text-success dark:text-accent">
            ${item.displayPrice}
          </span>
          {item.hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${item.originalPrice}
            </span>
          )}
        </div>

        {item.colorDisplay && (
          <p className="text-sm text-muted-foreground">{item.colorDisplay}</p>
        )}
      </div>
    </div>
  </ResultItemBase>
);

//------------------------------------------------ Filter Result ------------------------------------------

export const FilterResultItem = ({ item, categoryKey, onSelect }) => (
  <ResultItemBase onClick={() => onSelect(categoryKey, item)}>
    {item.showImage && (
      <div className="relative w-16 h-16 overflow-hidden shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 border">
            <Search className="size-8 text-muted-foreground/20" />
          </div>
        )}
      </div>
    )}

    <div className="flex-1 flex flex-col justify-center pl-3">
      <h4 className="font-semibold text-lg leading-tight line-clamp-1 min-w-0">
        {item.displayName}
      </h4>
    </div>
  </ResultItemBase>
);
