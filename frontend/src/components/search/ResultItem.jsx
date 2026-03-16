import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonImage from "@/components/shared/CommonImage";

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
    <CommonImage
      src={item.displayImage}
      alt={item.productName}
      className="size-16"
    />

    <div className="flex-1 flex flex-col">
      <h4 className="font-semibold leading-tight line-clamp-1 min-w-0">
        {item.productName}
      </h4>

      <div className="mt-1 space-y-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-bold text-success dark:text-accent">
            {item.displayPrice}
          </span>
          {item.hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${item.originalPrice}
            </span>
          )}
        </div>

        {item.colorDisplay && (
          <p className="text-xs text-muted-foreground">{item.colorDisplay}</p>
        )}
      </div>
    </div>
  </ResultItemBase>
);

//------------------------------------------------ Filter Result ------------------------------------------

export const FilterResultItem = ({ item, categoryKey, onSelect }) => (
  <ResultItemBase onClick={() => onSelect(categoryKey, item)}>
    {item.showImage && (
      <CommonImage
        src={item.image}
        alt={item.displayName}
        className="size-16"
      />
    )}

    <div className="flex-1 flex flex-col justify-center">
      <h4 className="font-semibold leading-tight line-clamp-1 min-w-0">
        {item.displayName}
      </h4>
    </div>
  </ResultItemBase>
);
