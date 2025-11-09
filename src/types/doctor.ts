// types/doctor.ts
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  consultationFee: number;
  availability: string;
  availableDays: string[];
  availableTimeSlots?: string[];
  profileImage?: string;
  qualifications?: string[];
  clinic?: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface TimeSlot {
  id: string;
  label: string;
  value: string;
  startTime: string;
  endTime: string;
}

export type AvailabilityFilter = 'all' | 'today' | 'tomorrow' | 'this-week';
export type TimeSlotFilter = 'all' | 'morning' | 'afternoon' | 'evening';