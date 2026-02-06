const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, updateDoctorProfile } = require('../controllers/doctorController');
const { protect, doctor } = require('../middleware/authMiddleware');

router.route('/').get(getDoctors);
router.route('/profile').post(protect, doctor, updateDoctorProfile);
router.route('/:id').get(getDoctorById);

module.exports = router;
