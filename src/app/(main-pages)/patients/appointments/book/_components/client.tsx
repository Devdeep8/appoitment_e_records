// app/book-appointment/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Stethoscope,
  Clock,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  User,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isValid, parseISO } from "date-fns";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useLocationSpecialties,
  useTimeSlots,
  useDoctors,
  bookAppointment,
} from "@/hooks/useDoctorSearch";
import { useSession } from "next-auth/react";

// Mock data for available cities
const availableCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
];

// Step types for the wizard
type Step = "location" | "specialty" | "timeSlot" | "doctors" | "booking";

export default function BookAppointment() {
  // State for each step
  const [currentStep, setCurrentStep] = useState<Step>("location");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const { data: session, status } = useSession();

  // Form state for booking
  const [appointmentReason, setAppointmentReason] = useState("");
  const [appointmentSymptoms, setAppointmentSymptoms] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Location detection state
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied"
  >("idle");
  const [detectedCity, setDetectedCity] = useState<string>("");

  // SWR hooks
  const { data: locationData, isLoading: isLoadingSpecialties } =
    useLocationSpecialties(selectedCity);
  const { data: timeSlotData, isLoading: isLoadingTimeSlots } = useTimeSlots(
    selectedCity,
    selectedSpecialty
  );
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctors(
    selectedCity,
    selectedSpecialty,
    selectedTimeSlot
  );

  // Auto-detect location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus("loading");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const city = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            setDetectedCity(city);
            setLocationStatus("granted");
            toast.success(`Location detected: ${city}`, {
              description: "We've found your location automatically",
              icon: <MapPin className="h-4 w-4" />,
            });
          } catch (error) {
            console.error("Error detecting city:", error);
            setLocationStatus("denied");
            toast.error("Could not detect your location", {
              description: "Please select your city manually",
              icon: <AlertCircle className="h-4 w-4" />,
            });
          }
        },
        () => {
          setLocationStatus("denied");
          toast.warning("Location access denied", {
            description: "Please select your city manually",
            icon: <AlertCircle className="h-4 w-4" />,
          });
        }
      );
    } else {
      setLocationStatus("denied");
      toast.info("Geolocation not supported", {
        description: "Please select your city manually",
        icon: <Info className="h-4 w-4" />,
      });
    }
  }, []);

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();

    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      "Unknown"
    );
  };

  // Navigation functions
  const goToStep = (step: Step) => {
    // Validate if user can go to this step
    if (step === "specialty" && !selectedCity) {
      toast.error("Location required", {
        description: "Please select a location first",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    if (step === "timeSlot" && !selectedSpecialty) {
      toast.error("Specialty required", {
        description: "Please select a specialty first",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    if (step === "doctors" && !selectedTimeSlot) {
      toast.error("Time slot required", {
        description: "Please select a time slot first",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    if (step === "booking" && !selectedDoctor) {
      toast.error("Doctor required", {
        description: "Please select a doctor first",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    setCurrentStep(step);
  };

  // Step handlers with automatic progression
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    toast.success("Location selected", {
      description: `You've selected ${city} as your location`,
      icon: <MapPin className="h-4 w-4" />,
    });
    // Auto-advance to next step
    setTimeout(() => setCurrentStep("specialty"), 500);
  };

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty);
    toast.success("Specialty selected", {
      description: `You've selected ${specialty} as your specialty`,
      icon: <Stethoscope className="h-4 w-4" />,
    });
    // Auto-advance to next step
    setTimeout(() => setCurrentStep("timeSlot"), 500);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    toast.success("Time slot selected", {
      description: `You've selected ${timeSlot} as your preferred time`,
      icon: <Clock className="h-4 w-4" />,
    });
    // Auto-advance to next step
    setTimeout(() => setCurrentStep("doctors"), 500);
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    toast.success("Doctor selected", {
      description: `You've selected Dr. ${doctor.user.name}`,
      icon: <User className="h-4 w-4" />,
    });
    // Auto-advance to next step
    setTimeout(() => setCurrentStep("booking"), 500);
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !appointmentReason) {
      toast.error("Missing information", {
        description: "Please fill in all required fields",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    if (!session?.user?.id) {
      toast.error("Authentication required", {
        description: "Please log in to book an appointment",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    setIsBooking(true);

    try {
      // Parse the selected date and time
      const [datePart, timePart] = selectedDate.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);

      const scheduledAt = new Date(year, month - 1, day, hours, minutes);

      await bookAppointment({
        userId: session.user.id,
        doctorId: selectedDoctor.id,
        scheduledAt,
        reason: appointmentReason,
        symptoms: appointmentSymptoms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });

      setBookingSuccess(true);
      setIsBooking(false);

      toast.success("Appointment booked!", {
        description: `Your appointment with Dr. ${selectedDoctor.user.name} has been confirmed`,
        icon: <CheckCircle className="h-4 w-4" />,
        action: {
          label: "View Details",
          onClick: () => console.log("View appointment details"),
        },
      });
    } catch (error) {
      console.error("Booking failed:", error);
      setIsBooking(false);

      toast.error("Booking failed", {
        description:
          "There was an error booking your appointment. Please try again.",
        icon: <AlertCircle className="h-4 w-4" />,
        action: {
          label: "Retry",
          onClick: () => handleBooking(),
        },
      });
    }
  };

  const resetSelection = () => {
    setSelectedCity("");
    setSelectedSpecialty("");
    setSelectedTimeSlot("");
    setSelectedDoctor(null);
    setCurrentStep("location");
    setBookingSuccess(false);
    setAppointmentReason("");
    setAppointmentSymptoms("");
    setSelectedDate("");

    toast.info("Reset complete", {
      description: "All selections have been cleared",
      icon: <Info className="h-4 w-4" />,
    });
  };

  // Generate time options for booking
  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Generate slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(tomorrow);
      date.setDate(tomorrow.getDate() + i);

      // Generate time slots based on selected time slot
      let startHour, endHour;

      if (selectedTimeSlot === "morning") {
        startHour = 9;
        endHour = 12;
      } else if (selectedTimeSlot === "afternoon") {
        startHour = 12;
        endHour = 17;
      } else {
        startHour = 17;
        endHour = 21;
      }

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const timeStr = `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`;
          options.push({
            value: `${dateStr}T${timeStr}`,
            label: `${dateStr} ${timeStr}`,
            dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
          });
        }
      }
    }

    return options;
  };

  // Get step index for navigation
  const getStepIndex = (step: Step) => {
    const steps: Step[] = [
      "location",
      "specialty",
      "timeSlot",
      "doctors",
      "booking",
    ];
    return steps.indexOf(step);
  };

  // Helper function to safely format date
  const safeFormatDate = (dateString: string, formatString: string) => {
    try {
      // Check if the date string is valid
      if (!dateString || !dateString.includes("T")) {
        return "Select a date and time";
      }

      const [datePart, timePart] = dateString.split("T");
      if (!datePart || !timePart) {
        return "Select a date and time";
      }

      const date = parseISO(`${datePart}T${timePart}`);

      if (!isValid(date)) {
        return "Invalid date";
      }

      return format(date, formatString);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <div className=" mx-auto space-y-6 py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Book Doctor Appointment
        </h1>
        <p className="text-muted-foreground mt-2">
          Follow these simple steps to book an appointment in under 3 seconds
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between overflow-x-auto">
            {[
              { id: "location", label: "Location", completed: !!selectedCity },
              {
                id: "specialty",
                label: "Specialty",
                completed: !!selectedSpecialty,
              },
              {
                id: "timeSlot",
                label: "Time Slot",
                completed: !!selectedTimeSlot,
              },
              {
                id: "doctors",
                label: "Select Doctor",
                completed: !!selectedDoctor,
              },
              { id: "booking", label: "Book", completed: bookingSuccess },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center min-w-fit">
                <button
                  onClick={() => goToStep(step.id as Step)}
                  className={`flex flex-col items-center transition-colors ${
                    step.completed || currentStep === step.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      step.completed
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center whitespace-nowrap">
                    {step.label}
                  </span>
                </button>
                {index < 4 && (
                  <ChevronRight
                    className={`h-5 w-5 mx-2 flex-shrink-0 ${
                      step.completed ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() =>
            goToStep(
              ["location", "specialty", "timeSlot", "doctors", "booking"][
                Math.max(0, getStepIndex(currentStep) - 1)
              ] as Step
            )
          }
          disabled={currentStep === "location"}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            goToStep(
              ["location", "specialty", "timeSlot", "doctors", "booking"][
                Math.min(4, getStepIndex(currentStep) + 1)
              ] as Step
            )
          }
          disabled={currentStep === "booking"}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Step 1: Location Selection */}
      {currentStep === "location" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Your Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {locationStatus === "loading" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Detecting your location... Please allow location access
                </AlertDescription>
              </Alert>
            )}

            {locationStatus === "denied" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Location access denied. Please select your city manually
                </AlertDescription>
              </Alert>
            )}

            {detectedCity && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  We detected your city as <strong>{detectedCity}</strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableCities.map((city) => (
                <Button
                  key={city}
                  variant={selectedCity === city ? "default" : "outline"}
                  onClick={() => handleCitySelect(city)}
                  className="justify-start"
                >
                  {city}
                  {detectedCity === city && (
                    <Badge variant="secondary" className="ml-2">
                      Detected
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Specialty Selection */}
      {currentStep === "specialty" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Select Medical Specialty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p>
                Selected Location: <strong>{selectedCity}</strong>
              </p>
            </div>

            {isLoadingSpecialties ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {locationData?.specialties?.map((specialty: any) => (
                  <Button
                    key={specialty.id}
                    variant={
                      selectedSpecialty === specialty.name
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleSpecialtySelect(specialty.name)}
                    className="justify-start h-auto p-4 flex-col"
                  >
                    <span className="font-medium">{specialty.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {specialty.doctorCount} doctors
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Time Slot Selection */}
      {currentStep === "timeSlot" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Preferred Time Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p>
                Location: <strong>{selectedCity}</strong>
              </p>
              <p>
                Specialty: <strong>{selectedSpecialty}</strong>
              </p>
            </div>

            {isLoadingTimeSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(timeSlotData?.timeSlots || {}).map(
                  ([timeSlot, data]: [string, any]) => (
                    <Button
                      key={timeSlot}
                      variant={
                        selectedTimeSlot === timeSlot ? "default" : "outline"
                      }
                      onClick={() => handleTimeSlotSelect(timeSlot)}
                      className="justify-start h-auto p-4 flex-col"
                    >
                      <span className="font-medium capitalize">{timeSlot}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {data.length} doctors available
                      </span>
                    </Button>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Doctor Selection */}
      {currentStep === "doctors" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select a Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p>
                Location: <strong>{selectedCity}</strong>
              </p>
              <p>
                Specialty: <strong>{selectedSpecialty}</strong>
              </p>
              <p>
                Time Slot: <strong>{selectedTimeSlot}</strong>
              </p>
            </div>

            {isLoadingDoctors ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : doctorsData?.doctors?.length > 0 ? (
              <div className="space-y-4">
                {doctorsData.doctors.map((doctor: any) => (
                  <Card
                    key={doctor.id}
                    className={`cursor-pointer transition-all ${
                      selectedDoctor?.id === doctor.id
                        ? "ring-2 ring-primary"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {doctor.user.avatar ? (
                              <img
                                src={doctor.user.avatar}
                                alt={doctor.user.name}
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-primary">
                                {doctor.user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </span>
                            )}
                          </div>
                          <div className="text-center sm:text-left">
                            <h3 className="text-xl font-semibold">
                              {doctor.user.name}
                            </h3>
                            <p className="text-muted-foreground">
                              {doctor.specialties[0]?.specialty?.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {doctor.experienceYears} years experience
                            </p>
                            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span>{doctor.rating}</span>
                              </div>
                              <Badge variant="outline">
                                {doctor.clinicName}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-sm text-muted-foreground">
                            Consultation Fee
                          </p>
                          <p className="text-2xl font-bold">
                            ₹{doctor.consultationFee}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No doctors found matching your criteria
                </p>
                <Button
                  variant="outline"
                  onClick={resetSelection}
                  className="mt-4"
                >
                  Start Over
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Booking */}
      {currentStep === "booking" && selectedDoctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Book Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p>
                Doctor: <strong>{selectedDoctor.user.name}</strong>
              </p>
              <p>
                Specialty:{" "}
                <strong>
                  {selectedDoctor.specialties[0]?.specialty?.name}
                </strong>
              </p>
              <p>
                Clinic: <strong>{selectedDoctor.clinicName}</strong>
              </p>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Appointment Booked Successfully!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your appointment has been confirmed for{" "}
                  {safeFormatDate(
                    selectedDate,
                    "EEEE, MMMM d, yyyy 'at' h:mm a"
                  )}
                </p>
                <Button onClick={resetSelection}>
                  Book Another Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4">
                  <Label>Select Date & Time</Label>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {selectedDate ? (
                            format(
                              new Date(selectedDate.split("T")[0]),
                              "EEEE, MMMM d, yyyy"
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            selectedDate
                              ? new Date(selectedDate.split("T")[0])
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              const dateStr = format(date, "yyyy-MM-dd");
                              // If we already have a time, preserve it
                              if (selectedDate && selectedDate.includes("T")) {
                                const timePart = selectedDate.split("T")[1];
                                setSelectedDate(`${dateStr}T${timePart}`);
                              } else {
                                setSelectedDate(`${dateStr}T`);
                              }
                            }
                          }}
                          disabled={(date) => {
                            // Disable dates before tomorrow
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(0, 0, 0, 0);
                            return date < tomorrow;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Selection - Only show if date is selected */}
                  {selectedDate && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Select Time</Label>

                      {(() => {
                        const datePart = selectedDate.split("T")[0];
                        const timeOptions = generateTimeOptions().filter(
                          (option) => option.value.startsWith(datePart)
                        );

                        // Group by time of day
                        const morningSlots = timeOptions.filter((option) => {
                          const hour = parseInt(
                            option.value.split("T")[1].split(":")[0]
                          );
                          return hour >= 9 && hour < 12;
                        });

                        const afternoonSlots = timeOptions.filter((option) => {
                          const hour = parseInt(
                            option.value.split("T")[1].split(":")[0]
                          );
                          return hour >= 12 && hour < 17;
                        });

                        const eveningSlots = timeOptions.filter((option) => {
                          const hour = parseInt(
                            option.value.split("T")[1].split(":")[0]
                          );
                          return hour >= 17 && hour < 21;
                        });

                        return (
                          <div className="space-y-4">
                            {/* Morning Slots */}
                            {morningSlots.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Morning
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {morningSlots.map((option) => {
                                    const isSelected =
                                      selectedDate === option.value;
                                    const timePart = option.value.split("T")[1];

                                    return (
                                      <Button
                                        key={option.value}
                                        variant={
                                          isSelected ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          setSelectedDate(option.value)
                                        }
                                        className="h-auto py-2 px-3"
                                      >
                                        {timePart}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Afternoon Slots */}
                            {afternoonSlots.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Afternoon
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {afternoonSlots.map((option) => {
                                    const isSelected =
                                      selectedDate === option.value;
                                    const timePart = option.value.split("T")[1];

                                    return (
                                      <Button
                                        key={option.value}
                                        variant={
                                          isSelected ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          setSelectedDate(option.value)
                                        }
                                        className="h-auto py-2 px-3"
                                      >
                                        {timePart}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Evening Slots */}
                            {eveningSlots.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Evening
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {eveningSlots.map((option) => {
                                    const isSelected =
                                      selectedDate === option.value;
                                    const timePart = option.value.split("T")[1];

                                    return (
                                      <Button
                                        key={option.value}
                                        variant={
                                          isSelected ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          setSelectedDate(option.value)
                                        }
                                        className="h-auto py-2 px-3"
                                      >
                                        {timePart}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Selected Date & Time Display */}
                  {selectedDate && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Selected:</p>
                      <p className="text-sm text-muted-foreground">
                        {safeFormatDate(
                          selectedDate,
                          "EEEE, MMMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  )}


                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="e.g., Regular checkup, fever, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms (comma separated)</Label>
                  <Textarea
                    id="symptoms"
                    value={appointmentSymptoms}
                    onChange={(e) => setAppointmentSymptoms(e.target.value)}
                    placeholder="e.g., headache, nausea, fatigue"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || !appointmentReason || isBooking}
                    className="flex-1"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => goToStep("doctors")}>
                    Back
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
