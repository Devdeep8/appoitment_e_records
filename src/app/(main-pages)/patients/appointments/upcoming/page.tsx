import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { getServerSession } from "next-auth";

export default async function UpcommingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id
  const patient = await db.patient.findUnique({
    where: {
      userId : userId,
    },
    select: {
      id: true,
    },
  });
  // Example: fetch data on the server
  const data = await db.appointment.findMany({
    where: {
      patientId: patient?.id,
    },
    include: {
      // optionally include related models if needed
      doctor: true,
    },
  });

  

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Server Component</h1>
      <p>{JSON.stringify(data, null, 6)} </p>
    </main>
  );
}
