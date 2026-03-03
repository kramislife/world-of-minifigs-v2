import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const AddUpdateItemDialog = ({
  open,
  onOpenChange,
  mode = "add", // "add" or "edit"
  entityName = "Item",
  title,
  description,
  onSubmit,
  isLoading = false,
  submitButtonText,
  children,
  className = "sm:max-w-xl", // Default size
}) => {
  const modeConfig = {
    add: {
      title: `Add ${entityName}`,
      description: `Create a new ${entityName.toLowerCase()} record`,
      submitText: `Create ${entityName}`,
      loadingText: "Creating...",
    },
    edit: {
      title: `Edit ${entityName}`,
      description: `Update the selected ${entityName.toLowerCase()} record`,
      submitText: `Update ${entityName}`,
      loadingText: "Updating...",
    },
  };

  const config = modeConfig[mode];

  const dialogTitle = title || config.title;
  const dialogDescription = description || config.description;
  const buttonText = submitButtonText || config.submitText;
  const loadingText = config.loadingText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription && (
            <DialogDescription>{dialogDescription}</DialogDescription>
          )}
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          className="space-y-5"
        >
          {children}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="accent" type="submit" disabled={isLoading}>
              {isLoading ? loadingText : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUpdateItemDialog;
