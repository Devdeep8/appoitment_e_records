// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/(auth)/error?error=InvalidToken", req.url)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
    
    // Update user verification status
    const user = await db.user.update({
      where: { id: decoded.userId },
      data: { emailVerified: new Date() },
    });

    // Create a new sign-in token for NextAuth
    const signInToken = jwt.sign(
      { userId: user.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "5m" } // Short-lived token for sign-in
    );

    // Determine callback URL based on role
    const callbackUrl = user.role === "DOCTOR" ? "/onboarding" : "/dashboard";

    // Redirect to NextAuth sign-in with our custom token
    return NextResponse.redirect(
      new URL(
        `/sign-in?token=${signInToken}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        req.url
      )
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/(auth)/error?error=VerificationFailed", req.url)
    );
  }
}