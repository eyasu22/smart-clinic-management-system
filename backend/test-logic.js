const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SystemSettings = require('./models/SystemSettings');
const connectDB = require('./config/db');

dotenv.config();

const testLogic = async () => {
    await connectDB();
    try {
        const settings = await SystemSettings.findOne({});
        const user = { role: 'admin', email: 'admin@gmail.com' };

        console.log('User Role:', user.role);

        if (!settings) {
            console.log('Fails: No settings');
            return;
        }

        console.log('AI Enabled:', settings?.aiSettings?.enableAI);

        const aiAccessRoles = settings?.roleControl?.aiAccessRoles || ['doctor', 'admin', 'superAdmin'];
        console.log('AI Access Roles:', aiAccessRoles);

        const hasAccess = aiAccessRoles.includes(user.role);
        console.log('Has Access:', hasAccess);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testLogic();
