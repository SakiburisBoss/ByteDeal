// components/header/HeaderClient.tsx
"use client";

import React from "react";
import { useCartStore } from "@/stores/cart-store";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useShallow } from "zustand/shallow";
import ThemeToggle from "../toggle-theme";
import Link from "next/link";
import HeaderSearchBar from "./search-bar";
import MobileMenu from "./mobile-menu"; // Import the new component
import { Menu } from "lucide-react"; // Import menu icon

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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

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
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        categorySelector={categorySelector}
      />
      
      <div
        className={`w-full transform transition-all duration-300 ease-in-out ${isOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        <AnnouncementBar />

        <div className="w-full flex justify-between items-center py-3 sm:py-4 bg-white/80 dark:bg-gray-950/80 shadow-sm border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm">
          <div className="flex justify-between items-center w-full px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
            {/* Left section - Menu and Logo */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
              {/* Mobile Menu Button */}
              <button
                className="cursor-pointer text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white md:hidden"
                aria-label="Menu"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Mobile Logo */}
              <Link
                href="/"
                className="md:hidden text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap"
              >
                ByteDeal
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
                {categorySelector}
                <Link
                  href="/sale"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 whitespace-nowrap"
                >
                  Sale
                </Link>
                <Link
                  href="/new-arrivals"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 whitespace-nowrap"
                >
                  New Arrivals
                </Link>
              </nav>
            </div>

            {/* Center section - Search bar on mobile, Logo on desktop */}
            <div className="flex-1 md:flex-none md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
              {/* Search bar - Mobile only */}
              <div className="md:hidden mx-2 w-full max-w-[320px] mx-auto">
                <HeaderSearchBar />
              </div>
              
              {/* Logo - Desktop only */}
              <div className="hidden md:block">
                <Link
                  href="/"
                  className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white"
                >
                  ByteDeal
                </Link>
              </div>
            </div>

            {/* Right section - Icons and Actions */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Desktop Search */}
              <div className="hidden md:block">
                <HeaderSearchBar />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-700 dark:to-purple-800 dark:hover:from-indigo-800 dark:hover:to-purple-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-colors duration-200 whitespace-nowrap">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                
                <button
                  onClick={open}
                  className="cursor-pointer relative text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
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
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
                
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// ... (AnnouncementBar remains the same)
const AnnouncementBar = () => {
  return (
    <div className="w-full bg-black py-2 dark:bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <span className="text-center text-xs sm:text-sm font-medium tracking-wide text-white/90">
          FREE SHIPPING ON ORDERS OVER $15.00 • FREE RETURNS
        </span>
      </div>
    </div>
  );
};

export default HeaderClient;