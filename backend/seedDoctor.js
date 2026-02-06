const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const createSampleDoctor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if a doctor user already exists
        let doctorUser = await User.findOne({ email: 'doctor@clinic.com' });

        if (!doctorUser) {
            // Create a doctor user
            doctorUser = await User.create({
                name: 'Dr. Sarah Johnson',
                email: 'doctor@clinic.com',
                password: 'doctor123', // Will be hashed automatically
                role: 'doctor',
                isActive: true
            });
            console.log('✅ Doctor user created:', doctorUser.email);
        } else {
            console.log('ℹ️  Doctor user already exists:', doctorUser.email);
        }

        // Check if doctor profile exists
        let doctorProfile = await Doctor.findOne({ user: doctorUser._id });

        if (!doctorProfile) {
            // Create doctor profile
            doctorProfile = await Doctor.create({
                user: doctorUser._id,
                specialization: 'General Physician',
                licenseNumber: 'MD-12345',
                qualifications: ['MBBS', 'MD General Medicine'],
                experience: 8,
                consultationFee: 500,
                maxPatientsPerDay: 20,
                currentLoad: 0,
                availability: [
                    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
                    { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
                    { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
                    { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
                    { day: 'Friday', startTime: '09:00', endTime: '17:00' }
                ]
            });
            console.log('✅ Doctor profile created for:', doctorUser.name);
        } else {
            console.log('ℹ️  Doctor profile already exists');
        }

        console.log('\n📋 Sample Doctor Credentials:');
        console.log('Email: doctor@clinic.com');
        console.log('Password: doctor123');
        console.log('Specialization:', doctorProfile.specialization);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createSampleDoctor();
