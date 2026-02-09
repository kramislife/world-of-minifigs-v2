import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DealerOrderSummary = ({
  selectedBundle,
  selectedAddonData,
  totalExtraBags,
  extraBagQuantities,
  extraBags,
  selectedTorsoBagIds,
  torsoBags,
  totalOrderPrice,
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
                  ${selectedBundle.unitPrice?.toFixed(2)} / each
                </p>
              </div>
              <p className="text-sm font-bold text-primary dark:text-accent">
                ${selectedBundle.totalPrice?.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {selectedAddonData && (
          <div className="space-y-3 pb-3 border-b border-dashed">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold">{selectedAddonData.addonName}</p>
              <span className="text-sm font-bold text-primary dark:text-accent">
                ${selectedAddonData.price?.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {totalExtraBags > 0 && (
          <div className="space-y-3 pb-3 border-b border-dashed">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                Extra Bags ({totalExtraBags})
              </span>
            </div>
            <div className="space-y-2">
              {extraBags.map((bag) => {
                const qty = extraBagQuantities[bag._id] || 0;
                if (qty === 0) return null;
                return (
                  <div
                    key={bag._id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-bold">
                      {qty} x {bag.subCollectionId?.subCollectionName}
                    </span>
                    <span className="font-bold shrink-0 text-primary dark:text-accent">
                      ${(bag.price * qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTorsoBagIds.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-dashed">
            {selectedTorsoBagIds.map((id) => {
              const bag = torsoBags.find((b) => b._id === id);
              return (
                <div
                  key={id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-bold">{bag?.bagName}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold uppercase">Estimated Total</span>
          <div className="text-right">
            <p className="text-3xl font-bold text-success dark:text-accent">
              ${totalOrderPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <Button
          variant="dark"
          className="w-full h-12 mb-3"
          disabled={!selectedBundle || selectedTorsoBagIds.length === 0}
        >
          Checkout
        </Button>
      </div>
    </Card>
  </aside>
);

export default DealerOrderSummary;
