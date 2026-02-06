const mongoose = require('mongoose');

const prescriptionSchema = mongoose.Schema({
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
    medicines: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine'
        },
        name: String, // Store name in case medicine is deleted
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        quantity: { type: Number, required: true },
        dispensed: { type: Boolean, default: false },
        dispensedAt: Date,
        dispensedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'partially_dispensed', 'dispensed', 'cancelled'],
        default: 'pending'
    },
    notes: String,
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    }
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
