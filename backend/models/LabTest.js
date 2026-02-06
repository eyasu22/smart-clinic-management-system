const mongoose = require('mongoose');

const labTestSchema = mongoose.Schema({
    testNumber: {
        type: String,
        unique: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    testType: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['blood', 'urine', 'xray', 'mri', 'ct_scan', 'ultrasound', 'ecg', 'biopsy', 'other'],
        default: 'other'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'sample_collected', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['routine', 'urgent', 'stat'],
        default: 'routine'
    },
    results: {
        type: String // Text results
    },
    attachments: [{
        filename: String,
        url: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    completedAt: Date,
    technician: String,
    notes: String,
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    isCritical: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Auto-generate test number
labTestSchema.pre('save', async function (next) {
    if (!this.testNumber) {
        const count = await this.constructor.countDocuments();
        this.testNumber = `LAB-${Date.now()}-${count + 1}`;
    }
    next();
});

const LabTest = mongoose.model('LabTest', labTestSchema);

module.exports = LabTest;
