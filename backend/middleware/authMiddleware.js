const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

/**
 * Core authentication middleware - validates JWT token
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check if user account is active
            if (!req.user.isActive) {
                return res.status(403).json({ message: 'Account is deactivated. Contact administrator.' });
            }

            // Check if account is locked
            if (req.user.lockUntil && req.user.lockUntil > Date.now()) {
                return res.status(403).json({ message: 'Account is temporarily locked. Try again later.' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Maintenance mode check - blocks non-super-admin access during maintenance
 */
const checkMaintenanceMode = async (req, res, next) => {
    try {
        const settings = await SystemSettings.findOne({});
        if (settings?.systemConfig?.maintenanceMode && req.user?.role !== 'superAdmin') {
            return res.status(503).json({
                message: 'System is under maintenance. Please try again later.',
                maintenanceMode: true
            });
        }
        next();
    } catch (error) {
        next(); // If settings fetch fails, allow request to proceed
    }
};

/**
 * Admin middleware - allows admin and superAdmin
 */
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superAdmin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

/**
 * Super Admin ONLY middleware - strict super admin access
 */
const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superAdmin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as super admin' });
    }
};

/**
 * Admin ONLY middleware (excludes super admin for operational tasks)
 * Super Admin should only manage system settings, not clinic operations
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else if (req.user && req.user.role === 'superAdmin') {
        // Super admin can still access but log a warning
        console.warn(`SuperAdmin ${req.user.email} accessing admin-level operation`);
        next();
    } else {
        res.status(403).json({ message: 'Not authorized. Admin access required.' });
    }
};

/**
 * Permission-based access control
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (req.user && (
            req.user.role === 'superAdmin' ||
            (req.user.permissions && req.user.permissions.includes(permission))
        )) {
            next();
        } else {
            res.status(403).json({ message: `Not authorized. Requires permission: ${permission}` });
        }
    };
};

/**
 * Doctor middleware - allows doctors and higher roles
 */
const doctor = (req, res, next) => {
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin' || req.user.role === 'superAdmin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a doctor' });
    }
};

/**
 * Doctor ONLY middleware - strict doctor access (no admin escalation)
 */
const doctorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'doctor') {
        next();
    } else {
        res.status(403).json({ message: 'This action is restricted to doctors only' });
    }
};

/**
 * Receptionist middleware - allows receptionist and higher roles
 * Scope: Registration, booking, check-in ONLY
 */
const receptionist = (req, res, next) => {
    if (req.user && (req.user.role === 'receptionist' || req.user.role === 'admin' || req.user.role === 'superAdmin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a receptionist' });
    }
};

/**
 * Receptionist ONLY middleware - no access to clinical or billing details
 */
const receptionistOnly = (req, res, next) => {
    if (req.user && req.user.role === 'receptionist') {
        next();
    } else {
        res.status(403).json({ message: 'This action is restricted to receptionists only' });
    }
};

/**
 * Patient middleware - patient access only
 */
const patient = (req, res, next) => {
    if (req.user && req.user.role === 'patient') {
        next();
    } else {
        res.status(403).json({ message: 'This action is restricted to patients only' });
    }
};

/**
 * Patient or higher middleware - patient can access, staff gets elevated access
 */
const patientOrStaff = (req, res, next) => {
    const allowedRoles = ['patient', 'receptionist', 'doctor', 'admin', 'superAdmin'];
    if (req.user && allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized' });
    }
};

/**
 * Clinical staff middleware - doctors and nurses only (no receptionist)
 */
const clinicalStaff = (req, res, next) => {
    const clinicalRoles = ['doctor', 'nurse', 'admin', 'superAdmin'];
    if (req.user && clinicalRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized. Clinical staff access required.' });
    }
};

/**
 * Billing staff middleware - receptionist, admin can handle billing
 * Doctors can only view billing, not modify
 */
const billingAccess = (req, res, next) => {
    const billingRoles = ['receptionist', 'admin', 'superAdmin'];
    if (req.user && billingRoles.includes(req.user.role)) {
        req.canModifyBilling = true;
        next();
    } else if (req.user && req.user.role === 'doctor') {
        req.canModifyBilling = false; // Read-only for doctors
        next();
    } else {
        res.status(403).json({ message: 'Not authorized for billing operations' });
    }
};

/**
 * Prevent privilege escalation - users cannot assign roles higher than their own
 */
const preventPrivilegeEscalation = (req, res, next) => {
    const roleHierarchy = {
        'patient': 1,
        'receptionist': 2,
        'nurse': 2,
        'doctor': 3,
        'admin': 4,
        'superAdmin': 5
    };

    const requestedRole = req.body?.role;
    if (!requestedRole) {
        return next(); // No role change requested
    }

    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const requestedRoleLevel = roleHierarchy[requestedRole] || 0;

    // Only superAdmin can create admin accounts
    if (requestedRole === 'admin' && req.user.role !== 'superAdmin') {
        return res.status(403).json({ message: 'Only Super Admin can create Admin accounts' });
    }

    // Cannot assign role higher than own
    if (requestedRoleLevel > userRoleLevel) {
        return res.status(403).json({
            message: 'Cannot assign a role with higher privileges than your own'
        });
    }

    next();
};

/**
 * AI Access control - checks if user's role has AI access enabled
 */
const checkAIAccess = async (req, res, next) => {
    try {
        const settings = await SystemSettings.findOne({});

        if (!settings) {
            console.warn('AI Access Check: No system settings found in database.');
            return res.status(403).json({
                message: 'System settings not initialized. Contact admin.',
                aiDisabled: true
            });
        }

        // Check if AI is globally enabled
        if (!settings?.aiSettings?.enableAI) {
            console.warn(`AI Access Check: AI is globally disabled. User: ${req.user.email}`);
            return res.status(403).json({
                message: 'AI features are currently disabled in system settings',
                aiDisabled: true
            });
        }

        // Check if user's role has AI access
        const aiAccessRoles = settings?.roleControl?.aiAccessRoles || ['doctor', 'admin', 'superAdmin'];
        if (!aiAccessRoles.includes(req.user.role)) {
            console.warn(`AI Access Check: Role ${req.user.role} denied access. Authorized roles: ${aiAccessRoles.join(', ')}`);
            return res.status(403).json({
                message: `AI features are not enabled for your role (${req.user.role})`,
                aiAccessDenied: true
            });
        }

        // Attach AI settings to request for use in controllers
        req.aiSettings = settings.aiSettings;
        next();
    } catch (error) {
        console.error('AI access check error:', error);
        next(); // Allow if settings fetch fails
    }
};

/**
 * Audit logging helper - to be called in controllers
 */
const createAuditLog = async (userId, action, resource, resourceId, details, req) => {
    try {
        const AuditLog = require('../models/AuditLog');
        await AuditLog.create({
            user: userId,
            action,
            resource,
            resourceId,
            details,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent')
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

module.exports = {
    protect,
    checkMaintenanceMode,
    admin,
    adminOnly,
    superAdmin,
    checkPermission,
    doctor,
    doctorOnly,
    receptionist,
    receptionistOnly,
    patient,
    patientOrStaff,
    clinicalStaff,
    billingAccess,
    preventPrivilegeEscalation,
    checkAIAccess,
    createAuditLog
};
