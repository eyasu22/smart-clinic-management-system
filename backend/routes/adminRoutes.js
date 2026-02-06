const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUser,
    getAuditLogs,
    getSettings,
    updateSettings,
    getHealthStatus,
    triggerBackup,
    broadcastEmergency
} = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

// User Management Routes
router.route('/users')
    .get(protect, admin, getUsers);

router.route('/users/:id')
    .put(protect, admin, updateUser);

// System Settings Routes (Super Admin Only)
router.route('/settings')
    .get(protect, superAdmin, getSettings)
    .put(protect, superAdmin, updateSettings);

router.route('/settings/health')
    .get(protect, superAdmin, getHealthStatus);

router.route('/settings/backup')
    .post(protect, superAdmin, triggerBackup);

router.route('/settings/broadcast')
    .post(protect, superAdmin, broadcastEmergency);

// Audit Logs
router.route('/audit-logs')
    .get(protect, admin, getAuditLogs);

module.exports = router;
