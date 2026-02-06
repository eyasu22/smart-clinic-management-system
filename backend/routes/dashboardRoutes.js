const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAppointmentTrends,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    broadcastNotification
} = require('../controllers/dashboardController');
const { protect, admin, checkMaintenanceMode } = require('../middleware/authMiddleware');

// Apply protection to all dashboard routes
router.use(protect);
router.use(checkMaintenanceMode);

// Main dashboard stats (role-specific)
router.get('/stats', getDashboardStats);

// Appointment trends (Admin)
router.get('/appointment-trends', admin, getAppointmentTrends);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);
router.post('/notifications/broadcast', admin, broadcastNotification);

module.exports = router;

