import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CommonImage from "@/components/shared/CommonImage";
import MiscellaneousPreview from "@/components/dealer/MiscellaneousPreview";
import {
  PreviewItem,
  SortablePreviewItem,
} from "@/components/dealer/TorsoPreviewItems";

// ─── Shared grid — renders items + misc tail in one place ──────────────────────
const PreviewGrid = ({
  items,
  miscQuantity,
  isAdmin,
  isCustomBundle,
  multiplier,
  reorderItemIds,
  reorderSensors,
  onDragEnd,
}) => {
  const itemNodes = isAdmin
    ? items.map((item, idx) => (
        <SortablePreviewItem
          key={idx}
          id={idx.toString()}
          item={item}
          idx={idx}
          displayQuantity={
            isCustomBundle ? item.quantity : item.quantity * multiplier
          }
        />
      ))
    : items.map((item, idx) => (
        <PreviewItem
          key={idx}
          item={item}
          idx={idx}
          displayQuantity={item.displayQuantity}
        />
      ));

  const grid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {itemNodes}
      {miscQuantity > 0 && <MiscellaneousPreview miscQuantity={miscQuantity} />}
    </div>
  );

  if (!isAdmin) return grid;

  return (
    <DndContext
      sensors={reorderSensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={reorderItemIds} strategy={rectSortingStrategy}>
        {grid}
      </SortableContext>
    </DndContext>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const DealerTorsoBag = ({
  torsoBags,
  lastSelectedBag,
  onSelect,
  isAdmin,
  isCustomBundle,
  multiplier,
  miscQuantity,
  displayItems,
  localItems,
  hasReorderChanges,
  isSavingOrder,
  reorderSensors,
  reorderItemIds,
  onDragEnd,
  onSave,
  onReset,
}) => {
  return (
    <section id="step4" className="overflow-visible">
      <div className="text-left mb-5">
        <h2 className="text-2xl font-bold mb-2 tracking-tight">
          Step 4 — Choose Your LEGO Torso
        </h2>
        <p className="text-muted-foreground text-sm">
          Select your preferred torso bag design.
        </p>
      </div>

      {/* Torso Bags */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {torsoBags.map((bag) => (
          <Card
            key={bag._id}
            onClick={() => onSelect(bag._id)}
            className={`relative cursor-pointer transition-all duration-300 group p-0 gap-0 overflow-visible hover:shadow-2xl hover:-translate-y-2 ${
              bag.isSelected
                ? "border-accent ring-2 ring-accent ring-offset-2"
                : ""
            }`}
          >
            {bag.isSelected && (
              <Badge
                variant="accent"
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 whitespace-nowrap z-10 uppercase"
              >
                Current Selection
              </Badge>
            )}

            <div className="flex items-center justify-center mt-3">
              <CommonImage src={bag.firstImage} alt={bag.bagName} />
            </div>

            <div
              className={`p-2 text-center ${bag.isSelected ? "bg-accent text-accent-foreground" : ""}`}
            >
              <h3 className="text-lg font-bold font-mono uppercase tracking-tight">
                {bag.bagName}
              </h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview Section */}
      {lastSelectedBag && displayItems.length > 0 && (
        <div className="mt-10 space-y-5 pt-5 border-t border-dashed">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                {lastSelectedBag.bagName} Preview
                {!isCustomBundle && multiplier > 1 && (
                  <Badge variant="accent" className="text-xs">
                    {multiplier}× Bundle
                  </Badge>
                )}
              </h3>

              <p className="text-muted-foreground text-sm">
                {displayItems.length} unique designs • {multiplier} bags of the
                same torso design
                {isAdmin && (
                  <span className="ml-1 text-primary"> • Drag to reorder</span>
                )}
              </p>
            </div>

            {isAdmin && hasReorderChanges && (
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={isSavingOrder}
                >
                  Reset
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={onSave}
                  disabled={isSavingOrder}
                >
                  {isSavingOrder ? "Saving..." : "Save Order"}
                </Button>
              </div>
            )}
          </div>

          {/* Grid — admin gets drag-and-drop, others get static */}
          <PreviewGrid
            items={isAdmin ? localItems : displayItems}
            miscQuantity={miscQuantity}
            isAdmin={isAdmin}
            isCustomBundle={isCustomBundle}
            multiplier={multiplier}
            reorderItemIds={reorderItemIds}
            reorderSensors={reorderSensors}
            onDragEnd={onDragEnd}
          />
        </div>
      )}
    </section>
  );
};

export default DealerTorsoBag;
