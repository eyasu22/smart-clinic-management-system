const mongoose = require('mongoose');

const vitalSignsSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    temperature: {
        value: Number,
        unit: { type: String, default: '°C' }
    },
    bloodPressure: {
        systolic: Number,
        diastolic: Number
    },
    heartRate: Number, // bpm
    respiratoryRate: Number, // breaths per minute
    oxygenSaturation: Number, // %
    weight: {
        value: Number,
        unit: { type: String, default: 'kg' }
    },
    height: {
        value: Number,
        unit: { type: String, default: 'cm' }
    },
    bmi: Number,
    bloodGlucose: Number, // mg/dL
    notes: String,
    recordedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Calculate BMI automatically
vitalSignsSchema.pre('save', function (next) {
    if (this.weight?.value && this.height?.value) {
        const heightInMeters = this.height.value / 100;
        this.bmi = (this.weight.value / (heightInMeters * heightInMeters)).toFixed(2);
    }
    next();
});

const VitalSigns = mongoose.model('VitalSigns', vitalSignsSchema);

module.exports = VitalSigns;
