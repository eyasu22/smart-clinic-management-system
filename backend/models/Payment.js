const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['cash', 'card', 'stripe', 'paypal', 'bank_transfer', 'insurance', 'telebirr', 'cbe_birr', 'mpesa', 'other'],
        required: true
    },
    gatewayTransactionId: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
