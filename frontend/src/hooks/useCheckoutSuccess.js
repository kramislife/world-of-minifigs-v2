import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useConfirmOrderQuery } from "@/redux/api/paymentApi";
import { authApi } from "@/redux/api/authApi";
import { publicApi } from "@/redux/api/publicApi";
import { clearCartLocal } from "@/redux/slices/cartSlice";

const useCheckoutSuccess = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useConfirmOrderQuery(sessionId ?? "", {
    skip: !sessionId,
  });

  // Redirect if no session ID
  useEffect(() => {
    if (!sessionId) {
      navigate("/", { replace: true });
    }
  }, [sessionId, navigate]);

  // Clear cart and invalidate caches on successful order
  useEffect(() => {
    if (data?.success && data?.order) {
      dispatch(authApi.util.invalidateTags(["Cart"]));
      dispatch(clearCartLocal());

      const productIds =
        data.order.items?.map((item) => ({
          type: "Product",
          id: item.productId?.toString?.() ?? item.productId,
        })) ?? [];
      if (productIds.length > 0) {
        dispatch(publicApi.util.invalidateTags([...productIds, "Product"]));
      }
    }
  }, [data, dispatch]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const order = data?.order;
  const invoiceLabel =
    order?.stripeInvoiceNumber || order?._id?.substring(0, 7);
  const invoiceValue = order?.stripeInvoiceNumber || order?._id;

  return {
    sessionId,
    order,
    isLoading,
    isError,
    copied,
    invoiceLabel,
    invoiceValue,
    copyToClipboard,
  };
};

export default useCheckoutSuccess;
