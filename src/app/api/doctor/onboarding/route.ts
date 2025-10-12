import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import db from "@/lib/db";

const onboardingSchema = z.object({
  specialization: z.string().min(2),
  licenseNumber: z.string().min(5),
  experience: z.string().min(1),
  bio: z.string().min(10),
  consultationFee: z.coerce.number().positive(),
  city: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { specialization, licenseNumber, experience, bio, consultationFee, city } =
      onboardingSchema.parse(body);

    await db.doctor.update({
      where: { userId: session.user.id },
      data: {
        specialization,
        licenseNumber,
        experienceYears: parseInt(experience),
        biography: bio,
        consultationFee,
        city,
      },
    });

    return NextResponse.json({ message: "Onboarding completed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Doctor onboarding error:", error);
    return NextResponse.json(
      { error: "An error occurred during onboarding" },
      { status: 500 }
    );
  }
}
