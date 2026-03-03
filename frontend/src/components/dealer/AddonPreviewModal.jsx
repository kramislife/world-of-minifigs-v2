import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import CommonImage from "@/components/shared/CommonImage";
import QuantityControl from "@/components/shared/QuantityControl";
import { formatCurrency } from "@/utils/formatting";

const AddonPreviewModal = ({
  addon,
  items,
  totalBags,
  totalPrice,
  canSubmit,
  isUpdate,
  onClose,
  onConfirm,
  onDecrement,
  onIncrement,
  onValueChange,
}) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl overflow-hidden flex flex-col gap-0">
        <DialogHeader>
          <DialogTitle>{addon.addonName}</DialogTitle>
          <DialogDescription className="text-sm font-semibold text-success dark:text-accent">
            {totalBags} bag{totalBags === 1 ? "" : "s"} selected {" · "}
            {formatCurrency(totalPrice)} total
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((item) => (
              <div
                key={item.key}
                className={`rounded-md border p-2 transition-colors ${
                  item.isActive ? "border-accent border-l-4" : "border"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Item Image */}
                  <CommonImage
                    src={item.image?.url}
                    alt={item.itemName}
                    className="shrink-0 size-14"
                  />

                  <div className="flex flex-col min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        className="text-sm font-semibold line-clamp-1 leading-tight min-w-0"
                        title={item.itemName}
                      >
                        {item.itemName}
                      </h4>
                      <span className="font-bold text-sm text-success dark:text-accent whitespace-nowrap">
                        {item.selectedTotal > 0 &&
                          formatCurrency(item.selectedTotal)}
                      </span>
                    </div>

                    {/* Color + Per-bag pricing */}

                    <span className="text-xs text-muted-foreground">
                      {item.color?.colorName || "—"}
                      {" · "}
                      <span className="text-success dark:text-accent font-bold">
                        {formatCurrency(item.bagPrice)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Row 2: Quantity Control + Progress */}
                <div className="flex items-center gap-3 mt-2">
                  <QuantityControl
                    value={item.selectedBags}
                    onDecrement={() => onDecrement(item.inventoryItemId)}
                    onIncrement={() => onIncrement(item.inventoryItemId)}
                    onValueChange={(value) =>
                      onValueChange(item.inventoryItemId, value)
                    }
                    min={0}
                    max={item.maxBags}
                    allowInput
                    valueClassName="w-12 h-8"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        Bags
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {item.selectedBags}/{item.maxBags}
                      </span>
                    </div>
                    <Progress value={item.usedPercent} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" disabled={!canSubmit} onClick={onConfirm}>
            {isUpdate ? "Update Order" : "Add to Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddonPreviewModal;
