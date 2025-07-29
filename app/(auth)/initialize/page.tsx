import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const initialize = async ({searchParams}: {searchParams: Promise<{redirect_url: string}>}) => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
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

  redirect((await searchParams).redirect_url);
};

export default initialize;