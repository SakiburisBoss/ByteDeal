"use client";

import { createCheckoutSession } from "@/actions/stripe-actons";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";

const Cart = () => {
  const {
    cartId,
    syncWithUser,
    setLoaded,
    isOpen,
    close,
    getTotalItems,
    items,
    updateQuantity,
    removeItem,
    getTotalPrice,
  } = useCartStore(
    useShallow((state) => ({
      cartId: state.cartId,
      removeItem: state.removeItem,
      updateQuantity: state.updateQuantity,
      close: state.close,
      isOpen: state.isOpen,
      syncWithUser: state.syncWithUser,
      setLoaded: state.setLoaded,
      getTotalItems: state.getTotalItems,
      items: state.items,
      getTotalPrice: state.getTotalPrice,
    }))
  );

  useEffect(() => {
    const initCart = async () => {
      await useCartStore.persist.rehydrate();
      await syncWithUser();
      setLoaded(true);
    };
    initCart();
  }, [syncWithUser, setLoaded]);

  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const freeShippingAmount = 15;
  const remainingForFreeShipping = useMemo(() => {
    return Math.max(0, freeShippingAmount - totalPrice);
  }, [totalPrice]);

  const [loadingProceed, setLoadingProceed] = useState<boolean>(false);

  const handleCheckout = async () => {
    if (!cartId || loadingProceed) {
      return;
    }

    try {
      setLoadingProceed(true);
      const checkoutUrl = await createCheckoutSession(cartId);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        console.error("Failed to create checkout session");
        // Consider adding user feedback here
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      // Consider adding user feedback here
    } finally {
      setLoadingProceed(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${isOpen ? "visible bg-black/30 backdrop-blur-sm" : "invisible bg-transparent"}`}
        onClick={close}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl dark:shadow-gray-800/20
                    transform transition-all duration-300 ease-in-out z-50
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                    border-l border-gray-200 dark:border-gray-800
                `}
      >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors duration-200">
                <ShoppingCart className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Cart
              </h2>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200">
                {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={close}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white dark:focus:ring-offset-gray-900"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 transition-colors duration-200">
                  <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Looks like you haven&apos;t added any items to your cart yet!
                </p>
                <Link
                  href="/"
                  onClick={close}
                  className="bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white dark:focus:ring-offset-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={"cart-item-" + item.id}
                    className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:shadow-sm dark:hover:shadow-gray-800/20"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.title}
                      </h3>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {formatPrice(item.price)}
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, Number(e.target.value))
                          }
                          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 focus:outline-none transition-shadow hover:border-gray-300 dark:hover:border-gray-600 focus:border-black dark:focus:border-white"
                          aria-label={`Quantity for ${item.title}`}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option
                              key={`cart-qty-select-${item.id}-${num}`}
                              value={num}
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            >
                              Qty: {num}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-200 transition-colors font-medium px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t">
              {/* Shipping progress */}
              {remainingForFreeShipping > 0 ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
                    <span className="text-lg">🚚</span>
                    <span className="font-medium">
                      Add {formatPrice(remainingForFreeShipping)} more for FREE
                      shipping
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800/50 rounded-full h-2 overflow-hidden transition-colors duration-200">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(100, (totalPrice / freeShippingAmount) * 100)}%`,
                        transitionProperty: "width, background-color",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800/50">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <span className="text-lg">✨</span>
                    <span className="font-medium">
                      You&apos;ve unlocked FREE shipping!
                    </span>
                  </div>
                </div>
              )}

              {/* Order summary & checkout */}
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {remainingForFreeShipping > 0
                        ? "Calculated at checkout"
                        : "FREE"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <button
                    className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-offset-2 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus:ring-white dark:focus:ring-offset-gray-900 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={handleCheckout}
                    disabled={loadingProceed || items.length === 0}
                    aria-busy={loadingProceed}
                  >
                    {loadingProceed ? "Processing..." : "Proceed to Checkout"}
                  </button>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <span className="text-base">🔒</span>
                      </div>
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <span className="text-base">🔄</span>
                      </div>
                      <span>30-day returns</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <span className="text-base">💳</span>
                      </div>
                      <span>All major payment methods</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
