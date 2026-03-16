import { useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useCreateCheckoutSessionMutation } from "@/redux/api/paymentApi";
import { handleApiError } from "@/utils/apiHelpers";

/**
 * Shared hook for triggering a Stripe Checkout redirect.
 * Used by product (cart + Buy Now) and dealer flows.
 */
export const useCheckout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [createCheckoutSession, { isLoading: isCheckoutLoading }] =
    useCreateCheckoutSessionMutation();

  const checkout = useCallback(
    async (payload = {}) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to checkout", {
          description: "You need to be signed in to complete your purchase",
        });
        return;
      }

      try {
        const res = await createCheckoutSession(payload).unwrap();
        if (res?.url) {
          window.location.href = res.url;
        } else {
          handleApiError(
            null,
            "Checkout failed",
            "Could not start checkout, please try again",
          );
        }
      } catch (err) {
        handleApiError(err, "Checkout failed", "Please try again");
      }
    },
    [isAuthenticated, createCheckoutSession],
  );

  return { checkout, isCheckoutLoading, isAuthenticated };
};
