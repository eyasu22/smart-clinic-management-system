const mongoose = require('mongoose');

const systemSettingsSchema = mongoose.Schema({
    // System Configuration
    systemConfig: {
        clinicName: { type: String, default: 'Smart Clinic' },
        maintenanceMode: { type: Boolean, default: false },
        defaultLanguage: { type: String, default: 'en' },
        timezone: { type: String, default: 'UTC' },
        workingHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '17:00' }
        },
        environmentMode: { type: String, enum: ['production', 'demo'], default: 'production' },
        localization: {
            useEthiopianCalendar: { type: Boolean, default: true },
            dateFormat: { type: String, default: 'DD/MM/YYYY' },
            primaryLanguage: { type: String, default: 'Amharic' }
        }
    },

    // Security & Authentication
    security: {
        passwordPolicy: {
            minLength: { type: Number, default: 8 },
            requireUppercase: { type: Boolean, default: true },
            requireNumbers: { type: Boolean, default: true },
            requireSymbols: { type: Boolean, default: false }
        },
        accountLockout: {
            maxAttempts: { type: Number, default: 5 },
            lockDuration: { type: Number, default: 30 } // minutes
        },
        jwtExpiration: { type: Number, default: 24 }, // hours
        refreshTokenRotation: { type: Boolean, default: true },
        forcePasswordChangeOnFirstLogin: { type: Boolean, default: true },
        ipWhitelist: [{ type: String }],
        ipBlacklist: [{ type: String }],
        multiDeviceLogin: { type: Boolean, default: true },
        twoFactorAuth: { type: Boolean, default: false }
    },

    // Role & Permission Control
    roleControl: {
        enabledRoles: {
            superAdmin: { type: Boolean, default: true },
            admin: { type: Boolean, default: true },
            receptionist: { type: Boolean, default: true },
            doctor: { type: Boolean, default: true },
            patient: { type: Boolean, default: true }
        },
        restrictAdminCreation: { type: Boolean, default: true },
        restrictDoctorCreation: { type: Boolean, default: true },
        aiAccessRoles: [{ type: String, default: ['doctor', 'admin', 'superAdmin'] }]
    },

    // Audit & Compliance
    audit: {
        enableAuditLogging: { type: Boolean, default: true },
        logRetentionDays: { type: Number, default: 90 },
        complianceMode: { type: String, enum: ['none', 'hipaa', 'gdpr'], default: 'none' }
    },

    // Data Management
    dataManagement: {
        backupFrequency: { type: String, enum: ['daily', 'weekly'], default: 'weekly' },
        backupRetentionDays: { type: Number, default: 30 },
        softDelete: { type: Boolean, default: true },
        anonymizeDeletedPatients: { type: Boolean, default: true }
    },

    // AI & Intelligence
    aiSettings: {
        enableAI: { type: Boolean, default: true },
        recommendationSensitivity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        enableExplainability: { type: Boolean, default: true },
        assistiveOnly: { type: Boolean, default: true } // AI cannot make final decisions
    },

    // Notification System
    notifications: {
        enableInApp: { type: Boolean, default: true },
        enableEmail: { type: Boolean, default: true },
        enableSMS: { type: Boolean, default: false },
        rateLimit: { type: Number, default: 100 }, // per hour
        emergencyBroadcast: { type: String, default: '' }
    },

    // System Health & Monitoring
    monitoring: {
        enableHealthChecks: { type: Boolean, default: true },
        enablePerformanceAlerts: { type: Boolean, default: true },
        autoRestartOnFailure: { type: Boolean, default: false }
    },

    // Approval & Governance
    governance: {
        requireApprovalForDoctorRegistration: { type: Boolean, default: true },
        requireApprovalForCriticalActions: { type: Boolean, default: true },
        dataAccessLogging: { type: Boolean, default: true }
    },

    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

module.exports = SystemSettings;
