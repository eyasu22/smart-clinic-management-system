const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SystemSettings = require('./models/SystemSettings');
const connectDB = require('./config/db');

dotenv.config();

const checkSettings = async () => {
    await connectDB();
    try {
        const settings = await SystemSettings.findOne({});
        console.log('--- Current System Settings ---');
        if (settings) {
            console.log(JSON.stringify(settings, null, 2));
        } else {
            console.log('No settings found!');
        }
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

checkSettings();
