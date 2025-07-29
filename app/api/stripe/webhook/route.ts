import prisma from "@/lib/prisma";
import { createClient } from "next-sanity";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
  });

  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });

  try {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("Stripe-Signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret!
      );
    } catch (error) {
      console.error("Invalid Stripe signature", error);
      return NextResponse.json(
        { error: "Invalid Stripe signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session & {
          shipping_details?: {
            name?: string;
            address?: {
              line1?: string;
              line2?: string | null;
              city?: string;
              state?: string;
              postal_code?: string;
              country?: string;
            };
          };
          customer_details?: {
            email?: string;
            phone?: string;
          };
        };

        const cartId = session.metadata?.cartId;
        const userId = session.metadata?.userId;

        if (!cartId) {
          return NextResponse.json(
            { error: "Missing cart ID" },
            { status: 400 }
          );
        }

        const cart = await prisma.cart.findUnique({
          where: {
            id: cartId,
          },
          include: {
            items: true,
          },
        });

        if (!cart) {
          return NextResponse.json(
            { error: "Cart not found" },
            { status: 404 }
          );
        }

        await sanityClient.create({
          _type: "order",
          orderNumber: session.id.slice(-8).toUpperCase(),
          orderDate: new Date().toISOString(),
          customerId: userId !== "-1" ? userId : undefined,
          customerEmail: session.customer_details?.email,
          customerName: session.customer_details?.name,
          stripeCustomerId:
            typeof session.customer === "object"
              ? session.customer?.id || ""
              : session.customer,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          totalPrice: Number(session.amount_total) / 100,
          // Extract shipping address details
          shippingAddress: {
            _type: "shippingAddress",
            name: session.shipping_details?.name,
            line1: session.shipping_details?.address?.line1,
            line2: session.shipping_details?.address?.line2 || "",
            city: session.shipping_details?.address?.city,
            state: session.shipping_details?.address?.state,
            postal_code: session.shipping_details?.address?.postal_code,
            country: session.shipping_details?.address?.country,
          },
          OrderItems: cart.items.map((item) => ({
            _type: "orderItem",
            _key: item.id,
            product: {
              _type: "reference",
              _ref: item.sanityProductId,
            },
            quantity: item.quantity,
            price: item.price,
          })),
          status: "PROCESSING",
        });

        // Log the shipping details for debugging
        console.log(
          "Shipping details from session:",
          JSON.stringify(session.shipping_details, null, 2)
        );

        // Delete the cart after successful order creation
        await prisma.cart.delete({
          where: {
            id: cartId,
          },
        });

        return NextResponse.json({ received: true });
        break;
      }

      default: {
        console.log(`Unhandled event type ${event.type}`);
        return NextResponse.json({ received: true });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
