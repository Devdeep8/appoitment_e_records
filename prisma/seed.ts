// prisma/seed.ts
import { PrismaClient, UserRole, AppointmentStatus } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.medication.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.timeSlot.deleteMany()
  await prisma.doctorSpecialty.deleteMany()
  await prisma.locationSpecialtyTimeSlotCache.deleteMany()
  await prisma.locationSpecialtyCache.deleteMany()
  await prisma.review.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.specialty.deleteMany()
  await prisma.location.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()

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
  // 2. CREATE LOCATIONS
  // ==========================================
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        latitude: 19.0760,
        longitude: 72.8777,
      },
    }),
    prisma.location.create({
      data: {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.7041,
        longitude: 77.1025,
      },
    }),
    prisma.location.create({
      data: {
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        latitude: 12.9716,
        longitude: 77.5946,
      },
    }),
    prisma.location.create({
      data: {
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        latitude: 17.3850,
        longitude: 78.4867,
      },
    }),
    prisma.location.create({
      data: {
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        latitude: 13.0827,
        longitude: 80.2707,
      },
    }),
    prisma.location.create({
      data: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        latitude: 18.5204,
        longitude: 73.8567,
      },
    }),
    prisma.location.create({
      data: {
        city: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        latitude: 22.5726,
        longitude: 88.3639,
      },
    }),
    prisma.location.create({
      data: {
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        latitude: 23.0225,
        longitude: 72.5714,
      },
    }),
  ])

  console.log(`✅ Created ${locations.length} locations`)

  // ==========================================
  // 3. CREATE SPECIALTIES
  // ==========================================
  const specialties = await Promise.all([
    prisma.specialty.create({
      data: {
        name: 'Cardiology',
        description: 'Heart and cardiovascular system specialist',
        icon: '❤️',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Dermatology',
        description: 'Skin, hair, and nail specialist',
        icon: '🧴',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Orthopedics',
        description: 'Bones, joints, and muscles specialist',
        icon: '🦴',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Pediatrics',
        description: 'Children health specialist',
        icon: '👶',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Neurology',
        description: 'Brain and nervous system specialist',
        icon: '🧠',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Gynecology',
        description: 'Female reproductive system specialist',
        icon: '👩',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Ophthalmology',
        description: 'Eye care specialist',
        icon: '👁️',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'General Medicine',
        description: 'General health and common illnesses',
        icon: '🩺',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'ENT',
        description: 'Ear, nose, and throat specialist',
        icon: '👂',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Psychiatry',
        description: 'Mental health specialist',
        icon: '🧠',
      },
    }),
  ])

  console.log(`✅ Created ${specialties.length} specialties`)

  // ==========================================
  // 4. CREATE PATIENTS (5 patients)
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
  // 5. CREATE DOCTORS (15 doctors with different specializations and locations)
  // ==========================================
  const doctorsData = [
    {
      email: 'dr.sharma@hospital.com',
      name: 'Dr. Rajesh Sharma',
      phone: '+91-9876543220',
      locationId: locations[0].id, // Mumbai
      cityName: locations[0].city,
      clinicName: 'Mumbai Heart Institute',
      licenseNumber: 'MED-CARD-001',
      qualifications: ['MBBS', 'MD Cardiology', 'FACC'],
      experienceYears: 15,
      consultationFee: 1500,
      biography: 'Senior Cardiologist with 15+ years of experience in treating heart diseases.',
      rating: 4.8,
      specialties: [specialties[0].id], // Cardiology
    },
    {
      email: 'dr.mehta@hospital.com',
      name: 'Dr. Priya Mehta',
      phone: '+91-9876543221',
      locationId: locations[1].id, // Delhi
      cityName: locations[1].city,
      clinicName: 'Delhi Skin Clinic',
      licenseNumber: 'MED-DERM-002',
      qualifications: ['MBBS', 'MD Dermatology'],
      experienceYears: 10,
      consultationFee: 1200,
      biography: 'Specialist in skin care and cosmetic dermatology.',
      rating: 4.6,
      specialties: [specialties[1].id], // Dermatology
    },
    {
      email: 'dr.patel@hospital.com',
      name: 'Dr. Anil Patel',
      phone: '+91-9876543222',
      locationId: locations[2].id, // Bangalore
      cityName: locations[2].city,
      clinicName: 'Bangalore Ortho Care',
      licenseNumber: 'MED-ORTH-003',
      qualifications: ['MBBS', 'MS Orthopedics', 'FICS'],
      experienceYears: 20,
      consultationFee: 1800,
      biography: 'Expert in joint replacement and sports injuries.',
      rating: 4.9,
      specialties: [specialties[2].id], // Orthopedics
    },
    {
      email: 'dr.singh@hospital.com',
      name: 'Dr. Kavita Singh',
      phone: '+91-9876543223',
      locationId: locations[5].id, // Pune
      cityName: locations[5].city,
      clinicName: 'Pune Child Care',
      licenseNumber: 'MED-PED-004',
      qualifications: ['MBBS', 'MD Pediatrics'],
      experienceYears: 12,
      consultationFee: 1000,
      biography: 'Child health specialist with focus on preventive care.',
      rating: 4.7,
      specialties: [specialties[3].id], // Pediatrics
    },
    {
      email: 'dr.gupta@hospital.com',
      name: 'Dr. Amit Gupta',
      phone: '+91-9876543224',
      locationId: locations[0].id, // Mumbai
      cityName: locations[0].city,
      clinicName: 'Mumbai General Clinic',
      licenseNumber: 'MED-GEN-005',
      qualifications: ['MBBS', 'MD Internal Medicine'],
      experienceYears: 8,
      consultationFee: 800,
      biography: 'General physician for common ailments and health checkups.',
      rating: 4.5,
      specialties: [specialties[7].id], // General Medicine
    },
    {
      email: 'dr.reddy@hospital.com',
      name: 'Dr. Sanjay Reddy',
      phone: '+91-9876543225',
      locationId: locations[3].id, // Hyderabad
      cityName: locations[3].city,
      clinicName: 'Hyderabad Neuro Care',
      licenseNumber: 'MED-NEUR-006',
      qualifications: ['MBBS', 'DM Neurology'],
      experienceYears: 18,
      consultationFee: 2000,
      biography: 'Neurologist specializing in brain and nerve disorders.',
      rating: 4.9,
      specialties: [specialties[4].id], // Neurology
    },
    {
      email: 'dr.iyer@hospital.com',
      name: 'Dr. Lakshmi Iyer',
      phone: '+91-9876543226',
      locationId: locations[4].id, // Chennai
      cityName: locations[4].city,
      clinicName: 'Chennai Women\'s Health',
      licenseNumber: 'MED-GYN-007',
      qualifications: ['MBBS', 'MS Gynecology'],
      experienceYears: 14,
      consultationFee: 1300,
      biography: 'Women\'s health specialist and obstetrician.',
      rating: 4.8,
      specialties: [specialties[5].id], // Gynecology
    },
    {
      email: 'dr.khan@hospital.com',
      name: 'Dr. Farhan Khan',
      phone: '+91-9876543227',
      locationId: locations[1].id, // Delhi
      cityName: locations[1].city,
      clinicName: 'Delhi Eye Center',
      licenseNumber: 'MED-OPH-008',
      qualifications: ['MBBS', 'MS Ophthalmology'],
      experienceYears: 11,
      consultationFee: 1100,
      biography: 'Eye care specialist with expertise in cataract surgery.',
      rating: 4.6,
      specialties: [specialties[6].id], // Ophthalmology
    },
    {
      email: 'dr.joshi@hospital.com',
      name: 'Dr. Anjali Joshi',
      phone: '+91-9876543228',
      locationId: locations[0].id, // Mumbai
      cityName: locations[0].city,
      clinicName: 'Mumbai ENT Clinic',
      licenseNumber: 'MED-ENT-009',
      qualifications: ['MBBS', 'MS ENT'],
      experienceYears: 9,
      consultationFee: 900,
      biography: 'Specialist in ear, nose, and throat disorders.',
      rating: 4.4,
      specialties: [specialties[8].id], // ENT
    },
    {
      email: 'dr.verma@hospital.com',
      name: 'Dr. Rohan Verma',
      phone: '+91-9876543229',
      locationId: locations[2].id, // Bangalore
      cityName: locations[2].city,
      clinicName: 'Bangalore Mental Health',
      licenseNumber: 'MED-PSY-010',
      qualifications: ['MBBS', 'MD Psychiatry'],
      experienceYears: 7,
      consultationFee: 1400,
      biography: 'Psychiatrist specializing in anxiety and depression.',
      rating: 4.7,
      specialties: [specialties[9].id], // Psychiatry
    },
    {
      email: 'dr.nair@hospital.com',
      name: 'Dr. Meera Nair',
      phone: '+91-9876543230',
      locationId: locations[4].id, // Chennai
      cityName: locations[4].city,
      clinicName: 'Chennai Heart Institute',
      licenseNumber: 'MED-CARD-011',
      qualifications: ['MBBS', 'MD Cardiology', 'DM Cardiology'],
      experienceYears: 16,
      consultationFee: 1600,
      biography: 'Interventional cardiologist with expertise in angioplasty.',
      rating: 4.9,
      specialties: [specialties[0].id], // Cardiology
    },
    {
      email: 'dr.kapoor@hospital.com',
      name: 'Dr. Vikram Kapoor',
      phone: '+91-9876543231',
      locationId: locations[5].id, // Pune
      cityName: locations[5].city,
      clinicName: 'Pune Skin & Laser',
      licenseNumber: 'MED-DERM-012',
      qualifications: ['MBBS', 'MD Dermatology', 'Fellowship in Cosmetic Dermatology'],
      experienceYears: 13,
      consultationFee: 1400,
      biography: 'Dermatologist with expertise in laser treatments.',
      rating: 4.8,
      specialties: [specialties[1].id], // Dermatology
    },
    {
      email: 'dr.desai@hospital.com',
      name: 'Dr. Pooja Desai',
      phone: '+91-9876543232',
      locationId: locations[3].id, // Hyderabad
      cityName: locations[3].city,
      clinicName: 'Hyderabad Women\'s Care',
      licenseNumber: 'MED-GYN-013',
      qualifications: ['MBBS', 'MS Gynecology', 'Fellowship in Reproductive Medicine'],
      experienceYears: 11,
      consultationFee: 1500,
      biography: 'Gynecologist specializing in infertility treatment.',
      rating: 4.7,
      specialties: [specialties[5].id], // Gynecology
    },
    {
      email: 'dr.malhotra@hospital.com',
      name: 'Dr. Arjun Malhotra',
      phone: '+91-9876543233',
      locationId: locations[6].id, // Kolkata
      cityName: locations[6].city,
      clinicName: 'Kolkata Ortho Center',
      licenseNumber: 'MED-ORTH-014',
      qualifications: ['MBBS', 'MS Orthopedics', 'MCh Orthopedics'],
      experienceYears: 22,
      consultationFee: 2000,
      biography: 'Senior orthopedic surgeon with expertise in spine surgery.',
      rating: 4.9,
      specialties: [specialties[2].id], // Orthopedics
    },
    {
      email: 'dr.pillai@hospital.com',
      name: 'Dr. Suresh Pillai',
      phone: '+91-9876543234',
      locationId: locations[7].id, // Ahmedabad
      cityName: locations[7].city,
      clinicName: 'Ahmedabad Child Care',
      licenseNumber: 'MED-PED-015',
      qualifications: ['MBBS', 'MD Pediatrics', 'Fellowship in Neonatology'],
      experienceYears: 14,
      consultationFee: 1200,
      biography: 'Pediatrician with expertise in newborn care.',
      rating: 4.8,
      specialties: [specialties[3].id], // Pediatrics
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
            licenseNumber: doctorData.licenseNumber,
            qualifications: doctorData.qualifications,
            experienceYears: doctorData.experienceYears,
            consultationFee: doctorData.consultationFee,
            biography: doctorData.biography,
            locationId: doctorData.locationId,
            cityName: doctorData.cityName,
            clinicName: doctorData.clinicName,
            isAvailable: true,
            rating: doctorData.rating,
            specialties: {
              create: doctorData.specialties.map((specialtyId, index) => ({
                specialtyId,
                isPrimary: index === 0,
              })),
            },
          },
        },
      },
      include: {
        doctor: {
          include: {
            specialties: {
              include: {
                specialty: true,
              },
            },
          },
        },
      },
    })
    doctors.push(user)
  }

  console.log(`✅ Created ${doctors.length} doctors`)

  // ==========================================
  // 6. CREATE TIME SLOTS FOR EACH DOCTOR
  // ==========================================
  for (const doctor of doctors) {
    // Monday to Friday: 9 AM - 5 PM
    for (let day = 1; day <= 5; day++) {
      await prisma.timeSlot.create({
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
    await prisma.timeSlot.create({
      data: {
        doctorId: doctor.doctor!.id,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '13:00',
        slotDuration: 30,
      },
    })
  }

  console.log('✅ Created doctor time slots')

  // ==========================================
  // 7. CREATE LOCATION-SPECIALTY CACHE
  // ==========================================
  for (const location of locations) {
    for (const specialty of specialties) {
      // Count doctors in this location with this specialty
      const doctorCount = await prisma.doctorSpecialty.count({
        where: {
          doctor: {
            locationId: location.id,
            isAvailable: true,
          },
          specialtyId: specialty.id,
        },
      })

      if (doctorCount > 0) {
        // Get min and max consultation fees
        const feeData = await prisma.doctor.findMany({
          where: {
            locationId: location.id,
            isAvailable: true,
            specialties: {
              some: {
                specialtyId: specialty.id,
              },
            },
          },
          select: {
            consultationFee: true,
            rating: true,
          },
        })

        const fees = feeData.map(d => d.consultationFee).filter(Boolean) as unknown as number[]
        const ratings = feeData.map(d => d.rating)
        const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length

        await prisma.locationSpecialtyCache.create({
          data: {
            locationId: location.id,
            specialtyId: specialty.id,
            doctorCount,
            avgRating,
            minFee: fees.length > 0 ? Math.min(...fees) : null,
            maxFee: fees.length > 0 ? Math.max(...fees) : null,
          },
        })
      }
    }
  }

  console.log('✅ Created location-specialty cache')

  // ==========================================
  // 8. CREATE LOCATION-SPECIALTY-TIMESLOT CACHE
  // ==========================================
  const timeSlots = ['morning', 'afternoon', 'evening']
  
  for (const location of locations) {
    for (const specialty of specialties) {
      for (let day = 0; day < 7; day++) {
        for (const timeSlot of timeSlots) {
          // Define time ranges
          let startTime, endTime
          
          if (timeSlot === 'morning') {
            startTime = '09:00'
            endTime = '12:00'
          } else if (timeSlot === 'afternoon') {
            startTime = '12:00'
            endTime = '17:00'
          } else {
            startTime = '17:00'
            endTime = '21:00'
          }
          
          // Count doctors available at this time
          const doctorCount = await prisma.doctor.count({
            where: {
              locationId: location.id,
              isAvailable: true,
              specialties: {
                some: {
                  specialtyId: specialty.id,
                },
              },
              timeSlots: {
                some: {
                  dayOfWeek: day,
                  startTime: { lte: startTime },
                  endTime: { gte: endTime },
                },
              },
            },
          })
          
          if (doctorCount > 0) {
            await prisma.locationSpecialtyTimeSlotCache.create({
              data: {
                locationId: location.id,
                specialtyId: specialty.id,
                dayOfWeek: day,
                timeSlot,
                doctorCount,
              },
            })
          }
        }
      }
    }
  }

  console.log('✅ Created location-specialty-timeslot cache')

  // ==========================================
  // 9. CREATE APPOINTMENTS
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
        aiRecommendation: `Recommended specialist: ${doctor.doctor!.specialties[0].specialty.name}`,
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
  // 10. CREATE PRESCRIPTIONS FOR COMPLETED APPOINTMENTS
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
  // 11. CREATE MEDICAL RECORDS
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
  // 12. CREATE REVIEWS
  // ==========================================
  for (let i = 0; i < 15; i++) {
    const patient = patients[i % patients.length]
    const doctor = doctors[i % doctors.length]
    const rating = Math.floor(Math.random() * 2) + 4 // 4-5 stars
    
    await prisma.review.create({
      data: {
        patientId: patient.patient!.id,
        doctorId: doctor.doctor!.id,
        rating,
        comment: rating === 5 
          ? 'Excellent doctor! Very knowledgeable and caring.' 
          : 'Good experience. Doctor was professional and helpful.',
      },
    })
  }

  console.log('✅ Created patient reviews')

  // ==========================================
  // 13. CREATE AUDIT LOGS
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
  // 14. UPDATE DOCTOR COUNTS IN LOCATIONS AND SPECIALTIES
  // ==========================================
  for (const location of locations) {
    const doctorCount = await prisma.doctor.count({
      where: { locationId: location.id },
    })
    
    await prisma.location.update({
      where: { id: location.id },
      data: { doctorCount },
    })
  }
  
  for (const specialty of specialties) {
    const doctorCount = await prisma.doctorSpecialty.count({
      where: { specialtyId: specialty.id },
    })
    
    await prisma.specialty.update({
      where: { id: specialty.id },
      data: { doctorCount },
    })
  }

  console.log('✅ Updated doctor counts in locations and specialties')

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
  console.log(`🏥 Locations: ${locations.length}`)
  console.log(`🩺 Specialties: ${specialties.length}`)
  console.log(`📅 Appointments: 21`)
  console.log(`💊 Prescriptions: ${appointments.length}`)
  console.log(`📄 Medical Records: ${patients.length * 2}`)
  console.log(`⭐ Reviews: 15`)
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