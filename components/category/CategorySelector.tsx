"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
  { name: 'All', path: '/products' },
  { name: 'Electronics', path: '/products?category=electronics' },
  { name: 'Clothing', path: '/products?category=clothing' },
  { name: 'Home & Garden', path: '/products?category=home-garden' },
  { name: 'Books', path: '/products?category=books' },
];

export const CategorySelector = () => {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === '/products' && pathname === '/') return true;
    return pathname.startsWith(path.split('?')[0]);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200">
        Categories
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.path}
              className={`block px-4 py-2 text-sm ${
                isActive(category.path)
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
