const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    resource: {
        type: String, // e.g., 'User', 'Patient', 'Appointment'
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    details: {
        type: Object, // Store JSON details of the change
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
