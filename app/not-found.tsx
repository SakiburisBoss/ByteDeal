"use client";
import { Rocket, Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-[#121212] dark:to-[#0a0722] flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-indigo-900/20 overflow-hidden transition-all hover:shadow-2xl dark:hover:shadow-indigo-900/30">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-full animate-pulse">
              <Rocket className="text-indigo-600 dark:text-indigo-400 w-16 h-16" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-8xl md:text-9xl font-bold text-indigo-600 dark:text-indigo-500 mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-indigo-100 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-indigo-200/80 max-w-md mx-auto">
              The page you are looking for might have been moved, deleted, or never existed.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 dark:from-violet-700 dark:to-indigo-800 dark:hover:from-violet-800 dark:hover:to-indigo-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Get Back
            </button>
            
            <button 
              onClick={() => window.location.reload()} 
              className="dark:bg-indigo-900/50 dark:hover:bg-indigo-900 dark:text-indigo-100 dark:border dark:border-indigo-800"
            >
              Try Again
            </button>
          </div>
          
          <div className="mt-10 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search our site..."
                className="w-full py-3 px-4 pl-12 border border-gray-300 dark:border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-transparent dark:bg-indigo-900/20 dark:text-indigo-100 dark:placeholder-indigo-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-indigo-500 w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-indigo-900/30 p-6 text-center text-gray-500 dark:text-indigo-400 text-sm">
          © {new Date().getFullYear()} Sakibur Rahman • All Rights Reserved
        </div>
      </div>
    </div>
  );
}