// app/doctors/[id]/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DoctorProfileForm } from "./_components/profile.form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Star, MapPin } from "lucide-react";
import { getDoctor } from "./actions/doctor.action";

interface DoctorProfilePageProps {
  params: Promise<{
    user: string;
  }>;
}

export default async function DoctorProfilePage({
  params,
}: DoctorProfilePageProps) {
  const session = await getServerSession(authOptions);

  const { user } = await params;

  // Check if user is authenticated
  if (!session) {
    redirect("/sign-in");
  }

  const userId = user;

  if (userId === undefined) {
    redirect("/unauthorized");
  }

  // Fetch doctor profile data
  const doctor = await getDoctor(userId);
  
  if (!doctor) {
    // Handle error case
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load doctor profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if current user is the doctor
  const isOwner = session.user.id === doctor.userId;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar - Profile summary (only show if not the owner) */}
        {!isOwner && (
          <div className="md:w-1/3 px-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {doctor.user.avatar ? (
                      <img
                        src={doctor.user.avatar}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center rounded-full border-4 border-white shadow-md bg-gray-200 text-gray-700 text-3xl font-semibold">
                        {doctor.user.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}

                    <Badge className={`absolute bottom-0 right-0 ${doctor.isAvailable ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {doctor.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">{doctor.user.name}</h2>
                    <p className="text-muted-foreground">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{doctor.rating?.toFixed(1) || 'N/A'} Rating</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{doctor.city || "Location not specified"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{doctor.experienceYears || "0"} years experience</span>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Consultation Fee</h3>
                  <p className="text-2xl font-bold">
                    {doctor.consultationFee
                      ? `₹${doctor.consultationFee}`
                      : "Not specified"}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Qualifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.qualifications?.length > 0 ? (
                      doctor.qualifications.map(
                        (qualification: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {qualification}
                          </Badge>
                        )
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No qualifications added
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main content - Profile form or read-only view */}
        <div className={isOwner ? "md:w-full" : "md:w-2/3"}>
          <DoctorProfileForm doctorId={userId} />
        </div>
      </div>
    </div>
  );
}