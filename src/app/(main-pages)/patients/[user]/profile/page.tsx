// app/patients/[id]/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PatientProfileForm } from "./_components/profile.form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Heart, 
  Activity,
  Droplet,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { getPatient } from "./actions/patients.action";

interface PatientProfilePageProps {
  params: Promise<{
    user: string;
  }>;
}

export default async function PatientProfilePage({
  params,
}: PatientProfilePageProps) {
  const session = await getServerSession(authOptions);

  const { user } = await params;

  // Check if user is authenticated and is a patient
  if (!session || session.user.role !== "PATIENT") {
    redirect("/sign-in");
  }

  const userId = user;

  if (userId === undefined) {
    redirect("/unauthorized");
  }

  // Fetch patient profile data
  const patient = await getPatient(userId);

  if (!patient) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load patient profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: Date | null) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar - Profile summary */}
        <div className="md:w-1/3 px-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {patient.user.avatar ? (
                    <img
                      src={patient.user.avatar}
                      alt={patient.user.name || "Patient"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center rounded-full border-4 border-white shadow-md bg-blue-100 text-blue-700 text-3xl font-semibold">
                      {patient.user.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() || "P"}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{patient.user.name}</h2>
                  <p className="text-muted-foreground text-sm">
                    Patient ID: {patient.id.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    <span>{calculateAge(patient.user.dateOfBirth)} years old</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Contact Information
                </h3>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{patient.user.email}</span>
                </div>
                {patient.user.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span>{patient.user.phone}</span>
                  </div>
                )}
                {patient.user.address && (
                  <div className="flex items-start text-sm">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>{patient.user.address}</span>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              {patient.emergencyContact && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    Emergency Contact
                  </h3>
                  <p className="text-sm">{patient.emergencyContact}</p>
                </div>
              )}

              {/* Blood Group */}
              {patient.bloodGroup && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Droplet className="h-4 w-4 mr-2 text-red-600" />
                    Blood Group
                  </h3>
                  <Badge variant="destructive" className="text-lg">
                    {patient.bloodGroup}
                  </Badge>
                </div>
              )}

              {/* Insurance */}
              {patient.insuranceNumber && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    Insurance Number
                  </h3>
                  <p className="text-sm font-mono">{patient.insuranceNumber}</p>
                </div>
              )}

              {/* Date of Birth */}
              {patient.user.dateOfBirth && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2 flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    Date of Birth
                  </h3>
                  <p className="text-sm">
                    {new Date(patient.user.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Summary Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Medical Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Allergies */}
              <div>
                <h3 className="font-medium mb-2 flex items-center text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Allergies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies && patient.allergies.length > 0 ? (
                    patient.allergies.map((allergy: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {allergy}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No known allergies</p>
                  )}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="pt-3 border-t">
                <h3 className="font-medium mb-2 flex items-center text-sm">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  Chronic Conditions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                    patient.chronicConditions.map((condition: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {condition}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No chronic conditions</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - Editable profile form */}
        <div className="md:w-2/3">
          <PatientProfileForm patientId={userId} initialData={patient} />
        </div>
      </div>
    </div>
  );
}