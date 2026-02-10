import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

const RewardAddon = ({
  addons,
  quantityOptions,
  onSelect,
  onQuantityChange,
}) => (
  <section id="step2">
    <div className="flex items-center justify-between mb-10">
      <div className="text-left">
        <h2 className="text-2xl font-bold mb-2 tracking-tight">
          Optional Monthly Add-ons
        </h2>
        <p className="text-muted-foreground text-sm">
          Keep the excitement going with monthly deliveries
        </p>
      </div>

      {/* Quantity Toggle */}
      <div className="flex items-center gap-3">
        {quantityOptions.map((option, index) => (
          <div key={option.value} className="flex items-center gap-3">
            {index > 0 && (
              <Switch
                checked={option.isSelected}
                onCheckedChange={(checked) =>
                  onQuantityChange(
                    checked ? option.value : quantityOptions[index - 1].value
                  )
                }
                aria-label="Toggle quantity"
              />
            )}
            <span
              className={`text-sm font-medium transition-colors cursor-pointer ${
                option.isSelected ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => onQuantityChange(option.value)}
            >
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {addons.map((addon) => (
        <Card
          key={addon._id}
          onClick={() => onSelect(addon._id)}
          className={`relative cursor-pointer transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 p-5 ${
            addon.isSelected
              ? "border-accent ring-2 ring-accent ring-offset-2"
              : ""
          }`}
        >
          {addon.isSelected && (
            <Badge
              variant="accent"
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 whitespace-nowrap z-10 uppercase"
            >
              Current Selection
            </Badge>
          )}
          <h3 className="text-2xl font-bold text-left">
            {addon.duration} Months
          </h3>

          <div className="w-full flex flex-col mt-5">
            <span className="text-5xl font-extrabold text-success dark:text-accent">
              ${addon.price || 0}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                /month
              </span>
            </span>
          </div>

          {addon.features && addon.features.length > 0 && (
            <ul className="space-y-3 flex-1 w-full overflow-hidden border-t border-dashed border-border pt-5">
              {addon.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm leading-tight"
                >
                  <Check size={16} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground/90 line-clamp-2">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  </section>
);

export default RewardAddon;
