import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircle, Download, Copy, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmOrderQuery } from "@/redux/api/paymentApi";
import { authApi } from "@/redux/api/authApi";
import { publicApi } from "@/redux/api/publicApi";
import { clearCartLocal } from "@/redux/slices/cartSlice";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/assets/media/Logo.png";
import ErrorState from "@/components/shared/ErrorState";

const CheckoutSuccess = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const order = data?.order;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner minHeight="min-h-screen" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Payment Confirmation Failed"
        description="Something went wrong while confirming your payment. Please contact support."
        minHeight="min-h-screen"
      />
    );
  }

  return (
    <div className="px-5 py-10">
      {/* Header Section */}
      <div className="text-center space-y-5">
        <div className="size-16 mx-auto bg-success/10 rounded-full flex items-center justify-center ring-10 ring-success/20">
          <CheckCircle className="size-8 text-success" strokeWidth={2.5} />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Thank you for your order!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mx-auto max-w-xl">
            Your order has been placed successfully. An invoice will be sent to{" "}
            <span className="font-bold text-success">{order?.email}</span>
          </p>
        </div>

        {/* Order ID Badge */}
        <Badge
          variant="outline"
          onClick={() =>
            copyToClipboard(order?.stripeInvoiceNumber || order?._id)
          }
          className="inline-flex items-center gap-2 px-5 py-3 font-bold cursor-pointer tracking-wider uppercase"
        >
          <span>
            Invoice #{order?.stripeInvoiceNumber || order?._id?.substring(0, 7)}
          </span>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Badge>
      </div>

      {/* Header for Items */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          Order Details
          <sup className=" font-bold text-muted-foreground ml-2">
            {order?.items?.length}
          </sup>
        </h2>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Items */}
        <div className="lg:col-span-8 space-y-5">
          <div className="space-y-5">
            <div className="space-y-3">
              {order?.items?.map((item, index) => (
                <Card
                  key={index}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="flex gap-3 items-center">
                    <div className="relative w-20 h-20 overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3 border">
                          <img
                            src={Logo}
                            alt="No image"
                            className="w-full h-full object-contain opacity-50"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between self-stretch">
                      <div className="grid grid-cols-[1fr_auto] items-start">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-bold text-md line-clamp-2 hover:text-success transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <span className="font-bold text-lg text-success dark:text-accent whitespace-nowrap">
                          ${item.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-md font-bold text-muted-foreground">
                          Qty: {item.quantity}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-md font-bold text-success dark:text-accent">
                            ${item.unitPrice?.toFixed(2)}
                          </span>
                          {item.unitPrice < item.basePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${item.basePrice?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Card: Address */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 text-success font-bold uppercase text-sm tracking-widest pb-5 border-b border-dashed">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-10">
                <div className="space-y-2">
                  <p className="font-bold text-muted-foreground uppercase text-xs mb-1">
                    Recipient
                  </p>
                  <p className="font-bold text-lg leading-tight">
                    {order?.shippingAddress?.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-xs mb-1">
                    Street Address
                  </p>
                  <p className="font-bold text-lg leading-tight">
                    {order?.shippingAddress?.line1}
                  </p>
                  {order?.shippingAddress?.line2 && (
                    <p className="font-bold text-lg leading-tight">
                      {order?.shippingAddress?.line2}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-xs mb-1">
                    City & Country
                  </p>
                  <p className="font-bold text-lg leading-tight">
                    {order?.shippingAddress?.city},{" "}
                    {order?.shippingAddress?.country}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-xs mb-1">
                    State
                  </p>
                  <p className="font-bold text-lg leading-tight">
                    {order?.shippingAddress?.state}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-xs mb-1">
                    Postal Code
                  </p>
                  <p className="font-bold text-lg leading-tight">
                    {order?.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Receipt Sidebar */}
        <div className="lg:col-span-4 sticky top-24 self-start z-10">
          <Card className="pt-0">
            <CardHeader className="bg-success text-background rounded-t-lg p-5">
              <CardTitle className="text-2xl font-bold">
                Payment Receipt
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Subtotal</span>
                  <span className="font-bold text-primary">
                    ${order?.subtotal?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Shipping</span>
                  <span className="font-bold text-primary">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Sales Tax (Included)</span>
                  <span className="font-bold text-primary">
                    ${order?.taxAmount?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-dashed flex justify-between items-center">
                <span className="font-bold text-lg">Total Paid</span>
                <span className="font-extrabold text-4xl text-success dark:text-accent tracking-tighter">
                  ${order?.totalAmount?.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 pt-5">
                {order?.invoiceUrl && (
                  <Button variant="outline" className="w-full h-14" asChild>
                    <a
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="size-5" />
                      Download Invoice
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
