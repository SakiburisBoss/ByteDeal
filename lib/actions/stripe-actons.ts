"use server";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { getOrCreateCart } from "./cart-actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export const createCheckoutSession = async (cartId: string) => {
  const user = await currentUser();
  const cart = await getOrCreateCart(cartId);

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Validate all items before proceeding
  const validItems = cart.items.filter((item: { title: string; price: number; quantity: number }) => {
    if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
      console.error('Invalid item title in cart:', item);
      return false;
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      console.error('Invalid price for item:', item);
      return false;
    }
    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      console.error('Invalid quantity for item:', item);
      return false;
    }
    return true;
  });

  if (validItems.length === 0) {
    throw new Error("No valid items in cart");
  }

  const totalPrice = validItems.reduce(
    (total: number, item: { price: number; quantity: number }): number => total + (item.price * item.quantity),
    0
  );

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: validItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL!}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL!}`,
    customer_email: user?.emailAddresses?.[0].emailAddress,
    metadata: {
      cartId,
      userId: user?.id || "_",
    },
    shipping_address_collection: {
      allowed_countries: ["US", "BD"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            currency: "usd",
            amount: totalPrice >= 15 ? 0 : 5 * 100,
          },
          display_name: totalPrice >= 15 ? "Free Shipping" : "Standard Shipping",
          delivery_estimate:{
            minimum: {
                unit:'business_day',
                value:3
            },
            maximum: {
                unit:'business_day',
                value:5
            }
          }
        },
      },
    ],
  });
  if(!session.url) {
    throw new Error("Failed to create checkout session");
  }
  return session.url;
};
