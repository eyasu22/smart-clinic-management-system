const mongoose = require('mongoose');

const clinicSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    branchCode: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    phone: String,
    email: String,
    timezone: {
        type: String,
        default: 'UTC'
    },
    workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    resources: {
        beds: { type: Number, default: 0 },
        rooms: { type: Number, default: 0 },
        equipment: [String]
    },
    settings: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

const Clinic = mongoose.model('Clinic', clinicSchema);

module.exports = Clinic;
