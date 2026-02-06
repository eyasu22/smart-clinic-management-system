const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    genericName: String,
    category: {
        type: String,
        enum: ['antibiotic', 'painkiller', 'vitamin', 'antiviral', 'antifungal', 'antihistamine', 'other'],
        default: 'other'
    },
    manufacturer: String,
    batchNumber: String,
    expiryDate: Date,
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    reorderLevel: {
        type: Number,
        default: 10
    },
    unitPrice: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'tablet'
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Virtual for low stock alert
medicineSchema.virtual('isLowStock').get(function () {
    return this.quantity <= this.reorderLevel;
});

// Virtual for expired
medicineSchema.virtual('isExpired').get(function () {
    return this.expiryDate && this.expiryDate < new Date();
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
