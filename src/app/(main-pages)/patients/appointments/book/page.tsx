// app/book-appointment/page.tsx
import Client from "./_components/client";

// This could come from your database or API
const availableCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Bhopal",
  "Indore",
  "Nagpur",
  "Surat",
  "Vadodara"
];

export default async function BookAppointment() {
  return (
    <main className="p-4">
      <div className="">

        <Client  />
      </div>
    </main>
  );
}