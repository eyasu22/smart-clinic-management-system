const mongoose = require('mongoose');

const nurseSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    specialization: String,
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    assignedDoctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Nurse = mongoose.model('Nurse', nurseSchema);

module.exports = Nurse;
