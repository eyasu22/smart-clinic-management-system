const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Trim whitespace to avoid common copy-paste errors
        const connStr = process.env.MONGO_URI.trim();

        const conn = await mongoose.connect(connStr);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
