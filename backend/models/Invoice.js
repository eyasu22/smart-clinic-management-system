const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'insurance', 'stripe', 'paypal', 'bank_transfer', 'telebirr', 'cbe_birr', 'mpesa', 'other']
    },
    paymentReference: String,
    paidAmount: {
        type: Number,
        default: 0
    },
    paidAt: Date,
    dueDate: Date,
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Soft delete fields
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Auto-generate invoice number
invoiceSchema.pre('validate', async function (next) {
    if (!this.invoiceNumber) {
        const count = await this.constructor.countDocuments();
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Exclude soft-deleted invoices by default
invoiceSchema.pre(/^find/, function (next) {
    if (!this.getQuery().includeDeleted) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

// Check for overdue invoices
invoiceSchema.methods.checkOverdue = function () {
    if (this.status === 'pending' && this.dueDate && new Date() > this.dueDate) {
        this.status = 'overdue';
        return true;
    }
    return false;
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;

