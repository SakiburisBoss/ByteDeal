"use server";
import prisma from "@/lib/prisma";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


export const createCart = async () => {
    const user = await currentUser();

    const cart = await prisma.cart.create({
        data: {
            id: crypto.randomUUID(),
            user: user ? { connect: { id: user.id } } : undefined,
            items: {
                create: [],
            }
        },
        include: {
            items: true,
        }
    });

    return cart;
}

export const getOrCreateCart = async (cartId?: string | null) => {
    const user = await currentUser();

    if(user) {
        const userCart = await prisma.cart.findUnique({
            where: {
                userId: user.id,
            },
            include: {
                items: true,
            }
        });

        if(userCart) {
            return userCart;
        }
    }

    if(!cartId) {
        return createCart();
    }

    const cart = await prisma.cart.findUnique({
        where: {
            id: cartId
        },
        include: {
            items: true,
        }
    });

    if(!cart) {
        return createCart();
    }

    return cart;
}

// Validate cart item data
const validateCartItemData = (data: {
    title?: string;
    price?: number;
    image?: string;
    quantity?: number;
}) => {
    if (data.quantity !== undefined && (typeof data.quantity !== 'number' || data.quantity < 0)) {
        throw new Error('Invalid quantity');
    }
    if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
        throw new Error('Invalid price');
    }
    if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim() === '')) {
        throw new Error('Title is required');
    }
};

export const updateCartItem = async (
    cartId: string,
    sanityProductId: string,
    data: {
        title?: string;
        price?: number;
        image?: string;
        quantity?: number;
    }
) => {
    if (!sanityProductId) {
        throw new Error('Product ID is required');
    }

    // Validate input data
    validateCartItemData(data);

    const cart = await getOrCreateCart(cartId);
    if (!cart) {
        throw new Error('Failed to create or retrieve cart');
    }

    const existingItem = cart.items.find(
        (item) => item.sanityProductId === sanityProductId
    );

    try {
        if (existingItem) {
            // Update existing item
            if (data.quantity === 0) {
                // Remove item if quantity is 0
                await prisma.cartLineItem.delete({
                    where: { id: existingItem.id }
                });
            } else if (data.quantity && data.quantity > 0) {
                // Update quantity if provided and valid
                await prisma.cartLineItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: data.quantity }
                });
            }
        } else if (data.quantity && data.quantity > 0) {
            // Create new item
            if (!data.title || !data.price) {
                throw new Error('Title and price are required for new items');
            }
            
            await prisma.cartLineItem.create({
                data: {
                    id: crypto.randomUUID(),
                    cartId: cart.id,
                    sanityProductId,
                    quantity: data.quantity,
                    title: data.title.trim(),
                    price: data.price,
                    image: data.image?.trim() || '',
                }
            });
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw new Error(`Failed to update cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    revalidatePath("/");
    return getOrCreateCart(cartId);
}

export const syncCartWithUser = async (cartId: string | null) => {
    const user = await currentUser();

    if(!user) {
        return null;
    }

    const existingUserCart = await prisma.cart.findUnique({
        where: {
            userId: user.id
        },
        include: {
            items: true,
        }
    });

    const existingAnonymousCart = cartId ? await prisma.cart.findUnique({
        where: {
            id: cartId,
        },
        include: {
            items: true,
        }
    }) : null;

    if(!cartId && existingUserCart) {
        return existingUserCart;
    }

    if(!cartId) {
        // !cartId && !existingUserCart
        return createCart();
    }

    if(!existingAnonymousCart && !existingUserCart) {
        return createCart();
    }

    if(existingUserCart && existingUserCart.id === cartId) {
        return existingUserCart;
    }

    if(!existingUserCart) {
        const newCart = await prisma.cart.update({
            where: {
                id: cartId
            },
            data: {
                user: {
                    connect: {
                        id: user.id
                    }
                }
            },
            include: {
                items: true,
            }
        });
        return newCart;
    }

    if(!existingAnonymousCart) {
        return existingUserCart;
    }

    for(const item of existingAnonymousCart.items) {
        const existingItem = existingUserCart.items.find((item) => item.sanityProductId === item.sanityProductId);

        if(existingItem) {
            // add two cart quantities together
            await prisma.cartLineItem.update({
                where: {
                    id: existingItem.id
                },
                data: {
                    quantity: existingItem.quantity + item.quantity
                }
            })
        } else {
            // add non-existing item to the user's cart
            await prisma.cartLineItem.create({
                data: {
                    id: crypto.randomUUID(),
                    cartId: existingUserCart.id,
                    sanityProductId: item.sanityProductId,
                    quantity: item.quantity,
                    title: item.title,
                    price: item.price,
                    image: item.image
                }
            })
        }
    }

    await prisma.cart.delete({
        where: {
            id: cartId
        }
    });

    revalidatePath("/");
    return getOrCreateCart(existingUserCart.id);
}

export const addWinningItemToCart = async (cartId: string, product: Product) => {
    if (!product?._id) {
        throw new Error('Invalid product data');
    }
    
    if (!product.image) {
        throw new Error('Product image is required');
    }
    
    try {
        await updateCartItem(cartId, product._id, {
            title: product.title || 'Untitled Product',
            price: product.price || 0,
            image: urlFor(product.image ).url(),
            quantity: 1
        });
    } catch (error) {
        console.error('Error adding winning item to cart:', error);
        throw new Error(`Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}