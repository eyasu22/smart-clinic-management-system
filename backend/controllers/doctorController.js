const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).populate('user', 'name email profileImage');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('user', 'name email profileImage');
        if (doctor) {
            res.json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Update doctor profile
// @route   POST /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res) => {
    try {
        // Check if doctor profile already exists for this user
        let doctor = await Doctor.findOne({ user: req.user._id });

        const { specialization, qualifications, experience, consultationFee, availability, maxPatientsPerDay } = req.body;

        if (doctor) {
            // Update
            doctor.specialization = specialization || doctor.specialization;
            doctor.qualifications = qualifications || doctor.qualifications;
            doctor.experience = experience || doctor.experience;
            doctor.consultationFee = consultationFee || doctor.consultationFee;
            doctor.availability = availability || doctor.availability;
            doctor.maxPatientsPerDay = maxPatientsPerDay || doctor.maxPatientsPerDay;

            const updatedDoctor = await doctor.save();
            res.json(updatedDoctor);
        } else {
            // Create new
            doctor = new Doctor({
                user: req.user._id,
                specialization,
                qualifications,
                experience,
                consultationFee,
                availability,
                maxPatientsPerDay
            });
            const createdDoctor = await doctor.save();
            res.status(201).json(createdDoctor);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDoctors, getDoctorById, updateDoctorProfile };
