/**
 * Demo Data Seeder for Smart Clinic Management System
 * 
 * This script creates realistic demo data for demonstrations and testing.
 * Run with: node scripts/seedDemoData.js
 * Reset with: node scripts/seedDemoData.js --reset
 * 
 * WARNING: Using --reset will delete all existing data!
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const SystemSettings = require('../models/SystemSettings');

const DEMO_PASSWORD = 'Demo@123';

// Demo Users Configuration
const demoUsers = [
    // Super Admin
    {
        name: 'System Administrator',
        email: 'superadmin@smartclinic.com',
        role: 'superAdmin',
        permissions: ['manage_system', 'manage_users', 'manage_doctors', 'manage_patients', 'manage_appointments', 'manage_billing', 'view_reports']
    },
    // Admin
    {
        name: 'Clinic Manager',
        email: 'admin@smartclinic.com',
        role: 'admin',
        permissions: ['manage_users', 'manage_doctors', 'manage_patients', 'manage_appointments', 'manage_billing', 'view_reports']
    },
    // Receptionists
    {
        name: 'Sarah Johnson',
        email: 'receptionist@smartclinic.com',
        role: 'receptionist',
        permissions: ['manage_appointments', 'view_patients', 'manage_billing']
    },
    {
        name: 'Emily Davis',
        email: 'receptionist2@smartclinic.com',
        role: 'receptionist',
        permissions: ['manage_appointments', 'view_patients']
    }
];

// Demo Doctors Configuration
const demoDoctors = [
    {
        name: 'Dr. James Wilson',
        email: 'dr.wilson@smartclinic.com',
        specialization: 'Cardiology',
        qualifications: ['MBBS', 'MD Cardiology', 'FACC'],
        experience: 15,
        licenseNumber: 'MED-2009-001234',
        consultationFee: 150,
        maxPatientsPerDay: 12,
        availability: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00' },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
            { day: 'Friday', startTime: '09:00', endTime: '15:00' }
        ]
    },
    {
        name: 'Dr. Sarah Chen',
        email: 'dr.chen@smartclinic.com',
        specialization: 'Dermatology',
        qualifications: ['MBBS', 'MD Dermatology'],
        experience: 10,
        licenseNumber: 'MED-2014-005678',
        consultationFee: 120,
        maxPatientsPerDay: 15,
        availability: [
            { day: 'Monday', startTime: '10:00', endTime: '18:00' },
            { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
            { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
            { day: 'Friday', startTime: '10:00', endTime: '16:00' },
            { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
        ]
    },
    {
        name: 'Dr. Michael Brown',
        email: 'dr.brown@smartclinic.com',
        specialization: 'Pediatrics',
        qualifications: ['MBBS', 'MD Pediatrics', 'DCH'],
        experience: 12,
        licenseNumber: 'MED-2012-003456',
        consultationFee: 100,
        maxPatientsPerDay: 20,
        availability: [
            { day: 'Monday', startTime: '08:00', endTime: '16:00' },
            { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
            { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
            { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
            { day: 'Friday', startTime: '08:00', endTime: '14:00' }
        ]
    },
    {
        name: 'Dr. Lisa Anderson',
        email: 'dr.anderson@smartclinic.com',
        specialization: 'General Medicine',
        qualifications: ['MBBS', 'MD Internal Medicine'],
        experience: 8,
        licenseNumber: 'MED-2016-007890',
        consultationFee: 80,
        maxPatientsPerDay: 25,
        availability: [
            { day: 'Monday', startTime: '09:00', endTime: '18:00' },
            { day: 'Tuesday', startTime: '09:00', endTime: '18:00' },
            { day: 'Wednesday', startTime: '09:00', endTime: '18:00' },
            { day: 'Thursday', startTime: '09:00', endTime: '18:00' },
            { day: 'Friday', startTime: '09:00', endTime: '17:00' },
            { day: 'Saturday', startTime: '09:00', endTime: '14:00' }
        ]
    }
];

// Demo Patients Configuration
const demoPatients = [
    {
        name: 'John Smith',
        email: 'john.smith@email.com',
        age: 45,
        gender: 'Male',
        bloodGroup: 'A+',
        contact: '555-0101',
        address: '123 Main Street, City',
        medicalHistory: ['Hypertension', 'Diabetes Type 2']
    },
    {
        name: 'Emma Wilson',
        email: 'emma.wilson@email.com',
        age: 32,
        gender: 'Female',
        bloodGroup: 'O+',
        contact: '555-0102',
        address: '456 Oak Avenue, City',
        medicalHistory: ['Allergies']
    },
    {
        name: 'Robert Johnson',
        email: 'robert.j@email.com',
        age: 58,
        gender: 'Male',
        bloodGroup: 'B+',
        contact: '555-0103',
        address: '789 Pine Road, City',
        medicalHistory: ['Heart Disease', 'High Cholesterol']
    },
    {
        name: 'Sophia Garcia',
        email: 'sophia.g@email.com',
        age: 28,
        gender: 'Female',
        bloodGroup: 'AB+',
        contact: '555-0104',
        address: '321 Elm Street, City',
        medicalHistory: []
    },
    {
        name: 'William Davis',
        email: 'william.d@email.com',
        age: 8,
        gender: 'Male',
        bloodGroup: 'A-',
        contact: '555-0105',
        address: '654 Cedar Lane, City',
        medicalHistory: ['Asthma']
    },
    {
        name: 'Olivia Martinez',
        email: 'olivia.m@email.com',
        age: 35,
        gender: 'Female',
        bloodGroup: 'O-',
        contact: '555-0106',
        address: '987 Birch Drive, City',
        medicalHistory: ['Thyroid']
    }
];

// Sample symptoms for appointments
const sampleSymptoms = [
    'Persistent headache for 3 days',
    'Chest pain and shortness of breath',
    'Skin rash on arms and neck',
    'High fever with body aches',
    'Chronic fatigue and weakness',
    'Child has recurring cough',
    'Dizziness and nausea',
    'Joint pain in knees',
    'Routine health checkup',
    'Follow-up for medication'
];

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Clear existing data
const clearData = async () => {
    console.log('🗑️  Clearing existing demo data...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Invoice.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await SystemSettings.deleteMany({});
    console.log('✅ Data cleared');
};

// Create hashed password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Seed demo data
const seedData = async () => {
    const hashedPassword = await hashPassword(DEMO_PASSWORD);
    const createdDoctors = [];
    const createdPatients = [];

    // 1. Create System Settings
    console.log('⚙️  Creating system settings...');
    await SystemSettings.create({
        maintenanceMode: false,
        passwordPolicy: { minLength: 8, requireUppercase: true, requireNumber: true, requireSpecial: true },
        accountLockout: { maxAttempts: 5, lockDuration: 15 },
        aiSettings: { enableAI: true, enableExplainability: true, assistiveOnly: true },
        roleControl: {
            doctorCanEditPatient: false,
            patientCanCancelConfirmed: false
        },
        auditSettings: { logLevel: 'all', retentionDays: 365 }
    });

    // 2. Create Staff Users
    console.log('👤 Creating staff users...');
    for (const user of demoUsers) {
        await User.create({
            ...user,
            password: hashedPassword,
            isActive: true,
            lastLogin: new Date()
        });
    }

    // 3. Create Doctors
    console.log('👨‍⚕️ Creating doctors...');
    for (const doc of demoDoctors) {
        const user = await User.create({
            name: doc.name,
            email: doc.email,
            password: hashedPassword,
            role: 'doctor',
            permissions: ['view_appointments', 'update_appointments', 'view_patients'],
            isActive: true,
            lastLogin: new Date()
        });

        const doctor = await Doctor.create({
            user: user._id,
            specialization: doc.specialization,
            qualifications: doc.qualifications,
            experience: doc.experience,
            licenseNumber: doc.licenseNumber,
            consultationFee: doc.consultationFee,
            maxPatientsPerDay: doc.maxPatientsPerDay,
            availability: doc.availability,
            currentLoad: 0
        });

        createdDoctors.push({ user, doctor });
    }

    // 4. Create Patients
    console.log('🧑 Creating patients...');
    for (const pat of demoPatients) {
        const user = await User.create({
            name: pat.name,
            email: pat.email,
            password: hashedPassword,
            role: 'patient',
            isActive: true
        });

        const patient = await Patient.create({
            user: user._id,
            name: pat.name,
            age: pat.age,
            gender: pat.gender,
            bloodGroup: pat.bloodGroup,
            contact: { phone: pat.contact },
            address: pat.address,
            medicalHistory: pat.medicalHistory
        });

        createdPatients.push({ user, patient });
    }

    // 5. Create Appointments
    console.log('📅 Creating appointments...');
    const today = new Date();
    const appointmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    for (let i = 0; i < 20; i++) {
        const randomDoctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
        const randomPatient = createdPatients[Math.floor(Math.random() * createdPatients.length)];

        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + Math.floor(Math.random() * 14) - 7); // -7 to +7 days

        const hours = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
        const minutes = Math.random() > 0.5 ? '00' : '30';

        const status = appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)];

        const appointment = await Appointment.create({
            doctor: randomDoctor.doctor._id,
            patient: randomPatient.patient._id,
            date: appointmentDate.toISOString().split('T')[0],
            time: `${String(hours).padStart(2, '0')}:${minutes}`,
            symptoms: sampleSymptoms[Math.floor(Math.random() * sampleSymptoms.length)],
            status,
            diagnosis: status === 'completed' ? 'Routine examination completed. All vitals normal.' : undefined,
            visitNotes: status === 'completed' ? 'Patient responded well to treatment. Follow-up in 2 weeks recommended.' : undefined
        });

        // Create invoice for completed appointments
        if (status === 'completed') {
            const invoice = await Invoice.create({
                patient: randomPatient.patient._id,
                appointment: appointment._id,
                doctor: randomDoctor.doctor._id,
                items: [{
                    description: `Consultation - ${randomDoctor.doctor.specialization}`,
                    quantity: 1,
                    unitPrice: randomDoctor.doctor.consultationFee,
                    total: randomDoctor.doctor.consultationFee
                }],
                subtotal: randomDoctor.doctor.consultationFee,
                tax: randomDoctor.doctor.consultationFee * 0.05,
                discount: 0,
                total: randomDoctor.doctor.consultationFee * 1.05,
                status: Math.random() > 0.3 ? 'paid' : 'pending',
                paymentMethod: 'cash',
                paidAmount: Math.random() > 0.3 ? randomDoctor.doctor.consultationFee * 1.05 : 0,
                paidAt: Math.random() > 0.3 ? new Date() : undefined
            });
        }
    }

    // 6. Create Sample Notifications
    console.log('🔔 Creating notifications...');
    for (const { user, patient } of createdPatients.slice(0, 3)) {
        await Notification.create({
            user: user._id,
            type: 'APPOINTMENT',
            message: 'Your upcoming appointment has been confirmed.',
            read: false
        });
    }

    // 7. Create Initial Audit Log
    console.log('📝 Creating audit logs...');
    const adminUser = await User.findOne({ role: 'superAdmin' });
    await AuditLog.create({
        user: adminUser._id,
        action: 'SYSTEM_INIT',
        resource: 'System',
        details: { message: 'Demo data seeded successfully' }
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('─'.repeat(40));
    console.log(`Super Admin: superadmin@smartclinic.com`);
    console.log(`Admin:       admin@smartclinic.com`);
    console.log(`Receptionist: receptionist@smartclinic.com`);
    console.log(`Doctors:     dr.wilson@smartclinic.com`);
    console.log(`             dr.chen@smartclinic.com`);
    console.log(`             dr.brown@smartclinic.com`);
    console.log(`             dr.anderson@smartclinic.com`);
    console.log(`Patients:    john.smith@email.com`);
    console.log(`             emma.wilson@email.com`);
    console.log(`─`.repeat(40));
    console.log(`Password for ALL accounts: ${DEMO_PASSWORD}`);
    console.log('='.repeat(60) + '\n');
};

// Main execution
const run = async () => {
    await connectDB();

    const args = process.argv.slice(2);
    const isReset = args.includes('--reset');

    if (isReset) {
        console.log('\n⚠️  WARNING: This will DELETE all existing data!');
        console.log('Proceeding in 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await clearData();
    }

    await seedData();
    process.exit(0);
};

run().catch(err => {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
});
