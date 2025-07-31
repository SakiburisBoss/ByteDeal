"use client";

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';

const HeaderSearchBar = () => {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?query=${encodeURIComponent(query)}`);
        }
    };

    // Focus effect for better mobile UX
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="relative m-2">
            <div className="relative">
                <div className='absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none'>
                    <svg 
                        className='h-4 w-4 text-gray-500 dark:text-gray-400' 
                        fill='none' 
                        viewBox='0 0 24 24' 
                        stroke='currentColor'
                        aria-hidden='true'
                    >
                        <path 
                            strokeLinecap='round' 
                            strokeLinejoin='round' 
                            strokeWidth={2} 
                            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' 
                        />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    type='text'
                    name='query'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}

                    placeholder='Search...'
                    className='w-28 pl-8 pr-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'
                    aria-label='Search products'
                />
            </div>
        </form>
    );
};

export default HeaderSearchBar;