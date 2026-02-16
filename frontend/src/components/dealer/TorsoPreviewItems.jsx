import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Logo from "@/assets/media/Logo.png";

export const PreviewItem = ({ item, idx, displayQuantity }) => (
  <Card className="relative p-0 border-border shadow-none">
    <div className="aspect-square relative overflow-hidden">
      <Badge variant="accent" className="absolute top-1 right-1 size-5">
        {displayQuantity}
      </Badge>
      <img
        src={item.image?.url || Logo}
        alt={`Torso ${idx}`}
        className="w-full h-full object-cover"
      />
    </div>
  </Card>
);

export const SortablePreviewItem = ({ id, item, idx, displayQuantity }) => {
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
      <div className="aspect-square relative overflow-hidden group">
        <div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="size-4 text-muted-foreground" />
        </div>

        <Badge variant="accent" className="absolute top-1 right-1 size-5">
          {displayQuantity}
        </Badge>

        <img
          src={item.image?.url || Logo}
          alt={`Torso ${idx}`}
          className="w-full h-full object-cover"
        />
      </div>
    </Card>
  );
};
