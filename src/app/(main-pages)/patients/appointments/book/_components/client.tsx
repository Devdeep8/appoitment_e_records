// app/book-appointment/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, Stethoscope, Clock, Calendar, ChevronRight, Loader2, User, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocationSpecialties, useTimeSlots, useDoctors, bookAppointment } from "@/hooks/useDoctorSearch";
import { useSession } from "next-auth/react";

// Mock data for available cities
const availableCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"
];

// Step types for the wizard
type Step = 'location' | 'specialty' | 'timeSlot' | 'doctors' | 'booking';

export default function BookAppointment() {
  // State for each step
  const [currentStep, setCurrentStep] = useState<Step>('location');
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const {data : session , status} = useSession()
  // Form state for booking
  const [appointmentReason, setAppointmentReason] = useState("");
  const [appointmentSymptoms, setAppointmentSymptoms] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Location detection state
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [detectedCity, setDetectedCity] = useState<string>("");
  
  // SWR hooks
  const { data: locationData, isLoading: isLoadingSpecialties } = useLocationSpecialties(selectedCity);
  const { data: timeSlotData, isLoading: isLoadingTimeSlots } = useTimeSlots(selectedCity, selectedSpecialty);
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctors(selectedCity, selectedSpecialty, selectedTimeSlot);
  
  // Auto-detect location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus("loading");
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const city = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            setDetectedCity(city);
            setLocationStatus("granted");
          } catch (error) {
            console.error("Error detecting city:", error);
            setLocationStatus("denied");
          }
        },
        () => {
          setLocationStatus("denied");
        }
      );
    } else {
      setLocationStatus("denied");
    }
  }, []);

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    
    return data.address?.city || 
           data.address?.town || 
           data.address?.village || 
           "Unknown";
  };

  // Step handlers
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCurrentStep('specialty');
    // Reset dependent selections
    setSelectedSpecialty("");
    setSelectedTimeSlot("");
    setSelectedDoctor(null);
  };

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setCurrentStep('timeSlot');
    // Reset dependent selection
    setSelectedTimeSlot("");
    setSelectedDoctor(null);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setCurrentStep('doctors');
    setSelectedDoctor(null);
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setCurrentStep('booking');
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !appointmentReason) return;
    
    setIsBooking(true);
    
    try {
      // Mock patient ID - in a real app, this would come from authentication
      const userId = session?.user?.id;
      if (!userId) return null
      
      // Parse the selected date and time
      const [datePart, timePart] = selectedDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      const scheduledAt = new Date(year, month - 1, day, hours, minutes);
      
      await bookAppointment({
        userId ,
        doctorId: selectedDoctor.id,
        scheduledAt,
        reason: appointmentReason,
        symptoms: appointmentSymptoms.split(',').map(s => s.trim()).filter(Boolean)
      });
      
      setBookingSuccess(true);
      setIsBooking(false);
    } catch (error) {
      console.error("Booking failed:", error);
      setIsBooking(false);
    }
  };

  const resetSelection = () => {
    setSelectedCity("");
    setSelectedSpecialty("");
    setSelectedTimeSlot("");
    setSelectedDoctor(null);
    setCurrentStep('location');
    setBookingSuccess(false);
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
      
      if (selectedTimeSlot === 'morning') {
        startHour = 9;
        endHour = 12;
      } else if (selectedTimeSlot === 'afternoon') {
        startHour = 12;
        endHour = 17;
      } else {
        startHour = 17;
        endHour = 21;
      }
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          options.push({
            value: `${dateStr}T${timeStr}`,
            label: `${dateStr} ${timeStr}`,
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
          });
        }
      }
    }
    
    return options;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book Doctor Appointment</h1>
        <p className="text-muted-foreground mt-2">
          Follow these simple steps to book an appointment in under 3 seconds
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { id: 'location', label: 'Location', completed: !!selectedCity },
              { id: 'specialty', label: 'Specialty', completed: !!selectedSpecialty },
              { id: 'timeSlot', label: 'Time Slot', completed: !!selectedTimeSlot },
              { id: 'doctors', label: 'Select Doctor', completed: !!selectedDoctor },
              { id: 'booking', label: 'Book', completed: bookingSuccess },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.completed ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center">{step.label}</span>
                </div>
                {index < 4 && (
                  <ChevronRight
                    className={`h-5 w-5 mx-2 ${
                      step.completed ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Location Selection */}
      {currentStep === 'location' && (
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
                <MapPin className="h-4 w-4" />
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableCities.map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  onClick={() => handleCitySelect(city)}
                  className="justify-start"
                >
                  {city}
                  {detectedCity === city && (
                    <Badge variant="secondary" className="ml-2">Detected</Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Specialty Selection */}
      {currentStep === 'specialty' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Select Medical Specialty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p>Selected Location: <strong>{selectedCity}</strong></p>
            </div>

            {isLoadingSpecialties ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {locationData?.specialties?.map((specialty: any) => (
                  <Button
                    key={specialty.id}
                    variant="outline"
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
      {currentStep === 'timeSlot' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Preferred Time Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p>Location: <strong>{selectedCity}</strong></p>
              <p>Specialty: <strong>{selectedSpecialty}</strong></p>
            </div>

            {isLoadingTimeSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(timeSlotData?.timeSlots || {}).map(([timeSlot, data]: [string, any]) => (
                  <Button
                    key={timeSlot}
                    variant="outline"
                    onClick={() => handleTimeSlotSelect(timeSlot)}
                    className="justify-start h-auto p-4 flex-col"
                  >
                    <span className="font-medium capitalize">{timeSlot}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {data.length} doctors available
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Doctor Selection */}
      {currentStep === 'doctors' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select a Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p>Location: <strong>{selectedCity}</strong></p>
              <p>Specialty: <strong>{selectedSpecialty}</strong></p>
              <p>Time Slot: <strong>{selectedTimeSlot}</strong></p>
            </div>

            {isLoadingDoctors ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : doctorsData?.doctors?.length > 0 ? (
              <div className="space-y-4">
                {doctorsData.doctors.map((doctor: any) => (
                  <Card key={doctor.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDoctorSelect(doctor)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            {doctor.user.avatar ? (
                              <img
                                src={doctor.user.avatar}
                                alt={doctor.user.name}
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-primary">
                                {doctor.user.name.split(' ').map((n: any[]) => n[0]).join('')}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{doctor.user.name}</h3>
                            <p className="text-muted-foreground">{doctor.specialties[0]?.specialty?.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {doctor.experienceYears} years experience
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span>{doctor.rating}</span>
                              </div>
                              <Badge variant="outline">{doctor.clinicName}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Consultation Fee</p>
                          <p className="text-2xl font-bold">₹{doctor.consultationFee}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No doctors found matching your criteria</p>
                <Button variant="outline" onClick={resetSelection} className="mt-4">
                  Start Over
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Booking */}
      {currentStep === 'booking' && selectedDoctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p>Doctor: <strong>{selectedDoctor.user.name}</strong></p>
              <p>Specialty: <strong>{selectedDoctor.specialties[0]?.specialty?.name}</strong></p>
              <p>Clinic: <strong>{selectedDoctor.clinicName}</strong></p>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Appointment Booked Successfully!</h3>
                <p className="text-muted-foreground mb-4">
                  Your appointment has been confirmed for {selectedDate}
                </p>
                <Button onClick={resetSelection}>
                  Book Another Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Select Date & Time</Label>
                  <select
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select a time slot</option>
                    {generateTimeOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.dayName}, {option.label}
                      </option>
                    ))}
                  </select>
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

                <div className="flex gap-3">
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
                  <Button variant="outline" onClick={() => setCurrentStep('doctors')}>
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