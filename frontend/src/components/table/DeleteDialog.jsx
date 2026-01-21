import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const DeleteDialog = ({
  open,
  onOpenChange,
  itemName,
  title = "Delete Item",
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive mt-1.5" />
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div>
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{itemName}</span>?
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;

