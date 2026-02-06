import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const AddonSelection = ({ addons, selectedAddonId, onSelect, onPreview }) => (
  <section id="step2">
    <div className="text-left mb-10">
      <h2 className="text-2xl font-bold mb-2 tracking-tight">
        Step 2 — Secure Your Bag Add-Ons
      </h2>
      <p className="text-muted-foreground text-sm">
        Select premium part packages to enhance your bulk order
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {addons.map((addon) => {
        const hasItems = addon.items?.length > 0;
        const isSelected = selectedAddonId === addon._id;
        return (
          <Card
            key={addon._id}
            onClick={() => {
              if (isSelected) {
                onSelect(null);
              } else {
                hasItems ? onPreview(addon) : onSelect(addon._id);
              }
            }}
            className={`relative cursor-pointer transition-all duration-300 group gap-2 hover:shadow-2xl hover:-translate-y-2 p-5 ${
              isSelected ? "border-accent ring-2 ring-accent ring-offset-2" : ""
            }`}
          >
            {isSelected && (
              <Badge
                variant="accent"
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 whitespace-nowrap z-10 uppercase"
              >
                Current Selection
              </Badge>
            )}

            <h3 className="text-2xl font-bold text-left">{addon.addonName}</h3>

            <p className="text-sm text-muted-foreground leading-tight line-clamp-2">
              {addon.description}
            </p>

            <div className="w-full flex flex-col mt-5">
              <span className="text-5xl font-extrabold text-success dark:text-accent">
                ${addon.price}
              </span>
              <span className="text-xs text-muted-foreground mt-2">
                add-on price
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  </section>
);

export default AddonSelection;
