const express = require('express');
const router = express.Router();
const {
    summarizeNotes,
    optimizeSchedule,
    analyzePatientHistory,
    detectSecurityRisks,
    smartSearch,
    recommendPatients
} = require('../controllers/aiController');
const {
    protect,
    doctor,
    admin,
    receptionist,
    checkAIAccess,
    checkMaintenanceMode
} = require('../middleware/authMiddleware');

// Apply protection and AI access check to all AI routes
router.use(protect);
router.use(checkMaintenanceMode);
router.use(checkAIAccess);

// Doctor AI Tools
router.post('/summarize-notes', doctor, summarizeNotes);
router.post('/patient-insights', doctor, analyzePatientHistory);
router.get('/recommend-patients', doctor, recommendPatients);

// Schedule Optimization (Admin/Receptionist)
router.post('/analyze-schedule', receptionist, optimizeSchedule);

// Security Analysis (Admin/SuperAdmin)
router.get('/security-alerts', admin, detectSecurityRisks);

// Universal Smart Search (Authenticated Staff with AI access)
router.get('/smart-search', smartSearch);

module.exports = router;

