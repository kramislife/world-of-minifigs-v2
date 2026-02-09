import { Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DealerExtraBag = ({
  extraBags,
  totalExtraBags,
  maxExtraBags,
  selectedBundle,
  onIncrease,
  onDecrease,
}) => (
  <section id="step3" className="overflow-visible">
    <div className="flex flex-col mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Step 3 — Extra Part Bag Options
        </h2>
        {selectedBundle && (
          <Badge variant="outline" className="flex items-center">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold">{totalExtraBags}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-bold">
                {maxExtraBags} extra bags
              </span>
            </div>
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground text-sm">
        Add additional part bags to your order based on your selected bundle
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {extraBags.map((bag) => (
        <Card
          key={bag._id}
          className={`p-5 transition-all duration-300 group overflow-visible hover:shadow-2xl hover:-translate-y-2 flex flex-col gap-2 ${
            bag.qty > 0 ? "border-accent ring-2 ring-accent ring-offset-2" : ""
          }`}
        >
          <h3 className="text-xl font-bold text-left">
            {bag.subCollectionId?.subCollectionName || "Extra Bag"}
          </h3>

          <div className="w-full flex flex-col mt-3">
            <span className="text-5xl font-extrabold text-success dark:text-accent">
              ${bag.price}
            </span>
            <span className="text-xs text-muted-foreground mt-2">
              per extra bag
            </span>
          </div>

          <div className="flex items-center justify-between border rounded-md w-full mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-black hover:bg-transparent disabled:opacity-30"
              onClick={() => onDecrease(bag._id)}
              disabled={!bag.canDecrease}
            >
              <Minus className="size-4" />
            </Button>
            <span className="text-center text-sm font-bold flex-1">
              {bag.qty}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-black hover:bg-transparent disabled:opacity-30"
              onClick={() => onIncrease(bag._id)}
              disabled={!bag.canIncrease}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  </section>
);

export default DealerExtraBag;
