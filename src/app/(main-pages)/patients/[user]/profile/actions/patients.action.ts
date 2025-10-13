"use server"

import db from "@/lib/db"
import { currentUser } from "@/utils/get-current-user.helper"
import { revalidatePath } from "next/cache";

export const updatePatientProfile = async (
  userId: string,
  data: {
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    insuranceNumber?: string;
    allergies?: string[];
    chronicConditions?: string[];
  }
) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Update user table fields
    await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
      },
    });

    // Update patient table fields
    await db.patient.update({
      where: { userId },
      data: {
        bloodGroup: data.bloodGroup,
        emergencyContact: data.emergencyContact,
        insuranceNumber: data.insuranceNumber,
        allergies: data.allergies || [],
        chronicConditions: data.chronicConditions || [],
      },
    });

    revalidatePath(`/patients/${userId}/profile`);

    return { success: true };
  } catch (error) {
    console.error("Error updating patient profile:", error);
    throw new Error("Failed to update profile");
  }
};


export const getPatient = async (userId : string) => {
    const user = await currentUser()
    if (user === undefined) {
        return null
    }

     const patient = await db.patient.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          dateOfBirth: true,
          address: true,
        },
      },
    },
  });


  return patient


}