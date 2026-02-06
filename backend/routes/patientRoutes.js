const express = require('express');
const router = express.Router();
const {
    getPatients,
    createPatient,
    getPatientById,
    updatePatient,
    deletePatient,
    getPatientProfile,
} = require('../controllers/patientController');
const { protect, admin, doctor, receptionist } = require('../middleware/authMiddleware');

router.get('/profile', protect, getPatientProfile);

// Patients managed by Admins, Doctors, and Receptionists
router.route('/')
    .get(protect, receptionist, getPatients)
    .post(protect, createPatient);

router.route('/:id')
    .get(protect, receptionist, getPatientById)
    .put(protect, receptionist, updatePatient)
    .delete(protect, admin, deletePatient); // Only Admin deletes records

module.exports = router;
