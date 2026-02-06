const Patient = require('../models/Patient');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
    try {
        // Implement search logic if query params exist
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const patients = await Patient.find({ ...keyword });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's patient profile
// @route   GET /api/patients/profile
// @access  Private
const getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user._id });
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res) => {
    const { name, age, gender, contact, address, bloodGroup, medicalHistory } = req.body;

    try {
        // If user is a patient, ensure they don't already have a profile
        if (req.user.role === 'patient') {
            const existingProfile = await Patient.findOne({ user: req.user._id });
            if (existingProfile) {
                return res.status(400).json({ message: 'Patient profile already exists' });
            }
        }

        const patient = new Patient({
            user: req.user._id, // Link to the logged-in user
            name,
            age,
            gender,
            contact,
            address,
            bloodGroup,
            medicalHistory,
            // uniqueId and user are auto-generated/handled
        });

        const createdPatient = await patient.save();
        res.status(201).json(createdPatient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            patient.name = req.body.name || patient.name;
            patient.age = req.body.age || patient.age;
            patient.gender = req.body.gender || patient.gender;
            patient.contact = req.body.contact || patient.contact;
            patient.address = req.body.address || patient.address;
            patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
            patient.medicalHistory = req.body.medicalHistory || patient.medicalHistory;

            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            await patient.deleteOne();
            res.json({ message: 'Patient removed' });
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPatients,
    getPatientById,
    getPatientProfile,
    createPatient,
    updatePatient,
    deletePatient,
};
