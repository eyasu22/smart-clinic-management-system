const mongoose = require('mongoose');

// Hardcoded URI to test connection independently of .env file
// Using the exact credentials you provided.
const uri = "mongodb+srv://app_admin:pass123@cluster0.h3wssa7.mongodb.net/smart_clinic?appName=Cluster0";

console.log("Attempting to connect to MongoDB Atlas...");
console.log(`URI being used: ${uri.replace('pass123', '******')}`); // Hide password in logs

mongoose.connect(uri)
    .then(() => {
        console.log("✅ SUCCESS! Connected to MongoDB Atlas.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ CONNECTION FAILED");
        console.error("Error Name:", err.name);
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);

        if (err.message.includes('bad auth')) {
            console.log("\n⚠️  DIAGNOSIS: Authentication Failed.");
            console.log("Possible reasons:");
            console.log("1. The user 'app_admin' does not exist in Database Access.");
            console.log("2. The password 'pass123' is incorrect.");
            console.log("3. The user was created in a different project in Atlas.");
        }
        process.exit(1);
    });
