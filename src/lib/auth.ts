import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/generated/prisma";
import { google } from "better-auth/social-providers";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./email";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    emailOTP({
      expiresIn: 60 * 10,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp }) {
        await sendEmail({
          to: email,
          subject: "Verify your email",
          html: `
            <h2>Hello ${email},</h2>
            <p>Thank you for registering. Please verify your email with the code below:</p>
            <h3 style="background-color: #f0f0f0; padding: 10px; text-align: center;">${otp}</h3>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't register for this account, you can safely ignore this email.</p>
          `,
        });
      },
    }),
  ],
  session : {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  }
  // socialProviders: {
  //     google : {
  //         clientId
  //     }
  // }
});
