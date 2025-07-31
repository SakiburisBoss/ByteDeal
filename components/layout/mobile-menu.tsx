// components/layout/mobile-menu.tsx
"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { X } from "lucide-react";
import ThemeToggle from "../toggle-theme";
import { useCartStore } from "@/stores/cart-store";
import { useShallow } from "zustand/shallow";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  categorySelector: React.ReactNode;
};

const MobileMenu = ({ isOpen, onClose, categorySelector }: MobileMenuProps) => {
  const { getTotalItems } = useCartStore(
    useShallow((state) => ({
      getTotalItems: state.getTotalItems,
    }))
  );

  // Prevent background scrolling when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className={`fixed left-0 top-0 z-50 h-screen w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white"
              onClick={onClose}
            >
              ByteDeal
            </Link>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-4">
              <MobileNavItem href="/" onClick={onClose}>
                Home
              </MobileNavItem>
              <div className="py-2">
                <h3 className="px-4 pb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Categories
                </h3>
                {categorySelector}
              </div>
              <MobileNavItem href="/sale" onClick={onClose}>
                Sale
              </MobileNavItem>
              <MobileNavItem href="/new-arrivals" onClick={onClose}>
                New Arrivals
              </MobileNavItem>
              <MobileNavItem href="/featured" onClick={onClose}>
                Featured Products
              </MobileNavItem>
              <MobileNavItem href="/deals" onClick={onClose}>
                Daily Deals
              </MobileNavItem>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-4 dark:border-gray-800">
              <div className="space-y-1 px-4">
                <MobileNavItem href="/account" onClick={onClose}>
                  My Account
                </MobileNavItem>
                <MobileNavItem href="/orders" onClick={onClose}>
                  My Orders
                </MobileNavItem>
                <MobileNavItem href="/wishlist" onClick={onClose}>
                  Wishlist
                </MobileNavItem>
                <MobileNavItem href="/help" onClick={onClose}>
                  Help Center
                </MobileNavItem>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <SignedIn>
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Account
                  </span>
                </div>
              </SignedIn>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    onClick={onClose}
                    className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-700 hover:to-purple-700"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              
              <ThemeToggle />
            </div>
            
            <div className="mt-4 flex justify-center">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                onClick={onClose}
              >
                <span>View Cart</span>
                {getTotalItems() > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Mobile nav item component
const MobileNavItem = ({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
  >
    {children}
  </Link>
);

export default MobileMenu;