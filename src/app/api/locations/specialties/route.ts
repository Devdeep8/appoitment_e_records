import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  
  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }
  
  try {
    // Get location
    const location = await db.location.findFirst({
      where: { city : city as string },
      include: {
        _count: {
          select: { doctors: true }
        }
      }
    });
    
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    // Get specialties available in this location
    const specialties = await db.doctorSpecialty.findMany({
      where: {
        doctor: {
          cityName: city,
          isAvailable: true
        }
      },
      include: {
        specialty: true
      },
      distinct: ['specialtyId']
    });
    
    // Count doctors per specialty
    const specialtyCounts = await Promise.all(
      specialties.map(async (ds) => {
        const count = await db.doctorSpecialty.count({
          where: {
            specialtyId: ds.specialtyId,
            doctor: {
              cityName: city,
              isAvailable: true
            }
          }
        });
        
        return {
          ...ds.specialty,
          doctorCount: count
        };
      })
    );
    
    return NextResponse.json({
      location,
      specialties: specialtyCounts
    });
  } catch (error) {
    console.error('Error fetching location specialties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
