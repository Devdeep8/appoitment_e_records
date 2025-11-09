// app/api/timeslots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const specialty = searchParams.get('specialty');
  
  if (!city || !specialty) {
    return NextResponse.json({ error: 'City and specialty are required' }, { status: 400 });
  }
  
  try {
    // Get day of week (0=Sunday, 6=Saturday)
    const dayOfWeek = 1;
    
    // Get location
    const location = await db.location.findFirst({
        where: { city }
    });
    
    if (!location) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    
    // Get specialty
    const specialtyRecord = await db.specialty.findFirst({
        where: { name: specialty }
    });
    
    if (!specialtyRecord) {
        return NextResponse.json({ error: 'Specialty not found' }, { status: 404 });
    }
    
    // Get time slots from cache table
    const timeSlotRecords = await db.locationSpecialtyTimeSlotCache.findMany({
      where: {
        locationId: location.id,
        specialtyId: specialtyRecord.id,
        dayOfWeek :  dayOfWeek
      }
    });

    
    // Group by time of day
    const timeSlots = {
      morning: timeSlotRecords.filter(ts => ts.timeSlot === 'morning'),
      afternoon: timeSlotRecords.filter(ts => ts.timeSlot === 'afternoon'),
      evening: timeSlotRecords.filter(ts => ts.timeSlot === 'evening')
    };

    
    return NextResponse.json({ timeSlots });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}