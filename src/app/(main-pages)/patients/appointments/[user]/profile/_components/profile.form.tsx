// components/doctor/doctor-profile-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload, X, CalendarDays, Star, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().optional(),
  qualifications: z.array(z.string()),
  experienceYears: z.string().optional(),
  consultationFee: z.string().optional(),
  biography: z.string().optional(),
  city: z.string().optional(),
  isAvailable: z.boolean(),
});

type ProfileValues = z.infer<typeof profileSchema>;

const specializations = [
  "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
  "General Practice", "Hematology", "Infectious Disease", "Nephrology",
  "Neurology", "Oncology", "Pediatrics", "Psychiatry", "Pulmonology",
  "Rheumatology", "Surgery", "Urology"
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Indore"
];

type DoctorProfile = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    address?: string | null;
  };
  specialization: string;
  licenseNumber?: string | null;
  qualifications: string[];
  experienceYears?: number | null;
  consultationFee?: number | null;
  biography?: string | null;
  city?: string | null;
  isAvailable: boolean;
  rating?: number;
};

function useDoctorProfile(doctorId: string) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/doctors/${doctorId}/profile`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (doctorId) {
      fetchProfile();
    }
  }, [doctorId]);

  const updateProfile = async (data: ProfileValues) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`/api/doctors/${doctorId}/avatar`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const { avatarUrl } = await response.json();
      
      if (profile) {
        setProfile({
          ...profile,
          user: {
            ...profile.user,
            avatar: avatarUrl,
          },
        });
      }
      
      return avatarUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    uploadAvatar,
  };
}

export function DoctorProfileForm({ doctorId }: { doctorId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newQualification, setNewQualification] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const { profile, isLoading, updateProfile, uploadAvatar } = useDoctorProfile(doctorId);
  
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      specialization: "",
      licenseNumber: "",
      qualifications: [],
      experienceYears: "",
      consultationFee: "",
      biography: "",
      city: profile?.city || "",
      isAvailable: true,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.user.name || "",
        email: profile.user.email || "",
        phone: profile.user.phone || "",
        dateOfBirth: profile.user.dateOfBirth 
          ? new Date(profile.user.dateOfBirth).toISOString().split('T')[0] 
          : "",
        address: profile.user.address || "",
        specialization: profile.specialization || "",
        licenseNumber: profile.licenseNumber || "",
        qualifications: profile.qualifications || [],
        experienceYears: profile.experienceYears?.toString() || "",
        consultationFee: profile.consultationFee?.toString() || "",
        biography: profile.biography || "",
        city: profile.city || "",
        isAvailable: profile.isAvailable ?? true,
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileValues) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      const currentQualifications = form.getValues("qualifications");
      form.setValue("qualifications", [...currentQualifications, newQualification.trim()]);
      setNewQualification("");
    }
  };

  const handleRemoveQualification = (index: number) => {
    const currentQualifications = form.getValues("qualifications");
    const updatedQualifications = currentQualifications.filter((_, i) => i !== index);
    form.setValue("qualifications", updatedQualifications);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        await uploadAvatar(file);
        toast.success("Avatar updated successfully");
      } catch (error) {
        toast.error("Failed to upload avatar");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleBookAppointment = () => {
    // Navigate to booking page or open booking modal
    router.push(`/book-appointment?doctorId=${doctorId}`);
  };

  // Check if current user is the doctor
  const isOwner = session?.user?.id === profile?.user.id;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not the owner, show read-only view with booking option
  if (!isOwner && profile) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {profile.user.avatar ? (
                <img
                  src={profile.user.avatar}
                  alt={profile.user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center rounded-full border-4 border-white shadow-md bg-gray-200 text-gray-700 text-3xl font-semibold">
                  {profile.user.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <Badge className={`absolute bottom-0 right-0 ${profile.isAvailable ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {profile.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{profile.user.name}</h2>
              <p className="text-muted-foreground">{profile.specialization}</p>
              <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{profile.rating?.toFixed(1) || 'N/A'} Rating</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg">{profile.user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-lg">{profile.user.email}</p>
              </div>
              {profile.user.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-lg">{profile.user.phone}</p>
                </div>
              )}
              {profile.user.dateOfBirth && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-lg">{new Date(profile.user.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}
              {profile.user.address && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-lg">{profile.user.address}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Information</h3>
              <div>
                <p className="text-sm font-medium text-gray-500">Specialization</p>
                <p className="text-lg">{profile.specialization}</p>
              </div>
              {profile.licenseNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Medical License Number</p>
                  <p className="text-lg">{profile.licenseNumber}</p>
                </div>
              )}
              {profile.experienceYears !== undefined && profile.experienceYears !== null && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                  <p className="text-lg">{profile.experienceYears}</p>
                </div>
              )}
              {profile.consultationFee !== undefined && profile.consultationFee !== null && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Consultation Fee (₹)</p>
                  <p className="text-lg">{profile.consultationFee}</p>
                </div>
              )}
              {profile.city && (
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="text-lg">{profile.city}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Available for Appointments</p>
                <p className="text-lg">{profile.isAvailable ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Qualifications</h3>
            <div className="flex flex-wrap gap-2">
              {profile.qualifications?.length > 0 ? (
                profile.qualifications.map((qualification, index) => (
                  <Badge key={index} variant="secondary">
                    {qualification}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No qualifications added</p>
              )}
            </div>
          </div>
          
          {profile.biography && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Biography</h3>
              <p className="text-lg">{profile.biography}</p>
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleBookAppointment}
              disabled={!profile.isAvailable}
            >
              {profile.isAvailable ? "Book Appointment" : "Not Available for Appointments"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If the owner, show the editable form
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your personal and professional information
          </CardDescription>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.user?.avatar || ""} alt={profile?.user?.name || ""} />
                <AvatarFallback className="text-lg">
                  {profile?.user?.name?.charAt(0) || "D"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{profile?.user?.name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.specialization}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Dr. John Doe" 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john@example.com" 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 (555) 123-4567" 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="123 Main St, City, Country" 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={profile?.specialization}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical License Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MD-12345" 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="consultationFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500" 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={profile?.city || ""}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Available for Appointments</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Toggle to show/hide your availability to patients
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditing}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Qualifications</h3>
                <div className="space-y-2">
                  {form.watch("qualifications")?.map((qualification, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-sm">
                        {qualification}
                      </Badge>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQualification(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add qualification (e.g., MBBS, MD, etc.)"
                        value={newQualification}
                        onChange={(e) => setNewQualification(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddQualification}>
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Biography</h3>
                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your professional background and expertise..."
                          className="min-h-[120px]"
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.user?.avatar || ""} alt={profile?.user?.name || ""} />
                    <AvatarFallback className="text-lg">
                      {profile?.user?.name?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md">
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>{isUploading ? "Uploading..." : "Upload Avatar"}</span>
                        </div>
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUploading}
                        />
                      </Label>
                    </div>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}