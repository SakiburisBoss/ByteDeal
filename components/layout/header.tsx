'use client';
import { useCartStore } from '@/stores/cart-store';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import ThemeToggle from '../toggle-theme';
import Link from 'next/link';
import HeaderSearchBar from './search-bar';
import { usePathname,useSearchParams } from 'next/navigation';

const AnnouncementBar = () => {
    return (
        <div className='w-full bg-black py-2 dark:bg-gray-900 border-b border-gray-800'>
            <div className='container mx-auto flex items-center justify-center px-4 sm:px-6 lg:px-8'>
                <span className='text-center text-sm font-medium tracking-wide text-white/90'>FREE SHIPPING ON ORDERS OVER $15.00 • FREE RETURNS</span>
            </div>
        </div>
    );
};

type HeaderProps = {
    categorySelector: React.ReactNode;
};

const Header = ({ categorySelector }: HeaderProps) => {

    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [prevScrollY, setPrevScrollY] = useState<number>(0);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Construct the current URL for redirect
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const forcedRedirectUrl = `/initialize?redirect_url=${encodeURIComponent(currentUrl)}`;

    const { open, getTotalItems } = useCartStore(
        useShallow((state) => ({
            open: state.open,
            getTotalItems: state.getTotalItems
        }))
    );

    useEffect(() => {
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

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [prevScrollY]);

    return (
        <header className='w-full sticky top-0 z-50 dark:bg-gray-950/80'>
            <div className={`w-full transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <AnnouncementBar />

                <div className='w-full flex justify-between items-center py-3 sm:py-4 bg-white/80 dark:bg-gray-950/80 shadow-sm border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm'>
                    <div className='flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl'>
                        {/* Left section - Menu and Navigation */}
                        <div className='flex items-center gap-4 sm:gap-6'>
                            <button 
                                className='text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white md:hidden'
                                aria-label='Menu'
                            >
                                <svg xmlns='http://www.w3.org/2000/svg' 
                                     className='h-6 w-6' 
                                     fill='none' 
                                     viewBox='0 0 24 24' 
                                     stroke='currentColor'
                                >
                                    <path strokeLinecap='round' 
                                          strokeLinejoin='round' 
                                          strokeWidth={2} 
                                          d='M4 6h16M4 12h16M4 18h16' 
                                    />
                                </svg>
                            </button>

                            <nav className='hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium'>
                                {categorySelector}
                                <Link 
                                    href='/sale' 
                                    className='text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200'
                                >
                                    Sale
                                </Link>
                            </nav>
                        </div>

                        {/* Center - Logo */}
                        <Link 
                            href='/' 
                            className='md:absolute left-1/2 md:-translate-x-1/2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white hover:opacity-80 transition-opacity'
                        >
                            ByteDeal
                        </Link>

                        {/* Right section - Search and Cart */}
                        <div className='flex items-center justify-end gap-3 sm:gap-4'>
                            <HeaderSearchBar />

                            <button 
                                onClick={() => open()} 
                                className='relative text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200'
                                aria-label='Cart'
                            >
                                <svg 
                                    xmlns='http://www.w3.org/2000/svg' 
                                    className='h-6 w-6' 
                                    fill='none' 
                                    viewBox='0 0 24 24' 
                                    stroke='currentColor'
                                >
                                    <path 
                                        strokeLinecap='round' 
                                        strokeLinejoin='round' 
                                        strokeWidth={2} 
                                        d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' 
                                    />
                                </svg>
                                {getTotalItems() > 0 && (
                                    <span className='absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center'>
                                        {getTotalItems()}
                                    </span>
                                )}
                            </button>

                            <SignedOut>
                <SignInButton 
                  forceRedirectUrl={forcedRedirectUrl}
                  mode="modal"
                >
                  <button className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-purple-500/25 dark:shadow-purple-400/25">
                    ✨ Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;