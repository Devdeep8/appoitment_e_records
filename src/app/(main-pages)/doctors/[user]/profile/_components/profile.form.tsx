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
import { Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

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

export function DoctorProfileForm({ doctorId  }: { doctorId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newQualification, setNewQualification] = useState("");
  const [isUploading, setIsUploading] = useState(false);

//   console.log(doctor)
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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