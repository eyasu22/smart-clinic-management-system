const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const SystemSettings = require('../models/SystemSettings');
const generateToken = require('../utils/generateToken');

// Helper to create audit log
const logAction = async (userId, action, resource, resourceId, details, req) => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            resource,
            resourceId,
            details,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

// @desc    Get all users (paginated)
const getUsers = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                $or: [
                    { name: { $regex: req.query.keyword, $options: 'i' } },
                    { email: { $regex: req.query.keyword, $options: 'i' } },
                ],
            }
            : {};

        const count = await User.countDocuments({ ...keyword });
        const users = await User.find({ ...keyword })
            .select('-password')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ users, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user details (Role/Permissions)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.role) user.role = req.body.role;
            if (req.body.permissions) user.permissions = req.body.permissions;
            if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

            const updatedUser = await user.save();
            await logAction(req.user._id, 'UPDATE', 'User', user._id, req.body, req);
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Audit Logs
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({})
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/SuperAdmin
const getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/SuperAdmin
const updateSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        settings.lastUpdatedBy = req.user._id;
        const updatedSettings = await settings.save();

        await logAction(req.user._id, 'UPDATE', 'SystemSettings', updatedSettings._id, req.body, req);
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system health status
// @route   GET /api/admin/settings/health
// @access  Private/SuperAdmin
const getHealthStatus = async (req, res) => {
    try {
        // Mock health data for demo, in real world check DB connection, disk, memory
        res.json({
            status: 'healthy',
            uptime: process.uptime(),
            database: 'connected',
            memory: process.memoryUsage().heapUsed,
            lastBackup: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Trigger system backup
// @route   POST /api/admin/settings/backup
// @access  Private/SuperAdmin
const triggerBackup = async (req, res) => {
    try {
        await logAction(req.user._id, 'BACKUP', 'System', null, { type: 'manual' }, req);
        res.json({
            message: 'Backup triggered successfully',
            backupId: 'BK-' + Date.now()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Broadcast emergency message
// @route   POST /api/admin/settings/broadcast
// @access  Private/SuperAdmin
const broadcastEmergency = async (req, res) => {
    try {
        const { message } = req.body;
        // In real app, this would use WebSockets (Socket.io)
        await SystemSettings.findOneAndUpdate({}, {
            'notifications.emergencyBroadcast': message
        });

        await logAction(req.user._id, 'BROADCAST', 'System', null, { message }, req);
        res.json({ message: 'Emergency broadcast sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    updateUser,
    getAuditLogs,
    getSettings,
    updateSettings,
    getHealthStatus,
    triggerBackup,
    broadcastEmergency
};
