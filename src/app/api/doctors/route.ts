import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const specialty = searchParams.get('specialty');
  const timeSlot = searchParams.get('timeSlot');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  if (!city || !specialty || !timeSlot) {
    return NextResponse.json({ error: 'All parameters are required' }, { status: 400 });
  }
  
  try {
    // Get day of week (0=Sunday, 6=Saturday)
    const dayOfWeek =  1;
    
    // Define time range based on timeSlot
    let startTime, endTime;
    
    if (timeSlot === 'morning') {
      startTime = "09:00";
      endTime = "12:00";
    } else if (timeSlot === 'afternoon') {
      startTime = "12:00";
      endTime = "17:00";
    } else {
      startTime = "17:00";
      endTime = "21:00";
    }
    
    // Find doctors with all criteria
    const doctors = await db.doctor.findMany({
      where: {
        cityName: city,
        isAvailable: true,
        specialties: {
          some: {
            specialty: {
              name: specialty
            }
          }
        },
        timeSlots: {
          some: {
            dayOfWeek,
            startTime: { lte: startTime },
            endTime: { gte: endTime }
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        },
        specialties: {
          include: {
            specialty: true
          }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { rating: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Get total count for pagination
    const total = await db.doctor.count({
      where: {
        cityName: city,
        isAvailable: true,
        specialties: {
          some: {
            specialty: {
              name: specialty
            }
          }
        },
        timeSlots: {
          some: {
            dayOfWeek,
            startTime: { lte: startTime },
            endTime: { gte: endTime }
          }
        }
      }
    });
    
    return NextResponse.json({
      doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
