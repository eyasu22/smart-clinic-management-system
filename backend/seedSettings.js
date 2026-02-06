const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SystemSettings = require('./models/SystemSettings');
const connectDB = require('./config/db');

dotenv.config();

const seedSettings = async () => {
    await connectDB();
    try {
        const settingsCount = await SystemSettings.countDocuments();

        if (settingsCount > 0) {
            console.log('⚠️ System settings already exist. Updating to ensure AI is enabled...');
            await SystemSettings.updateOne({}, {
                $set: {
                    'aiSettings.enableAI': true,
                    'roleControl.aiAccessRoles': ['doctor', 'admin', 'superAdmin', 'receptionist']
                }
            });
            console.log('✅ AI permissions updated successfully!');
        } else {
            console.log('🌱 No system settings found. Seeding initial configuration...');
            await SystemSettings.create({
                systemConfig: {
                    clinicName: 'Smart Clinic',
                    environmentMode: 'demo'
                },
                aiSettings: {
                    enableAI: true,
                    enableExplainability: true
                },
                roleControl: {
                    aiAccessRoles: ['doctor', 'admin', 'superAdmin', 'receptionist']
                }
            });
            console.log('✅ Initial system settings seeded successfully!');
        }
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

seedSettings();
