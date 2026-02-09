import { GripVertical } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/assets/media/Logo.png";

const DealerTorsoBag = ({
  torsoBags,
  lastSelectedBag,
  onSelect,
  isAdmin,
  // Reorder props
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
      <div className="text-left mb-10">
        <h2 className="text-2xl font-bold mb-2 tracking-tight">
          Step 4 — Choose Your LEGO Torso
        </h2>
        <p className="text-muted-foreground text-sm">
          Select your preferred torso bag design.
        </p>
      </div>

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

            <div className="aspect-square flex items-center justify-center">
              {bag.firstImage ? (
                <img
                  src={bag.firstImage}
                  alt={bag.bagName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={Logo}
                  alt="Placeholder"
                  className="max-h-40 max-w-40 object-contain opacity-80"
                />
              )}
            </div>

            <div
              className={`p-2 text-center border-t transition-colors ${
                bag.isSelected ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <h3 className="text-lg font-bold font-mono uppercase tracking-tight">
                {bag.bagName}
              </h3>
            </div>
          </Card>
        ))}
      </div>

      {lastSelectedBag && localItems.length > 0 && (
        <div className="mt-10 space-y-5 pt-5 border-t border-dashed">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">
                {lastSelectedBag.bagName} Preview
              </h3>
              <p className="text-muted-foreground text-sm">
                {localItems.length} unique designs • Premium printed genuine
                LEGO torsos
                {isAdmin && (
                  <span className="ml-2 text-primary font-semibold">
                    (Drag to reorder)
                  </span>
                )}
              </p>
            </div>

            {isAdmin && hasReorderChanges && (
              <div className="flex items-center gap-2">
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

          {isAdmin ? (
            <DndContext
              sensors={reorderSensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={reorderItemIds}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {localItems.map((item, idx) => (
                    <SortablePreviewItem
                      key={idx}
                      id={idx.toString()}
                      item={item}
                      idx={idx}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {localItems.map((item, idx) => (
                <Card
                  key={idx}
                  className="relative p-0 border-border shadow-none"
                >
                  <div className="aspect-square rounded-md flex items-center justify-center relative overflow-hidden">
                    <Badge
                      variant="accent"
                      className="absolute top-1 right-1 size-5"
                    >
                      {item.quantity}
                    </Badge>
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={`Torso ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={Logo}
                        alt="Placeholder"
                        className="max-h-40 max-w-40 object-contain opacity-80"
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

// Sortable Preview Item for drag-and-drop
const SortablePreviewItem = ({ id, item, idx }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative p-0 border-border shadow-none cursor-grab active:cursor-grabbing ${
        isDragging ? "ring-2 ring-accent" : ""
      }`}
    >
      <div className="aspect-square rounded-md flex items-center justify-center relative overflow-hidden group">
        <div className="absolute top-1 left-1 z-10 bg-background/80 backdrop-blur-sm rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="size-4 text-muted-foreground" />
        </div>
        <Badge variant="accent" className="absolute top-1 right-1 size-5">
          {item.quantity}
        </Badge>
        {item.image?.url ? (
          <img
            src={item.image.url}
            alt={`Torso ${idx}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={Logo}
            alt="Placeholder"
            className="max-h-40 max-w-40 object-contain opacity-80"
          />
        )}
      </div>
    </Card>
  );
};

export default DealerTorsoBag;
