const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const { createAuditLog } = require('../middleware/authMiddleware');

/**
 * @desc    Create a new invoice
 * @route   POST /api/billing/invoices
 * @access  Private (Admin, Receptionist)
 */
const createInvoice = async (req, res) => {
    try {
        const { patientId, appointmentId, items, tax, discount, dueDate, notes } = req.body;

        // Validate patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Calculate totals
        let subtotal = 0;
        const processedItems = items.map(item => {
            const total = item.quantity * item.unitPrice;
            subtotal += total;
            return { ...item, total };
        });

        const taxAmount = (subtotal * (tax || 0)) / 100;
        const discountAmount = discount || 0;
        const total = subtotal + taxAmount - discountAmount;

        // Get doctor from appointment if provided
        let doctorRef = null;
        if (appointmentId) {
            const appointment = await Appointment.findById(appointmentId).populate('doctor');
            if (appointment && appointment.doctor) {
                doctorRef = appointment.doctor._id;
            }
        }

        const invoice = new Invoice({
            patient: patientId,
            appointment: appointmentId || null,
            doctor: doctorRef,
            items: processedItems,
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            total,
            dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
            notes,
            createdBy: req.user._id,
            status: 'pending'
        });

        const savedInvoice = await invoice.save();

        // Notify patient
        if (patient.user) {
            await Notification.create({
                user: patient.user,
                type: 'BILLING',
                message: `New invoice generated: ${savedInvoice.invoiceNumber} for ${savedInvoice.total.toFixed(2)} ETB. Due on ${new Date(savedInvoice.dueDate).toLocaleDateString()}.`,
                link: `/billing`
            });
        }

        // Audit log
        await createAuditLog(req.user._id, 'CREATE', 'Invoice', savedInvoice._id,
            { patientId, total, appointmentId }, req);

        res.status(201).json(savedInvoice);
    } catch (error) {
        console.error('Create Invoice Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all invoices with filters
 * @route   GET /api/billing/invoices
 * @access  Private (Admin, Receptionist, Doctor-readonly)
 */
const getInvoices = async (req, res) => {
    try {
        const { status, patientId, startDate, endDate, page = 1, limit = 20 } = req.query;

        let query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by patient
        if (patientId) {
            query.patient = patientId;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Patient can only see own invoices
        if (req.user.role === 'patient') {
            const patientProfile = await Patient.findOne({ user: req.user._id });
            if (!patientProfile) {
                return res.json({ invoices: [], total: 0, page: 1, pages: 0 });
            }
            query.patient = patientProfile._id;
        }

        const total = await Invoice.countDocuments(query);
        const invoices = await Invoice.find(query)
            .populate('patient', 'name uniqueId contact')
            .populate('doctor', 'specialization')
            .populate('appointment', 'date time')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            invoices,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single invoice
 * @route   GET /api/billing/invoices/:id
 * @access  Private
 */
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('patient', 'name uniqueId contact age gender address')
            .populate('doctor', 'specialization consultationFee')
            .populate('appointment', 'date time symptoms diagnosis')
            .populate('createdBy', 'name email');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Patient can only view own invoices
        if (req.user.role === 'patient') {
            const patientProfile = await Patient.findOne({ user: req.user._id });
            if (!patientProfile || invoice.patient._id.toString() !== patientProfile._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this invoice' });
            }
        }

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update invoice
 * @route   PUT /api/billing/invoices/:id
 * @access  Private (Admin, Receptionist)
 */
const updateInvoice = async (req, res) => {
    try {
        if (!req.canModifyBilling) {
            return res.status(403).json({ message: 'Not authorized to modify invoices' });
        }

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Don't allow modification of paid invoices
        if (invoice.status === 'paid') {
            return res.status(400).json({ message: 'Cannot modify a paid invoice' });
        }

        const { items, tax, discount, dueDate, notes, status } = req.body;

        if (items) {
            let subtotal = 0;
            invoice.items = items.map(item => {
                const total = item.quantity * item.unitPrice;
                subtotal += total;
                return { ...item, total };
            });
            invoice.subtotal = subtotal;
            invoice.tax = (subtotal * (tax || 0)) / 100;
            invoice.discount = discount || invoice.discount;
            invoice.total = invoice.subtotal + invoice.tax - invoice.discount;
        }

        if (dueDate) invoice.dueDate = dueDate;
        if (notes !== undefined) invoice.notes = notes;
        if (status && ['pending', 'cancelled'].includes(status)) {
            invoice.status = status;
        }

        const updatedInvoice = await invoice.save();

        await createAuditLog(req.user._id, 'UPDATE', 'Invoice', invoice._id, req.body, req);

        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Record payment for invoice
 * @route   POST /api/billing/invoices/:id/payment
 * @access  Private (Admin, Receptionist)
 */
const recordPayment = async (req, res) => {
    try {
        if (!req.canModifyBilling) {
            return res.status(403).json({ message: 'Not authorized to record payments' });
        }

        const { amount, method, reference, notes } = req.body;

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (invoice.status === 'paid') {
            return res.status(400).json({ message: 'Invoice is already fully paid' });
        }

        if (invoice.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot record payment for cancelled invoice' });
        }

        // Create payment record
        const payment = new Payment({
            invoice: invoice._id,
            amount,
            method: method || 'cash',
            reference,
            notes,
            recordedBy: req.user._id,
            status: 'completed'
        });

        await payment.save();

        // Update invoice
        invoice.paidAmount = (invoice.paidAmount || 0) + amount;
        invoice.paymentMethod = method || 'cash';
        invoice.paymentReference = reference;

        if (invoice.paidAmount >= invoice.total) {
            invoice.status = 'paid';
            invoice.paidAt = new Date();
        } else {
            invoice.status = 'partially_paid';
        }

        await invoice.save();

        // Notify patient of payment
        const patient = await Patient.findById(invoice.patient);
        if (patient && patient.user) {
            await Notification.create({
                user: patient.user,
                type: 'BILLING',
                message: `Payment received: ${amount.toFixed(2)} ETB for invoice ${invoice.invoiceNumber}. Thank you!`,
                link: `/billing`
            });
        }

        await createAuditLog(req.user._id, 'PAYMENT', 'Invoice', invoice._id,
            { amount, method, newStatus: invoice.status }, req);

        res.json({
            message: 'Payment recorded successfully',
            invoice,
            payment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get invoice for a specific appointment
 * @route   GET /api/billing/appointment/:appointmentId
 * @access  Private
 */
const getInvoiceByAppointment = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ appointment: req.params.appointmentId })
            .populate('patient', 'name uniqueId')
            .populate('doctor', 'specialization');

        if (!invoice) {
            return res.status(404).json({ message: 'No invoice found for this appointment' });
        }

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get patient's billing history
 * @route   GET /api/billing/patient/:patientId
 * @access  Private
 */
const getPatientBillingHistory = async (req, res) => {
    try {
        // Patients can only view their own billing history
        if (req.user.role === 'patient') {
            const patientProfile = await Patient.findOne({ user: req.user._id });
            if (!patientProfile || patientProfile._id.toString() !== req.params.patientId) {
                return res.status(403).json({ message: 'Not authorized to view this billing history' });
            }
        }

        const invoices = await Invoice.find({ patient: req.params.patientId })
            .populate('appointment', 'date time')
            .populate('doctor', 'specialization')
            .sort({ createdAt: -1 });

        const summary = {
            totalInvoices: invoices.length,
            totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
            paidAmount: invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
            pendingAmount: invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
                .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0),
            overdueCount: invoices.filter(inv => inv.status === 'overdue').length
        };

        res.json({ invoices, summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get financial reports
 * @route   GET /api/billing/reports
 * @access  Private (Admin)
 */
const getFinancialReports = async (req, res) => {
    try {
        const { period = 'daily', startDate, endDate } = req.query;

        let matchStage = { status: { $ne: 'cancelled' } };
        let groupFormat;

        // Date range filter
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Determine grouping format based on period
        switch (period) {
            case 'monthly':
                groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
            case 'weekly':
                groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
                break;
            default: // daily
                groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        }

        // Revenue by period
        const revenueTrend = await Invoice.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupFormat,
                    totalRevenue: { $sum: '$paidAmount' },
                    invoiceCount: { $sum: 1 },
                    avgInvoiceValue: { $avg: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Revenue by payment method
        const revenueByMethod = await Invoice.aggregate([
            { $match: { ...matchStage, status: 'paid' } },
            {
                $group: {
                    _id: '$paymentMethod',
                    total: { $sum: '$paidAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Status summary
        const statusSummary = await Invoice.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    total: { $sum: '$total' }
                }
            }
        ]);

        // Today's summary
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySummary = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$paidAmount' },
                    totalBilled: { $sum: '$total' },
                    invoiceCount: { $sum: 1 }
                }
            }
        ]);

        res.json({
            period,
            revenueTrend,
            revenueByMethod,
            statusSummary,
            todaySummary: todaySummary[0] || { totalRevenue: 0, totalBilled: 0, invoiceCount: 0 }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Export invoices to CSV
 * @route   GET /api/billing/export/csv
 * @access  Private (Admin)
 */
const exportInvoicesCSV = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        let query = {};
        if (status && status !== 'all') query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const invoices = await Invoice.find(query)
            .populate('patient', 'name uniqueId')
            .populate('doctor', 'specialization')
            .sort({ createdAt: -1 });

        // Build CSV content
        const headers = ['Invoice #', 'Date', 'Patient', 'Patient ID', 'Doctor', 'Subtotal', 'Tax', 'Discount', 'Total', 'Paid', 'Status', 'Payment Method'];

        const rows = invoices.map(inv => [
            inv.invoiceNumber,
            new Date(inv.createdAt).toISOString().split('T')[0],
            inv.patient?.name || 'N/A',
            inv.patient?.uniqueId || 'N/A',
            inv.doctor?.specialization || 'N/A',
            inv.subtotal.toFixed(2),
            inv.tax.toFixed(2),
            inv.discount.toFixed(2),
            inv.total.toFixed(2),
            (inv.paidAmount || 0).toFixed(2),
            inv.status,
            inv.paymentMethod || 'N/A'
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=invoices_${Date.now()}.csv`);
        res.send(csvContent);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    recordPayment,
    getInvoiceByAppointment,
    getPatientBillingHistory,
    getFinancialReports,
    exportInvoicesCSV
};
