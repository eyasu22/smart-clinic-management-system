const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    qualifications: [{ type: String }],
    experience: { type: Number, default: 0 },
    licenseNumber: { type: String, required: true, unique: true },
    consultationFee: { type: Number, default: 0 },
    // Availability slots for scheduling
    maxPatientsPerDay: { type: Number, default: 20 },
    currentLoad: { type: Number, default: 0 },
    availability: [{
        day: { type: String }, // e.g., 'Monday'
        startTime: { type: String }, // e.g., '09:00'
        endTime: { type: String }, // e.g., '17:00'
    }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
