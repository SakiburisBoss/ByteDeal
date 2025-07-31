// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

const Page = async ({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) => {
  const params = await searchParams;
  const redirectUrl = params?.redirect_url || "/";
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn 
        forceRedirectUrl={`/initialize?redirect_url=${encodeURIComponent(redirectUrl)}`}
      />
    </div>
  );
};

export default Page;