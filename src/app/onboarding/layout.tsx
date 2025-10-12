import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export default async function DoctorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session
  const session = await getServerSession(authOptions);

  // Unauthorized access
  if (!session || session.user.role !== "DOCTOR") {
    redirect("/"); // send them home or login
  }

  // Fetch doctor record
  const doctor = await db.doctor.findUnique({
    where: { userId: session.user.id },
    select: { licenseNumber: true },
  });

  // If license number is already present => onboarding complete
  if (doctor?.licenseNumber) {
    redirect("/doctors");
  }

  // Otherwise, show onboarding form
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-3xl">
        {children}
      </div>
    </div>
  );
}
