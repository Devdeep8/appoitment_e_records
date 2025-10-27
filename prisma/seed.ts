// prisma/seed.ts

import { UserRole  , AppointmentStatus , PrismaClient} from '@/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.medication.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.doctorAvailability.deleteMany()
//   await prisma.patient.deleteMany()
//   await prisma.doctor.deleteMany()
//   await prisma.session.deleteMany()
//   await prisma.account.deleteMany()
  await prisma.auditLog.deleteMany()
//   await prisma.user.deleteMany()

  console.log('✅ Cleared existing data')

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // ==========================================
  // 1. CREATE ADMIN USER
  // ==========================================
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      phone: '+91-9876543210',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  })

  console.log('✅ Created Admin user')

  // ==========================================
  // 2. CREATE PATIENTS (5 patients)
  // ==========================================
  const patientsData = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+91-9876543211',
      dateOfBirth: new Date('1990-05-15'),
      address: '123 Main St, Mumbai, Maharashtra',
      bloodGroup: 'O+',
      emergencyContact: '+91-9876543299',
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Hypertension'],
      insuranceNumber: 'INS-001-2024',
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      phone: '+91-9876543212',
      dateOfBirth: new Date('1985-08-22'),
      address: '456 Park Ave, Delhi',
      bloodGroup: 'A+',
      emergencyContact: '+91-9876543298',
      allergies: ['Sulfa drugs'],
      chronicConditions: ['Diabetes Type 2'],
      insuranceNumber: 'INS-002-2024',
    },
    {
      email: 'raj.kumar@example.com',
      name: 'Raj Kumar',
      phone: '+91-9876543213',
      dateOfBirth: new Date('1995-03-10'),
      address: '789 Lake Road, Bangalore',
      bloodGroup: 'B+',
      emergencyContact: '+91-9876543297',
      allergies: [],
      chronicConditions: [],
      insuranceNumber: 'INS-003-2024',
    },
    {
      email: 'priya.sharma@example.com',
      name: 'Priya Sharma',
      phone: '+91-9876543214',
      dateOfBirth: new Date('1992-11-30'),
      address: '321 Hill View, Pune',
      bloodGroup: 'AB+',
      emergencyContact: '+91-9876543296',
      allergies: ['Latex'],
      chronicConditions: ['Asthma'],
      insuranceNumber: 'INS-004-2024',
    },
    {
      email: 'amit.patel@example.com',
      name: 'Amit Patel',
      phone: '+91-9876543215',
      dateOfBirth: new Date('1988-07-18'),
      address: '555 Garden Street, Ahmedabad',
      bloodGroup: 'O-',
      emergencyContact: '+91-9876543295',
      allergies: ['Iodine'],
      chronicConditions: [],
      insuranceNumber: 'INS-005-2024',
    },
  ]

  const patients = []
  for (const patientData of patientsData) {
    const user = await prisma.user.create({
      data: {
        email: patientData.email,
        name: patientData.name,
        password: hashedPassword,
        role: UserRole.PATIENT,
        emailVerified: new Date(),
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        address: patientData.address,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${patientData.name}`,
        patient: {
          create: {
            bloodGroup: patientData.bloodGroup,
            emergencyContact: patientData.emergencyContact,
            allergies: patientData.allergies,
            chronicConditions: patientData.chronicConditions,
            insuranceNumber: patientData.insuranceNumber,
          },
        },
      },
      include: {
        patient: true,
      },
    })
    patients.push(user)
  }

  console.log(`✅ Created ${patients.length} patients`)

  // ==========================================
  // 3. CREATE DOCTORS (8 doctors with different specializations)
  // ==========================================
  const doctorsData = [
    {
      email: 'dr.sharma@hospital.com',
      name: 'Dr. Rajesh Sharma',
      phone: '+91-9876543220',
      specialization: 'Cardiology',
      licenseNumber: 'MED-CARD-001',
      qualifications: ['MBBS', 'MD Cardiology', 'FACC'],
      experienceYears: 15,
      consultationFee: 1500,
      biography: 'Senior Cardiologist with 15+ years of experience in treating heart diseases.',
      city: 'Mumbai',
      rating: 4.8,
    },
    {
      email: 'dr.mehta@hospital.com',
      name: 'Dr. Priya Mehta',
      phone: '+91-9876543221',
      specialization: 'Dermatology',
      licenseNumber: 'MED-DERM-002',
      qualifications: ['MBBS', 'MD Dermatology'],
      experienceYears: 10,
      consultationFee: 1200,
      biography: 'Specialist in skin care and cosmetic dermatology.',
      city: 'Delhi',
      rating: 4.6,
    },
    {
      email: 'dr.patel@hospital.com',
      name: 'Dr. Anil Patel',
      phone: '+91-9876543222',
      specialization: 'Orthopedics',
      licenseNumber: 'MED-ORTH-003',
      qualifications: ['MBBS', 'MS Orthopedics', 'FICS'],
      experienceYears: 20,
      consultationFee: 1800,
      biography: 'Expert in joint replacement and sports injuries.',
      city: 'Bangalore',
      rating: 4.9,
    },
    {
      email: 'dr.singh@hospital.com',
      name: 'Dr. Kavita Singh',
      phone: '+91-9876543223',
      specialization: 'Pediatrics',
      licenseNumber: 'MED-PED-004',
      qualifications: ['MBBS', 'MD Pediatrics'],
      experienceYears: 12,
      consultationFee: 1000,
      biography: 'Child health specialist with focus on preventive care.',
      city: 'Pune',
      rating: 4.7,
    },
    {
      email: 'dr.gupta@hospital.com',
      name: 'Dr. Amit Gupta',
      phone: '+91-9876543224',
      specialization: 'General Medicine',
      licenseNumber: 'MED-GEN-005',
      qualifications: ['MBBS', 'MD Internal Medicine'],
      experienceYears: 8,
      consultationFee: 800,
      biography: 'General physician for common ailments and health checkups.',
      city: 'Mumbai',
      rating: 4.5,
    },
    {
      email: 'dr.reddy@hospital.com',
      name: 'Dr. Sanjay Reddy',
      phone: '+91-9876543225',
      specialization: 'Neurology',
      licenseNumber: 'MED-NEUR-006',
      qualifications: ['MBBS', 'DM Neurology'],
      experienceYears: 18,
      consultationFee: 2000,
      biography: 'Neurologist specializing in brain and nerve disorders.',
      city: 'Hyderabad',
      rating: 4.9,
    },
    {
      email: 'dr.iyer@hospital.com',
      name: 'Dr. Lakshmi Iyer',
      phone: '+91-9876543226',
      specialization: 'Gynecology',
      licenseNumber: 'MED-GYN-007',
      qualifications: ['MBBS', 'MS Gynecology'],
      experienceYears: 14,
      consultationFee: 1300,
      biography: 'Women\'s health specialist and obstetrician.',
      city: 'Chennai',
      rating: 4.8,
    },
    {
      email: 'dr.khan@hospital.com',
      name: 'Dr. Farhan Khan',
      phone: '+91-9876543227',
      specialization: 'Ophthalmology',
      licenseNumber: 'MED-OPH-008',
      qualifications: ['MBBS', 'MS Ophthalmology'],
      experienceYears: 11,
      consultationFee: 1100,
      biography: 'Eye care specialist with expertise in cataract surgery.',
      city: 'Delhi',
      rating: 4.6,
    },
  ]

  const doctors = []
  for (const doctorData of doctorsData) {
    const user = await prisma.user.create({
      data: {
        email: doctorData.email,
        name: doctorData.name,
        password: hashedPassword,
        role: UserRole.DOCTOR,
        emailVerified: new Date(),
        phone: doctorData.phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctorData.name}`,
        doctor: {
          create: {
            specialization: doctorData.specialization,
            licenseNumber: doctorData.licenseNumber,
            qualifications: doctorData.qualifications,
            experienceYears: doctorData.experienceYears,
            consultationFee: doctorData.consultationFee,
            biography: doctorData.biography,
            city: doctorData.city,
            isAvailable: true,
            rating: doctorData.rating,
          },
        },
      },
      include: {
        doctor: true,
      },
    })
    doctors.push(user)
  }

  console.log(`✅ Created ${doctors.length} doctors`)

  // ==========================================
  // 4. CREATE DOCTOR AVAILABILITY
  // ==========================================
  for (const doctor of doctors) {
    // Monday to Friday: 9 AM - 5 PM
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.doctor!.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
        },
      })
    }

    // Saturday: 9 AM - 1 PM
    await prisma.doctorAvailability.create({
      data: {
        doctorId: doctor.doctor!.id,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '13:00',
        slotDuration: 30,
      },
    })
  }

  console.log('✅ Created doctor availability schedules')

  // ==========================================
  // 5. CREATE APPOINTMENTS
  // ==========================================
  const now = new Date()
  const appointments = []

  // Past completed appointments
  for (let i = 0; i < 10; i++) {
    const patient = patients[i % patients.length]
    const doctor = doctors[i % doctors.length]
    const daysAgo = Math.floor(Math.random() * 30) + 1
    const scheduledDate = new Date(now)
    scheduledDate.setDate(scheduledDate.getDate() - daysAgo)

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.patient!.id,
        doctorId: doctor.doctor!.id,
        scheduledAt: scheduledDate,
        duration: 30,
        status: AppointmentStatus.COMPLETED,
        reason: ['Regular Checkup', 'Follow-up', 'Consultation'][i % 3],
        symptoms: ['Headache', 'Fever', 'Fatigue', 'Cough'][i % 4] ? 
          [['Headache', 'Fever', 'Fatigue', 'Cough'][i % 4]] : [],
        notes: 'Patient responded well to treatment.',
      },
    })
    appointments.push(appointment)
  }

  // Upcoming confirmed appointments
  for (let i = 0; i < 8; i++) {
    const patient = patients[i % patients.length]
    const doctor = doctors[i % doctors.length]
    const daysAhead = Math.floor(Math.random() * 14) + 1
    const scheduledDate = new Date(now)
    scheduledDate.setDate(scheduledDate.getDate() + daysAhead)
    scheduledDate.setHours(10 + (i % 6), 0, 0, 0)

    await prisma.appointment.create({
      data: {
        patientId: patient.patient!.id,
        doctorId: doctor.doctor!.id,
        scheduledAt: scheduledDate,
        duration: 30,
        status: AppointmentStatus.CONFIRMED,
        reason: 'General Consultation',
        symptoms: ['Back pain', 'Chest pain', 'Stomach ache'][i % 3] ? 
          [['Back pain', 'Chest pain', 'Stomach ache'][i % 3]] : [],
        aiRecommendation: `Recommended specialist: ${doctor.doctor!.specialization}`,
      },
    })
  }

  // Pending appointments
  for (let i = 0; i < 3; i++) {
    const patient = patients[i % patients.length]
    const doctor = doctors[i % doctors.length]
    const daysAhead = Math.floor(Math.random() * 7) + 1
    const scheduledDate = new Date(now)
    scheduledDate.setDate(scheduledDate.getDate() + daysAhead)

    await prisma.appointment.create({
      data: {
        patientId: patient.patient!.id,
        doctorId: doctor.doctor!.id,
        scheduledAt: scheduledDate,
        duration: 30,
        status: AppointmentStatus.PENDING,
        reason: 'New Consultation',
        symptoms: ['Dizziness', 'Nausea'][i % 2] ? [['Dizziness', 'Nausea'][i % 2]] : [],
      },
    })
  }

  console.log('✅ Created 21 appointments (10 completed, 8 confirmed, 3 pending)')

  // ==========================================
  // 6. CREATE PRESCRIPTIONS FOR COMPLETED APPOINTMENTS
  // ==========================================
  for (const appointment of appointments) {
    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        diagnosis: 'Common cold and fever',
        instructions: 'Take medication after meals. Drink plenty of water. Rest for 2-3 days.',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        medications: {
          create: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '5 days',
              instructions: 'Take after meals',
            },
            {
              name: 'Amoxicillin',
              dosage: '250mg',
              frequency: 'Three times daily',
              duration: '7 days',
              instructions: 'Complete the full course',
            },
          ],
        },
      },
    })
  }

  console.log('✅ Created prescriptions with medications')

  // ==========================================
  // 7. CREATE MEDICAL RECORDS
  // ==========================================
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i]

    // Lab Report
    await prisma.medicalRecord.create({
      data: {
        patientId: patient.patient!.id,
        recordType: 'Lab Report',
        title: 'Complete Blood Count (CBC)',
        description: 'Routine blood test results',
        fileUrl: 'https://example.com/records/cbc-report.pdf',
        fileType: 'application/pdf',
        recordDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        aiSummary: 'All parameters within normal range. Hemoglobin: 14.2 g/dL, WBC: 7500/μL',
      },
    })

    // X-Ray Report
    await prisma.medicalRecord.create({
      data: {
        patientId: patient.patient!.id,
        recordType: 'Imaging',
        title: 'Chest X-Ray',
        description: 'Chest X-ray for respiratory evaluation',
        fileUrl: 'https://example.com/records/xray-chest.jpg',
        fileType: 'image/jpeg',
        recordDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        aiSummary: 'No active pulmonary disease detected. Heart size normal.',
      },
    })
  }

  console.log('✅ Created medical records for all patients')

  // ==========================================
  // 8. CREATE AUDIT LOGS
  // ==========================================
  for (let i = 0; i < 20; i++) {
    const user = [...patients, ...doctors, admin][i % (patients.length + doctors.length + 1)]
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: ['VIEW', 'CREATE', 'UPDATE'][i % 3],
        resource: ['Appointment', 'MedicalRecord', 'Prescription'][i % 3],
        resourceId: `resource-${i}`,
        ipAddress: `192.168.1.${100 + i}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(Date.now() - (i * 3600000)), // i hours ago
      },
    })
  }

  console.log('✅ Created audit logs')

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n🎉 Database seeding completed successfully!\n')
  console.log('📊 Summary:')
  console.log('─────────────────────────────────────')
  console.log(`👤 Users: ${patients.length + doctors.length + 1}`)
  console.log(`   - Admin: 1`)
  console.log(`   - Patients: ${patients.length}`)
  console.log(`   - Doctors: ${doctors.length}`)
  console.log(`📅 Appointments: 21`)
  console.log(`💊 Prescriptions: ${appointments.length}`)
  console.log(`📄 Medical Records: ${patients.length * 2}`)
  console.log(`📝 Audit Logs: 20`)
  console.log('─────────────────────────────────────\n')
  
  console.log('🔑 Test Credentials:')
  console.log('─────────────────────────────────────')
  console.log('Admin:')
  console.log('  Email: admin@hospital.com')
  console.log('  Password: password123\n')
  console.log('Patient:')
  console.log('  Email: john.doe@example.com')
  console.log('  Password: password123\n')
  console.log('Doctor:')
  console.log('  Email: dr.sharma@hospital.com')
  console.log('  Password: password123')
  console.log('─────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })