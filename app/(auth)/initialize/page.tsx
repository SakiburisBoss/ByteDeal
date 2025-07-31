
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const initialize = async ({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) => {
  const user = await currentUser();
  if (!user) {
    return redirect("/sign-in");
  }
    
  try {
    // Initialize user in database
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.firstName || "Unknown",
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
      },
      create: {
        id: user.id,
        name: user.firstName || "Unknown",
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
      },
    });
  } catch (error) {
    console.error('Error initializing user:', error);
    // Don't block the flow if there's an error
  }

  // Safely handle redirect with a default fallback
  const params = await searchParams;
  const redirectUrl = params?.redirect_url || "/";
  return redirect(redirectUrl);
};

export default initialize;