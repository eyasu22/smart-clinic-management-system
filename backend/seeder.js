const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
const createAdmin = async () => {
    await connectDB();
    try {
        // Check if admin exists
        const userExists = await User.findOne({ email: 'admin@clinic.com' });

        if (userExists) {
            console.log('⚠️ Admin user already exists');
            process.exit();
        }

        // Create Super Admin
        const user = await User.create({
            name: 'System Super Admin',
            email: 'superadmin@clinic.com',
            password: 'password123', // In production, use environment variable
            role: 'superAdmin',
            permissions: ['ALL_ACCESS', 'MANAGE_SYSTEM', 'MANAGE_USERS', 'VIEW_AUDIT_LOGS'],
            isActive: true
        });

        console.log('✅ Super Admin User Created Successfully!');
        console.log('📧 Email: superadmin@clinic.com');
        console.log('🔑 Password: password123');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
