const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional link if they have an account
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String },
    bloodGroup: { type: String },
    uniqueId: { type: String, unique: true },
    medicalHistory: [{
        condition: String,
        diagnosisDate: Date,
        treatment: String
    }],
    // For QR code integration, we might just use the uniqueId string
}, { timestamps: true });

// Auto-generate uniqueId before save if not present (simple implementation)
patientSchema.pre('save', async function (next) {
    if (!this.uniqueId) {
        this.uniqueId = 'PAT-' + Math.floor(1000 + Math.random() * 9000) + '-' + Date.now().toString().slice(-4);
    }
    next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
