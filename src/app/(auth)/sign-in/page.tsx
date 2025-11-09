// app/(auth)/sign-in/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SignInClient from "./_components/sign-in.form";
import { authOptions } from "@/lib/auth"; // <-- make sure this points to your NextAuth config

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1️⃣ Get the current session (server-side)
  const session = await getServerSession(authOptions);

  // 2️⃣ If a session exists, redirect based on role
  if (session?.user?.role) {
    const role = session.user.role.toLowerCase();

    switch (role) {
      case "doctor":
        redirect("/doctors");
      case "patient":
        redirect("/patients");
      default:
        redirect("/dashboard"); // fallback if other roles exist
    }
  }

    const params = await searchParams;

  // 3️⃣ Handle search params
  const callbackUrl =  (params.callbackUrl as string) || "/";
  const token =  params.token as string | undefined;
  const message =  params.message as string | undefined;

  // 4️⃣ Render Sign-in form inside Suspense
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SignInClient callbackUrl={callbackUrl} token={token} message={message} />
    </Suspense>
  );
}
