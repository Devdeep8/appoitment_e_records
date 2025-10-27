import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    let page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const specialty = searchParams.get('specialty') || '';
    const city = searchParams.get('city') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Validate page number
    if (page < 1) page = 1;

    // Build where clause dynamically
    const where: any = {};
    
    // Initialize AND conditions array
    const andConditions: any[] = [];
    
    // Add query conditions if provided
    if (query.trim()) {
      andConditions.push({
        OR: [
          {
            // Search in user table for name
            user: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            // Search in doctor table for specialization
            specialization: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      });
    }

    // Add specialty filter if provided
    if (specialty) {
      andConditions.push({
        specialization: {
          contains: specialty,
          mode: 'insensitive'
        }
      });
    }

    // Add city filter if provided
    if (city) {
      andConditions.push({

          city: {
            contains: city,
            mode: 'insensitive'
          
        }
      });
    }

    // Apply AND conditions if any exist
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Get total count for pagination
    const total = await db.doctor.count({ where });

    // Calculate pagination values
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Build sort object based on the sortBy parameter
    let orderBy: any = {};
    
    // Handle sorting by name (which is in user table)
    if (sortBy === 'name') {
      orderBy = {
        user: {
          name: sortOrder
        }
      };
    } else {
      // Handle sorting by doctor table fields
      orderBy[sortBy] = sortOrder;
    }

    // Get paginated results with user relation
    const doctors = await db.doctor.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        specialization: true,
        experienceYears: true,
        city:true,
        rating: true,

        // Include user relation to get the name and city
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      doctors,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      metadata: {
        query,
        filters: {
          specialty,
          city // Added city to metadata
        },
        sort: {
          by: sortBy,
          order: sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    
    // Proper error type checking
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to search doctors',
        details: errorMessage,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}