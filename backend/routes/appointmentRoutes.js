const express = require('express');
const router = express.Router();
const {
    getAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableSlots,
    getDoctorsBySpecialty,
    checkInAppointment
} = require('../controllers/appointmentController');
const {
    protect,
    receptionist,
    doctor,
    checkMaintenanceMode
} = require('../middleware/authMiddleware');

// Apply maintenance mode check to all appointment routes
router.use(protect);
router.use(checkMaintenanceMode);

// Helper endpoints for booking
router.get('/available-slots', getAvailableSlots);
router.get('/doctors-by-specialty', getDoctorsBySpecialty);

// Main appointment routes
router.route('/')
    .get(getAppointments) // Filtered by role automatically
    .post(createAppointment); // Patients or Staff books

router.route('/:id')
    .put(receptionist, updateAppointment); // Receptionist/Doctors update status/notes

router.route('/:id/cancel')
    .put(cancelAppointment); // Patient cancels own (validated in controller)

// Clinical update route (doctor only for diagnosis/prescription)
router.route('/:id/clinical')
    .put(doctor, updateAppointment);

router.route('/:id/check-in')
    .put(receptionist, checkInAppointment);

module.exports = router;

