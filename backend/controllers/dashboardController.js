const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

/**
 * @desc    Get dashboard stats based on user role
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
    try {
        // Patient Dashboard
        if (req.user.role === 'patient') {
            return await getPatientDashboard(req, res);
        }

        // Doctor Dashboard
        if (req.user.role === 'doctor') {
            return await getDoctorDashboard(req, res);
        }

        // Admin/SuperAdmin Dashboard
        return await getAdminDashboard(req, res);

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

/**
 * Patient-specific dashboard
 */
const getPatientDashboard = async (req, res) => {
    const patientProfile = await Patient.findOne({ user: req.user._id });

    if (!patientProfile) {
        return res.json({
            role: 'patient',
            profileComplete: false,
            stats: [],
            alerts: [{ type: 'info', message: 'Please complete your profile to book appointments.' }]
        });
    }

    const today = new Date().toISOString().split('T')[0];

    const [upcomingCount, completedCount, unreadNotifications] = await Promise.all([
        Appointment.countDocuments({
            patient: patientProfile._id,
            status: { $in: ['confirmed', 'pending'] },
            date: { $gte: today }
        }),
        Appointment.countDocuments({
            patient: patientProfile._id,
            status: 'completed'
        }),
        Notification.countDocuments({
            user: req.user._id,
            read: false
        })
    ]);

    // Get next appointment
    const nextAppointment = await Appointment.findOne({
        patient: patientProfile._id,
        status: { $in: ['confirmed', 'pending'] },
        date: { $gte: today }
    })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
        .sort({ date: 1, time: 1 });

    return res.json({
        role: 'patient',
        profileComplete: true,
        stats: [
            { label: 'Upcoming Appointments', value: upcomingCount, icon: 'Calendar', color: 'blue' },
            { label: 'Completed Visits', value: completedCount, icon: 'CheckCircle', color: 'green' },
            { label: 'Notifications', value: unreadNotifications, icon: 'Bell', color: 'amber' }
        ],
        nextAppointment: nextAppointment ? {
            date: nextAppointment.date,
            time: nextAppointment.time,
            doctor: nextAppointment.doctor?.user?.name || 'Unknown',
            specialization: nextAppointment.doctor?.specialization,
            status: nextAppointment.status
        } : null
    });
};

/**
 * Doctor-specific dashboard
 */
const getDoctorDashboard = async (req, res) => {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });

    if (!doctorProfile) {
        return res.json({
            role: 'doctor',
            profileComplete: false,
            stats: [],
            alerts: [{ type: 'warning', message: 'Doctor profile not found. Contact admin.' }]
        });
    }

    const today = new Date().toISOString().split('T')[0];

    const [todayCount, pendingCount, completedCount, totalPatients] = await Promise.all([
        Appointment.countDocuments({
            doctor: doctorProfile._id,
            date: today,
            status: { $ne: 'cancelled' }
        }),
        Appointment.countDocuments({
            doctor: doctorProfile._id,
            status: 'pending'
        }),
        Appointment.countDocuments({
            doctor: doctorProfile._id,
            status: 'completed'
        }),
        Appointment.distinct('patient', { doctor: doctorProfile._id }).then(arr => arr.length)
    ]);

    // Calculate workload percentage
    const workloadPercent = Math.round((todayCount / doctorProfile.maxPatientsPerDay) * 100);

    // Get today's appointments
    const todayAppointments = await Appointment.find({
        doctor: doctorProfile._id,
        date: today,
        status: { $ne: 'cancelled' }
    })
        .populate('patient', 'name age gender')
        .sort({ time: 1 })
        .limit(10);

    return res.json({
        role: 'doctor',
        profileComplete: true,
        specialization: doctorProfile.specialization,
        stats: [
            { label: "Today's Patients", value: todayCount, icon: 'Users', color: 'blue' },
            { label: 'Pending Requests', value: pendingCount, icon: 'Clock', color: 'amber' },
            { label: 'Total Consultations', value: completedCount, icon: 'CheckCircle', color: 'green' },
            { label: 'Unique Patients', value: totalPatients, icon: 'UserCheck', color: 'indigo' }
        ],
        workload: {
            current: todayCount,
            max: doctorProfile.maxPatientsPerDay,
            percent: workloadPercent,
            status: workloadPercent >= 90 ? 'critical' : workloadPercent >= 70 ? 'high' : 'normal'
        },
        todayAppointments: todayAppointments.map(apt => ({
            _id: apt._id,
            time: apt.time,
            patientName: apt.patient?.name || 'Unknown',
            patientAge: apt.patient?.age,
            status: apt.status,
            symptoms: apt.symptoms
        }))
    });
};

/**
 * Admin/SuperAdmin dashboard
 */
const getAdminDashboard = async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    // User counts by role
    const [totalUsers, usersByRole] = await Promise.all([
        User.countDocuments({ isActive: true }),
        User.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ])
    ]);

    const roleCountsMap = {};
    usersByRole.forEach(item => { roleCountsMap[item._id] = item.count; });

    // Appointment stats
    const [todayAppointments, pendingAppointments, completedThisMonth] = await Promise.all([
        Appointment.countDocuments({ date: today, status: { $ne: 'cancelled' } }),
        Appointment.countDocuments({ status: 'pending' }),
        Appointment.countDocuments({
            status: 'completed',
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        })
    ]);

    // Revenue stats (from Invoice model)
    const [todayRevenue, monthlyRevenue] = await Promise.all([
        Invoice.aggregate([
            {
                $match: {
                    status: 'paid',
                    paidAt: { $gte: new Date(today) }
                }
            },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ]),
        Invoice.aggregate([
            {
                $match: {
                    status: 'paid',
                    paidAt: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ])
    ]);

    // Pending invoices
    const pendingInvoices = await Invoice.countDocuments({ status: { $in: ['pending', 'overdue'] } });

    return res.json({
        role: req.user.role,
        stats: [
            { label: 'Total Users', value: totalUsers, icon: 'Users', color: 'blue' },
            { label: "Today's Appointments", value: todayAppointments, icon: 'Calendar', color: 'indigo' },
            { label: 'Pending Requests', value: pendingAppointments, icon: 'Clock', color: 'amber' },
            { label: "Today's Revenue", value: `$${todayRevenue[0]?.total || 0}`, icon: 'DollarSign', color: 'green' }
        ],
        usersByRole: {
            doctors: roleCountsMap['doctor'] || 0,
            patients: roleCountsMap['patient'] || 0,
            receptionists: roleCountsMap['receptionist'] || 0,
            admins: roleCountsMap['admin'] || 0
        },
        appointments: {
            today: todayAppointments,
            pending: pendingAppointments,
            completedThisMonth
        },
        billing: {
            todayRevenue: todayRevenue[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            pendingInvoices
        }
    });
};

/**
 * @desc    Get appointment trends for chart
 * @route   GET /api/dashboard/appointment-trends
 * @access  Private (Admin)
 */
const getAppointmentTrends = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const trends = await Appointment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Transform for chart
        const chartData = {};
        trends.forEach(item => {
            if (!chartData[item._id.date]) {
                chartData[item._id.date] = { date: item._id.date, total: 0, completed: 0, cancelled: 0, pending: 0, confirmed: 0 };
            }
            chartData[item._id.date][item._id.status] = item.count;
            chartData[item._id.date].total += item.count;
        });

        res.json({
            period: `Last ${days} days`,
            data: Object.values(chartData)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get user notifications
 * @route   GET /api/dashboard/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            read: false
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/dashboard/notifications/:id/read
 * @access  Private
 */
const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Verify ownership
        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Broadcast notification to all users (Admin only)
 * @route   POST /api/dashboard/notifications/broadcast
 * @access  Private/Admin
 */
const broadcastNotification = async (req, res) => {
    try {
        const { message, type, link } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Get all active users
        const users = await User.find({ isActive: true }).select('_id');

        const notifications = users.map(user => ({
            user: user._id,
            type: type || 'SYSTEM',
            message,
            link: link || ''
        }));

        await Notification.insertMany(notifications);

        res.json({ message: `Successfully broadcasted to ${users.length} users.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/dashboard/notifications/read-all
 * @access  Private
 */
const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAppointmentTrends,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    broadcastNotification
};

