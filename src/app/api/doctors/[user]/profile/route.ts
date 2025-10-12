// app/api/doctors/[id]/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user: string }> }
) {
  try {
    const session = await getServerSession(authOptions);    
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {user} = await params
    const userId = user

    if (userId === undefined){
        return NextResponse.json({error :" user must be valid" } , {status : 403})
    }
    
    const doctor = await db.doctor.findUnique({
      where: { userId: userId },
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



    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }


    return NextResponse.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ user: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the requested profile belongs to the current user

    const {user} = await params
    const userId = user

    if (userId === undefined){
        return NextResponse.json({error :" user must be valid" } , {status : 403})
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      dateOfBirth,
      address,
      specialization,
      licenseNumber,
      qualifications,
      experienceYears,
      consultationFee,
      biography,
      city,
      isAvailable,
    } = body;

    // Update user data
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
      },
    });

    // Update doctor data
    const updatedDoctor = await db.doctor.update({
      where: { userId: userId },
      data: {
        specialization,
        licenseNumber,
        qualifications,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        consultationFee: consultationFee ? parseFloat(consultationFee) : null,
        biography,
        city,
        isAvailable,
      },
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

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}