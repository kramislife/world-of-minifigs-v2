import React, { useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constant/appConfig";
import { useConfirmOrderQuery } from "@/redux/api/paymentApi";
import { authApi } from "@/redux/api/authApi";
import { publicApi } from "@/redux/api/publicApi";
import { clearCartLocal } from "@/redux/slices/cartSlice";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const CheckoutSuccess = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const { data, isLoading, isError, error } = useConfirmOrderQuery(
    sessionId ?? "",
    {
      skip: !sessionId,
    },
  );

  useEffect(() => {
    if (!sessionId) {
      navigate("/", { replace: true });
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (data?.success && data?.order) {
      dispatch(authApi.util.invalidateTags(["Cart"]));
      dispatch(clearCartLocal());

      const productIds = data.order.items?.map((item) => ({
        type: "Product",
        id: item.productId?.toString?.() ?? item.productId,
      })) ?? [];
      if (productIds.length > 0) {
        dispatch(publicApi.util.invalidateTags([...productIds, "Product"]));
      }
    }
  }, [data, dispatch]);

  if (!sessionId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Confirming your order...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5">
        <div className="max-w-md w-full text-center space-y-6">
          <p className="text-destructive">
            {error?.data?.message || "Failed to confirm order. Please try again."}
          </p>
          <Button variant="accent" asChild>
            <Link to="/">Go to {APP_NAME}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-5">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Thank you for your order!
          </h1>
          <p className="text-muted-foreground">
            Your payment was successful. We&apos;ll process your order and get it
            to you as soon as possible.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="accent" className="w-full sm:w-auto" asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link to="/">{APP_NAME} Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
