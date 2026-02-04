import React from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import CartSheet from "@/components/cart/CartSheet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Router from "@/routes/Router";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { useAuthInit } from "@/hooks/useAuthInit";

const App = () => {
  useAuthInit();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <CartSheet />
        <Header />
        <main className={`flex-1 ${!isHomePage ? "pt-20" : ""}`}>
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster position="bottom-right" duration={5000} />
    </>
  );
};

export default App;
