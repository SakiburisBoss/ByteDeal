"use client";

import React from "react";
import { useCartStore } from "@/stores/cart-store";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useShallow } from "zustand/shallow";
import ThemeToggle from "../toggle-theme";
import Link from "next/link";
import HeaderSearchBar from "./search-bar";

type HeaderClientProps = {
  categorySelector: React.ReactNode;
};

const HeaderClient = ({ categorySelector }: HeaderClientProps) => {
  const { open, getTotalItems } = useCartStore(
    useShallow((state) => ({
      open: state.open,
      getTotalItems: state.getTotalItems,
    }))
  );

  const [isOpen, setIsOpen] = React.useState<boolean>(true);
  const [prevScrollY, setPrevScrollY] = React.useState<number>(0);
  const [mounted, setMounted] = React.useState<boolean>(false);

  // Set mounted to true after component mounts on client side
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledUp = currentScrollY < prevScrollY;

      if (scrolledUp) {
        setIsOpen(true);
      } else if (currentScrollY > 100) {
        setIsOpen(false);
      }

      setPrevScrollY(currentScrollY);
    };

    setPrevScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollY]);

  return (
    <header className="w-full sticky top-0 z-50 dark:bg-gray-950/80">
      <div
        className={`w-full transform transition-all duration-300 ease-in-out ${isOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        <AnnouncementBar />

        <div className="w-full flex justify-between items-center py-3 sm:py-4 bg-white/80 dark:bg-gray-950/80 shadow-sm border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm">
          <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
            {/* Left section - Menu and Navigation */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white md:hidden"
                aria-label="Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
                {categorySelector}
                <Link
                  href="/sale"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                >
                  Sale
                </Link>
                <Link
                  href="/new-arrivals"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                >
                  New Arrivals
                </Link>
              </nav>
            </div>

            {/* Center section - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link
                href="/"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                ByteDeal
              </Link>
            </div>

            {/* Right section - Search, Account, Cart */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden md:block">
                <HeaderSearchBar />
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </button>
                  </SignInButton>
                </SignedOut>

                <ThemeToggle />

                <button
                  onClick={open}
                  className="relative text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                  aria-label="Cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {mounted && getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const AnnouncementBar = () => {
  return (
    <div className="w-full bg-black py-2 dark:bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <span className="text-center text-sm font-medium tracking-wide text-white/90">
          FREE SHIPPING ON ORDERS OVER $15.00 • FREE RETURNS
        </span>
      </div>
    </div>
  );
};

export default HeaderClient;
