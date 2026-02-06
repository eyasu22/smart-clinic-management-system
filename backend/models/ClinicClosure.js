const mongoose = require('mongoose');

const clinicClosureSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    ethDate: {
        day: Number,
        month: Number,
        year: Number,
        monthName: String,
        display: String
    },
    type: {
        type: String,
        enum: ['Holiday', 'Ceremony', 'Emergency', 'Maintenance', 'Other'],
        default: 'Holiday'
    },
    isFullDay: {
        type: Boolean,
        default: true
    },
    startTime: String, // For partial closures
    endTime: String,   // For partial closures
    note: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Index for quick lookup during appointment validation
clinicClosureSchema.index({ date: 1 });

const ClinicClosure = mongoose.model('ClinicClosure', clinicClosureSchema);

module.exports = ClinicClosure;
