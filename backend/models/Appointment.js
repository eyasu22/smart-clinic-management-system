const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:mm
    ethDate: { // Extended Ethiopian Date Info
        day: Number,
        month: Number,
        year: Number,
        monthName: String,
        display: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    symptoms: { type: String },
    notes: { type: String },
    diagnosis: { type: String },
    visitNotes: { type: String },
    prescription: [{
        medicine: { type: String },
        dosage: { type: String },
        duration: { type: String },
        instructions: { type: String }
    }],
    checkedInAt: { type: Date }, // For receptionist queue
    queuePosition: { type: Number }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
