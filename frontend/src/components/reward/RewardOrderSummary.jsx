import { Card } from "@/components/ui/card";
import { CheckoutButton } from "@/components/shared/OrderActionButton";

const RewardOrderSummary = ({
  selectedBundle,
  selectedAddon,
  totalOrderPrice,
}) => {
  return (
    <aside className="lg:sticky lg:top-24 space-y-5">
      <Card className="border-2 border-accent overflow-hidden p-0">
        <div className="bg-accent p-4 text-accent-foreground">
          <h3 className="text-lg font-bold uppercase">Order Summary</h3>
        </div>

        <div className="px-3 py-1 space-y-5">
          {selectedBundle && (
            <div className="pb-3 border-b border-dashed">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold">{selectedBundle.bundleName}</p>
                <p className="text-sm font-bold text-primary dark:text-accent">
                  ${selectedBundle.totalPrice?.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {selectedAddon && (
            <div className="space-y-3 pb-3 border-b border-dashed">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-bold">
                    {selectedAddon.quantity} Minifigures
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAddon.duration} Months x $
                    {selectedAddon.price?.toFixed(2)}/month
                  </p>
                </div>
                <p className="text-sm font-bold text-primary dark:text-accent">
                  ${selectedAddon.price?.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {(selectedBundle || selectedAddon) && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold uppercase">
                  Total Amount
                </span>
                <div className="text-right">
                  <p className="text-3xl font-bold text-success dark:text-accent">
                    ${totalOrderPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              {selectedBundle && selectedAddon && (
                <div className="border-t border-dashed border-border pt-5">
                  <p className="text-sm font-bold text-primary">
                    NOTE:
                    <span className="text-xs text-muted-foreground leading-relaxed font-normal">
                      &nbsp;This first payment covers your bundle. After that,
                      you'll only be billed&nbsp;
                      <span className="font-bold text-primary">
                        ${selectedAddon.price?.toFixed(2)}
                      </span>
                      &nbsp;for the next {selectedAddon.duration - 1} month
                      {selectedAddon.duration - 1 !== 1 ? "s" : ""}.
                    </span>
                  </p>
                </div>
              )}
            </>
          )}

          {!selectedBundle && !selectedAddon && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Select a bundle or add-on to see order summary
              </p>
            </div>
          )}

          <CheckoutButton
            label="Checkout"
            disabled={!selectedBundle}
            className="mb-3 h-12"
          />
        </div>
      </Card>
    </aside>
  );
};

export default RewardOrderSummary;
