const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const checkUsers = async () => {
    await connectDB();
    try {
        const users = await User.find({}, 'email role name');
        console.log('--- Current Users ---');
        console.log(JSON.stringify(users, null, 2));
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

checkUsers();
