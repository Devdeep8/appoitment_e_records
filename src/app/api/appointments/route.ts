import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/lib/db';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body)
    const { userId, doctorId, scheduledAt, reason, symptoms } = body;
    
    // Quick validation
    if (!userId || !doctorId || !scheduledAt || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const patient = await db.patient.findUnique({
        where : {
            userId
        },
        select : {
            id : true
        }
    })

    
    // Check if slot is available
    const appointmentDate = new Date(scheduledAt);
    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt: {
          gte: appointmentDate,
          lt: new Date(appointmentDate.getTime() + 30 * 60000) // 30 minutes slot
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });
    
    if (existingAppointment) {
      return NextResponse.json({ error: 'Time slot not available' }, { status: 409 });
    }
    
    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        patientId : patient?.id as string,
        doctorId,
        scheduledAt: appointmentDate,
        reason,
        symptoms,
        status: 'PENDING'
      }
    });
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}