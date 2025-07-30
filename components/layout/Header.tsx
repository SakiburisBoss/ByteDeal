import React, { Suspense } from 'react';
import HeaderClient from './HeaderClient';
import { CategorySelector } from '../category/CategorySelector';

const Header = () => {
    return (
        <Suspense fallback={
            <header className='w-full sticky top-0 z-50 dark:bg-gray-950/80'>
                <div className='w-full transform transition-all duration-300 ease-in-out translate-y-0'>
                    <div className='w-full bg-black py-2 dark:bg-gray-900 border-b border-gray-800'>
                        <div className='container mx-auto flex items-center justify-center px-4 sm:px-6 lg:px-8'>
                            <span className='text-center text-sm font-medium tracking-wide text-white/90'>FREE SHIPPING ON ORDERS OVER $15.00 • FREE RETURNS</span>
                        </div>
                    </div>
                    <div className='w-full flex justify-between items-center py-3 sm:py-4 bg-white/80 dark:bg-gray-950/80 shadow-sm border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm'>
                        <div className='flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl'>
                            <div className='flex-1' />
                            <div className='text-2xl font-bold text-gray-900 dark:text-white'>ByteDeal</div>
                            <div className='flex-1' />
                        </div>
                    </div>
                </div>
            </header>
        }>
            <HeaderClient categorySelector={<CategorySelector />} />
        </Suspense>
    );
};

export default Header;
