// hooks/useDoctorSearch.ts
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// Step 1: Get location and specialties
export function useLocationSpecialties(city: string) {
  return useSWR(
    city ? `/api/locations/specialties?city=${encodeURIComponent(city)}` : null,
    fetcher
  );
}

// Step 2: Get time slots
export function useTimeSlots(city: string, specialty: string) {
  return useSWR(
    city && specialty 
      ? `/api/timeslots?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}`
      : null,
    fetcher
  );
}

// Step 3: Get doctors
export function useDoctors(city: string, specialty: string, timeSlot: string, page = 1) {
  return useSWR(
    city && specialty && timeSlot
      ? `/api/doctors?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}&timeSlot=${encodeURIComponent(timeSlot)}&page=${page}`
      : null,
    fetcher
  );
}

// Step 4: Book appointment
export async function bookAppointment(appointmentData: {
  userId: string;
  doctorId: string;
  scheduledAt: Date;
  reason: string;
  symptoms: string[];
}) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to book appointment');
  }
  
  return res.json();
}