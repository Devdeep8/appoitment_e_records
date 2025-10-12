// hooks/useDoctorProfile.ts
import useSWR from "swr";
import { getDoctorProfile } from "@/lib/api/doctors";

export function useDoctorProfile(doctorId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    doctorId ? `/api/doctors/${doctorId}/profile` : null,
    () => getDoctorProfile(doctorId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const updateProfile = async (profileData: any) => {
    const response = await fetch(`/api/doctors/${doctorId}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    const updatedProfile = await response.json();
    mutate(updatedProfile, false); // Update the local data without revalidation
    return updatedProfile;
  };

  const uploadAvatar = async (file: File) => {
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
    mutate(
      { ...data, user: { ...data?.user, avatar: avatarUrl } },
      false
    ); // Update the local data without revalidation
    return avatarUrl;
  };

  return {
    profile: data,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    mutate,
  };
}
