const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const ClinicClosure = require('../models/ClinicClosure');
const { toEthiopian } = require('../utils/ethiopianCalendar');
const { createAuditLog } = require('../middleware/authMiddleware');

/**
 * @desc    Get all appointments (filtered by role)
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = async (req, res) => {
    try {
        let query = {};
        const { status, date, doctorId, patientId } = req.query;

        // Apply filters
        if (status && status !== 'all') query.status = status;
        if (date) query.date = date;
        if (doctorId) query.doctor = doctorId;
        if (patientId) query.patient = patientId;

        // Role-based filtering
        if (req.user.role === 'doctor') {
            const doctorProfile = await Doctor.findOne({ user: req.user._id });
            if (doctorProfile) {
                query.doctor = doctorProfile._id;
            } else {
                return res.json([]);
            }
        } else if (req.user.role === 'patient') {
            const patientProfile = await Patient.findOne({ user: req.user._id });
            if (patientProfile) {
                query.patient = patientProfile._id;
            } else {
                return res.json([]);
            }
        }

        const appointments = await Appointment.find(query)
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'name email profileImage' }
            })
            .populate('patient', 'name uniqueId age gender contact')
            .sort({ date: -1, time: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create appointment with workload and calendar validation
 * @route   POST /api/appointments
 * @access  Private
 */
const createAppointment = async (req, res) => {
    let { doctorId, patientId, date, time, symptoms, notes, specialization } = req.body;

    try {
        // 1. Calendar Validation (Clinic Closure)
        const closure = await ClinicClosure.findOne({ date });
        if (closure && (closure.isFullDay || (time >= closure.startTime && time <= closure.endTime))) {
            return res.status(400).json({
                message: `Clinic is closed on ${date} due to: ${closure.title} (${closure.type}).`,
                isClosed: true,
                reason: closure.title
            });
        }

        // 2. Ethiopian Date Conversion
        const ethInfo = toEthiopian(new Date(date));
        const ethDate = {
            ...ethInfo,
            display: `${ethInfo.monthName} ${ethInfo.day}, ${ethInfo.year}`
        };

        // 3. Handle Patient Booking
        if (req.user.role === 'patient') {
            const patientProfile = await Patient.findOne({ user: req.user._id });
            if (!patientProfile) {
                return res.status(400).json({
                    message: 'Please complete your patient profile before booking.'
                });
            }
            patientId = patientProfile._id;
        }

        // 4. Validate Doctor and Specialty
        const doctor = await Doctor.findById(doctorId).populate('user', 'name');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        if (specialization && doctor.specialization.toLowerCase() !== specialization.toLowerCase()) {
            return res.status(400).json({
                message: `This doctor specializes in ${doctor.specialization}, not ${specialization}.`
            });
        }

        // 5. Workload & Conflict Validation
        const appointmentsOnDate = await Appointment.countDocuments({
            doctor: doctorId,
            date,
            status: { $nin: ['cancelled'] }
        });

        if (appointmentsOnDate >= doctor.maxPatientsPerDay) {
            return res.status(400).json({
                message: `Dr. ${doctor.user.name} is fully booked for ${date}.`,
                errorCode: 'DOCTOR_FULLY_BOOKED'
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date,
            time,
            status: { $nin: ['cancelled'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                message: 'This time slot is already booked. Please choose another time.',
                errorCode: 'TIME_SLOT_TAKEN'
            });
        }

        // 6. Create Appointment
        const appointment = new Appointment({
            doctor: doctorId,
            patient: patientId,
            date,
            time,
            ethDate,
            symptoms,
            notes,
            status: 'pending'
        });

        const createdAppointment = await appointment.save();

        // 7. Success Actions (Notifications & Audit)
        const patient = await Patient.findById(patientId);
        if (patient && patient.user) {
            await Notification.create({
                user: patient.user,
                type: 'APPOINTMENT',
                message: `Your appointment with Dr. ${doctor.user.name} on ${ethDate.display} (${date}) at ${time} is now PENDING confirmation.`,
                link: `/appointments/${createdAppointment._id}`
            });
        }

        await createAuditLog(req.user._id, 'CREATE', 'Appointment', createdAppointment._id, { date, ethDate: ethDate.display }, req);

        res.status(201).json(createdAppointment);
    } catch (error) {
        console.error('Create Appointment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update appointment status/notes/clinical data
 * @route   PUT /api/appointments/:id
 * @access  Private (Doctor/Admin/Receptionist)
 */
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'name' }
            })
            .populate('patient', 'user name');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const oldStatus = appointment.status;
        const { status, notes, diagnosis, visitNotes, prescription } = req.body;

        // Validate status transitions (lifecycle management)
        if (status) {
            const validTransitions = {
                'pending': ['confirmed', 'cancelled'],
                'confirmed': ['completed', 'cancelled'],
                'completed': [], // Terminal state
                'cancelled': []  // Terminal state
            };

            if (!validTransitions[oldStatus]?.includes(status)) {
                return res.status(400).json({
                    message: `Cannot change status from ${oldStatus} to ${status}. Valid transitions: ${validTransitions[oldStatus].join(', ') || 'none'}`,
                    errorCode: 'INVALID_STATUS_TRANSITION'
                });
            }

            appointment.status = status;
        }

        // Operational updates
        if (notes !== undefined) appointment.notes = notes;

        // Clinical updates (Doctor only)
        if (req.user.role === 'doctor' || req.user.role === 'admin' || req.user.role === 'superAdmin') {
            if (diagnosis) appointment.diagnosis = diagnosis;
            if (visitNotes) appointment.visitNotes = visitNotes;
            if (prescription) appointment.prescription = prescription;
        } else if (diagnosis || visitNotes || prescription) {
            return res.status(430).json({
                message: 'Only doctors can update clinical data (diagnosis, visit notes, prescription)'
            });
        }

        const updatedAppointment = await appointment.save();

        // Status change notifications
        if (status && status !== oldStatus) {
            // Notify Patient
            if (appointment.patient?.user) {
                let message = '';
                switch (status) {
                    case 'confirmed':
                        message = `Great news! Your appointment with Dr. ${appointment.doctor.user.name} on ${appointment.date} at ${appointment.time} has been CONFIRMED.`;
                        break;
                    case 'completed':
                        message = `Your appointment with Dr. ${appointment.doctor.user.name} on ${appointment.date} has been marked as COMPLETED.`;
                        break;
                    case 'cancelled':
                        message = `Your appointment with Dr. ${appointment.doctor.user.name} on ${appointment.date} has been CANCELLED.`;
                        break;
                }

                if (message) {
                    await Notification.create({
                        user: appointment.patient.user,
                        type: 'APPOINTMENT',
                        message,
                        link: `/appointments/${appointment._id}`
                    });
                }
            }

            // Audit log for status change
            await createAuditLog(req.user._id, 'STATUS_CHANGE', 'Appointment', appointment._id,
                { oldStatus, newStatus: status }, req);
        }

        res.json(updatedAppointment);
    } catch (error) {
        console.error('Update Appointment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Cancel appointment (Patient can only cancel own pending appointments)
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private
 */
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'name' }
            })
            .populate('patient', 'user name');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Patient ownership validation
        if (req.user.role === 'patient') {
            const patientProfile = await Patient.findOne({ user: req.user._id });

            if (!patientProfile || appointment.patient._id.toString() !== patientProfile._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
            }

            // Patients can only cancel pending appointments
            if (appointment.status !== 'pending') {
                return res.status(400).json({
                    message: 'You can only cancel pending appointments. Please contact the clinic for confirmed appointments.',
                    errorCode: 'CANNOT_CANCEL_CONFIRMED'
                });
            }
        }

        // Check if already cancelled or completed
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: 'Appointment is already cancelled' });
        }

        if (appointment.status === 'completed') {
            return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
        }

        appointment.status = 'cancelled';
        const updatedAppointment = await appointment.save();

        // Log cancellation
        await createAuditLog(req.user._id, 'CANCEL', 'Appointment', appointment._id,
            { cancelledBy: req.user.role }, req);

        res.json(updatedAppointment);
    } catch (error) {
        console.error('Cancel Appointment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get available time slots for a doctor on a specific date
 * @route   GET /api/appointments/available-slots
 * @access  Private
 */
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({ message: 'Doctor ID and date are required' });
        }

        const doctor = await Doctor.findById(doctorId).populate('user', 'name');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get booked slots
        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            date,
            status: { $nin: ['cancelled'] }
        }).select('time');

        const bookedTimes = bookedAppointments.map(a => a.time);

        // Generate available slots based on doctor's availability
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        const dayAvailability = doctor.availability.find(a =>
            a.day.toLowerCase() === dayOfWeek.toLowerCase()
        );

        if (!dayAvailability) {
            return res.json({
                doctor: { name: doctor.user.name, specialization: doctor.specialization },
                date,
                message: `Dr. ${doctor.user.name} is not available on ${dayOfWeek}s`,
                availableSlots: []
            });
        }

        // Generate time slots (30 min intervals)
        const slots = [];
        let [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
        let [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

        while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
            const timeStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
            slots.push({
                time: timeStr,
                available: !bookedTimes.includes(timeStr)
            });

            startMin += 30;
            if (startMin >= 60) {
                startMin = 0;
                startHour += 1;
            }
        }

        // Check doctor's daily capacity
        const bookedCount = bookedTimes.length;
        const remainingCapacity = doctor.maxPatientsPerDay - bookedCount;

        res.json({
            doctor: {
                name: doctor.user.name,
                specialization: doctor.specialization,
                maxPatientsPerDay: doctor.maxPatientsPerDay
            },
            date,
            dayOfWeek,
            bookedCount,
            remainingCapacity,
            availableSlots: slots.filter(s => s.available).map(s => s.time),
            allSlots: slots
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get doctors by specialization for appointment booking
 * @route   GET /api/appointments/doctors-by-specialty
 * @access  Private
 */
const getDoctorsBySpecialty = async (req, res) => {
    try {
        const { specialization, date } = req.query;

        let query = {};
        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }

        const doctors = await Doctor.find(query).populate('user', 'name email profileImage isActive');

        // Filter only active doctors
        const activeDoctors = doctors.filter(d => d.user?.isActive !== false);

        // If date provided, include availability info
        if (date) {
            const doctorsWithAvailability = await Promise.all(activeDoctors.map(async (doc) => {
                const bookedCount = await Appointment.countDocuments({
                    doctor: doc._id,
                    date,
                    status: { $nin: ['cancelled'] }
                });

                return {
                    _id: doc._id,
                    name: doc.user.name,
                    email: doc.user.email,
                    profileImage: doc.user.profileImage,
                    specialization: doc.specialization,
                    experience: doc.experience,
                    consultationFee: doc.consultationFee,
                    bookedCount,
                    maxPatientsPerDay: doc.maxPatientsPerDay,
                    availableSlots: doc.maxPatientsPerDay - bookedCount,
                    isFullyBooked: bookedCount >= doc.maxPatientsPerDay
                };
            }));

            return res.json(doctorsWithAvailability);
        }

        res.json(activeDoctors.map(doc => ({
            _id: doc._id,
            name: doc.user.name,
            email: doc.user.email,
            profileImage: doc.user.profileImage,
            specialization: doc.specialization,
            experience: doc.experience,
            consultationFee: doc.consultationFee,
            maxPatientsPerDay: doc.maxPatientsPerDay
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Check-in patient (Receptionist Queue system)
 * @route   PUT /api/appointments/:id/check-in
 * @access  Private (Receptionist/Admin)
 */
const checkInAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.status !== 'confirmed') {
            return res.status(400).json({ message: 'Only confirmed appointments can be checked in.' });
        }

        // Calculate queue position for the doctor today
        const checkedInToday = await Appointment.countDocuments({
            doctor: appointment.doctor,
            date: appointment.date,
            checkedInAt: { $exists: true }
        });

        appointment.checkedInAt = new Date();
        appointment.queuePosition = checkedInToday + 1;

        const updated = await appointment.save();

        await createAuditLog(req.user._id, 'CHECK_IN', 'Appointment', appointment._id, { queuePosition: appointment.queuePosition }, req);

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableSlots,
    getDoctorsBySpecialty,
    checkInAppointment
};
