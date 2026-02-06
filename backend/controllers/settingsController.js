const SystemSettings = require('../models/SystemSettings');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/SuperAdmin
const getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();

        // If no settings exist, create default
        if (!settings) {
            settings = await SystemSettings.create({
                lastUpdatedBy: req.user._id
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/SuperAdmin
const updateSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();

        if (!settings) {
            settings = new SystemSettings();
        }

        // Update all provided fields
        const updateFields = [
            'systemConfig',
            'security',
            'roleControl',
            'audit',
            'dataManagement',
            'aiSettings',
            'notifications',
            'monitoring',
            'governance'
        ];

        updateFields.forEach(field => {
            if (req.body[field]) {
                settings[field] = { ...settings[field], ...req.body[field] };
            }
        });

        settings.lastUpdatedBy = req.user._id;
        await settings.save();

        res.json({
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Trigger manual backup (simulation)
// @route   POST /api/admin/settings/backup
// @access  Private/SuperAdmin
const triggerBackup = async (req, res) => {
    try {
        // In production, this would trigger actual backup logic
        // For now, we simulate it
        const backupId = `backup_${Date.now()}`;

        res.json({
            message: 'Backup initiated successfully',
            backupId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system health status
// @route   GET /api/admin/settings/health
// @access  Private/SuperAdmin
const getSystemHealth = async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: 'connected',
            timestamp: new Date().toISOString()
        };

        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            message: error.message
        });
    }
};

// @desc    Broadcast emergency message
// @route   POST /api/admin/settings/broadcast
// @access  Private/SuperAdmin
const broadcastEmergency = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Store in settings
        let settings = await SystemSettings.findOne();
        if (settings) {
            settings.notifications.emergencyBroadcast = message;
            await settings.save();
        }

        // Send to all active users
        const users = await User.find({ isActive: true }).select('_id');

        const notifications = users.map(user => ({
            user: user._id,
            type: 'SYSTEM',
            message: `⚠️ EMERGENCY: ${message}`,
            link: '#'
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.json({
            message: 'Emergency broadcast sent successfully',
            recipients: users.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemSettings,
    updateSystemSettings,
    triggerBackup,
    getSystemHealth,
    broadcastEmergency
};
