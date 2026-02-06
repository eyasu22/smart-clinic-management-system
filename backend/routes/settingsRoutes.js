const express = require('express');
const router = express.Router();
const {
    getSystemSettings,
    updateSystemSettings,
    triggerBackup,
    getSystemHealth,
    broadcastEmergency
} = require('../controllers/settingsController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

// All routes require Super Admin access
router.use(protect, superAdmin);

router.route('/')
    .get(getSystemSettings)
    .put(updateSystemSettings);

router.post('/backup', triggerBackup);
router.get('/health', getSystemHealth);
router.post('/broadcast', broadcastEmergency);

module.exports = router;
