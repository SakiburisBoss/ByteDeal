
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import Stripe from 'stripe';

const getCheckOutSession = async (sessionId:string) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
        apiVersion:'2025-06-30.basil',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
}

const CheckoutSuccessPage =async ({searchParams}:{
    searchParams:Promise<{session_id:string}>
}) => {

    const {session_id} = await searchParams;

    if(!session_id) {
        redirect('/');
    }

    const session = await getCheckOutSession(session_id);
    if(!session) {
        redirect('/');
    }
  return (
    <Suspense fallback={
      <div className='min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
        <div className='text-gray-600 dark:text-gray-400'>Loading order details...</div>
      </div>
    }>
      <div className='min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
        <div className='max-w-md w-full mx-auto p-6'>
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center transition-colors duration-200'>
            <div className='w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200'>
              <svg className='w-8 h-8 text-green-500 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Thank you for your order!</h1>
            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              We have received your order, and will send you a confirmation email shortly!
            </p>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              Order total: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: session.currency || 'USD',
              }).format((session.amount_total || 0) / 100)}
            </div>
            <div className='text-sm text-gray-500 dark:text-gray-400'>Order email: {session.customer_details?.email}</div>
          </div>
        </div>
      </div>
    </Suspense>
    )
}

export default CheckoutSuccessPage