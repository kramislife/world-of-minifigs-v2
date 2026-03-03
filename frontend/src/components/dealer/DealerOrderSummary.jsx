import { Card } from "@/components/ui/card";
import { CheckoutButton } from "@/components/shared/OrderActionButton";
import { formatCurrency } from "@/utils/formatting";

const DealerOrderSummary = ({
  selectedBundle,
  addons,
  extraBags,
  torsoBags,
  totalExtraBags,
  totalOrderPrice,
  canCheckout,
}) => (
  <aside className="lg:sticky lg:top-24 space-y-5">
    <Card className="border-2 border-accent overflow-hidden p-0">
      <div className="bg-accent p-4 text-accent-foreground">
        <h3 className="text-lg font-bold uppercase">Order Summary</h3>
      </div>

      <div className="px-3 py-1 space-y-5">
        {selectedBundle && (
          <div className="space-y-3 pb-3 border-b border-dashed">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-bold">{selectedBundle.bundleName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(selectedBundle.unitPrice)} / each
                </p>
              </div>
              <p className="text-sm font-bold text-primary dark:text-accent">
                {formatCurrency(selectedBundle.totalPrice)}
              </p>
            </div>
          </div>
        )}

        {addons.map((addon) => (
          <div
            key={addon._id}
            className="space-y-3 pb-3 border-b border-dashed"
          >
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold">{addon.addonName}</p>
              <span className="text-sm font-bold text-primary dark:text-accent">
                {addon.isFree ? "Free" : formatCurrency(addon.price)}
              </span>
            </div>

            {addon.items.length > 0 && (
              <div className="space-y-1.5">
                {addon.items.map((item) => (
                  <div
                    key={item.inventoryItemId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">
                      {item.itemName} × {item.selectedBags} bag
                      {item.selectedBags === 1 ? "" : "s"}
                    </span>
                    <span className="font-semibold text-primary dark:text-accent">
                      {formatCurrency(item.selectedTotal)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {totalExtraBags > 0 && (
          <div className="space-y-3 pb-3 border-b border-dashed">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                Extra Bags ({totalExtraBags})
              </span>
            </div>
            <div className="space-y-2">
              {extraBags.map((bag) => (
                <div
                  key={bag._id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-bold">
                    {bag.qty} x {bag.subCollectionId?.subCollectionName}
                  </span>
                  <span className="font-bold shrink-0 text-primary dark:text-accent">
                    {formatCurrency(bag.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {torsoBags.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-dashed">
            {torsoBags.map((bag) => (
              <div
                key={bag._id}
                className="flex justify-between items-center text-sm"
              >
                <span className="font-bold">{bag.bagName}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold uppercase">Estimated Total</span>
          <div className="text-right">
            <p className="text-3xl font-bold text-success dark:text-accent">
              {formatCurrency(totalOrderPrice)}
            </p>
          </div>
        </div>

        <CheckoutButton
          label="Checkout"
          disabled={!canCheckout}
          className="mb-3 h-12"
        />
      </div>
    </Card>
  </aside>
);

export default DealerOrderSummary;
