import React from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CancelOrderModal = ({
  open,
  onOpenChange,
  reason,
  notes,
  onReasonChange,
  onNotesChange,
  onConfirm,
  isValid,
  isLoading,
  cancellationReasons = [],
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Reason selection */}
          <div className="space-y-3">
            <Label className="font-semibold">Reason for cancellation</Label>
            <RadioGroup
              value={reason}
              onValueChange={onReasonChange}
              className="gap-2"
            >
              {cancellationReasons.map((r) => (
                <Label
                  key={r}
                  className="flex items-center gap-2 p-3 rounded-md border cursor-pointer hover:bg-input/50"
                >
                  <RadioGroupItem value={r} />
                  <span className="text-sm font-medium">{r}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Notes textarea (visible when "Other" selected) */}
          {reason === "Other" && (
            <div className="space-y-2">
              <Label className="font-semibold">Additional details</Label>
              <Textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Please tell us more..."
                rows={3}
              />
            </div>
          )}

          {/* Refund notice */}
          <div className="flex items-start gap-2">
            <Check className="size-4 text-primary mt-0.5 shrink-0" />
            <span className="text-xs text-primary leading-relaxed">
              A full refund will be issued to your original payment method.
              Depending on your bank, it may take 5–10 business days to appear
              in your account.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Keep Order
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderModal;
