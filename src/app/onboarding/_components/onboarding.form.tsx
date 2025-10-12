"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

// Define the schema with explicit types
const onboardingSchema = z.object({
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().min(5, "License number is required"),
  experience: z.string().min(1, "Experience is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  consultationFee: z.number().positive("Fee must be positive"),
  city: z.string().min(2, "City is required"),
});

// Define the form values type explicitly
type FormValues = z.infer<typeof onboardingSchema>;

const indianCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Indore"
];

export function DoctorOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Use the explicit FormValues type in the useForm hook
  const form = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      specialization: "",
      licenseNumber: "",
      experience: "",
      bio: "",
      consultationFee: 0,
      city: "",
    },
  });

  // Use the FormValues type in the submit handler
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/doctor/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Onboarding failed");
        return;
      }

      router.push("/doctor/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Doctor Onboarding</CardTitle>
        <CardDescription>Complete your profile to start using the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Cardiology, Pediatrics" {...field} />
                  </FormControl>
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
                    <Input placeholder="e.g. MD-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 5" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value)}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {indianCities.map((city) => (
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
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your professional background and expertise"
                      className="min-h-[100px]"
                      {...field}
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
                      placeholder="e.g. 500" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="text-sm font-medium text-destructive">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Complete Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}