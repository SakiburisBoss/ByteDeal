// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

const Page =async ({searchParams}: {searchParams: Promise<{redirect_url: string}>}) => {
 
  const redirectUrl = (await searchParams).redirect_url;
  return (
    <SignIn 
      forceRedirectUrl={`/initialize?redirect_url=${encodeURIComponent(redirectUrl)}`} 
    />
  );
};

export default Page;