const express = require('express');
const router = express.Router();
const {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    recordPayment,
    getInvoiceByAppointment,
    getPatientBillingHistory,
    getFinancialReports,
    exportInvoicesCSV
} = require('../controllers/billingController');
const {
    protect,
    admin,
    billingAccess,
    checkMaintenanceMode
} = require('../middleware/authMiddleware');

// Apply maintenance mode check to all billing routes
router.use(protect);
router.use(checkMaintenanceMode);

// Invoice routes
router.route('/invoices')
    .get(billingAccess, getInvoices)
    .post(billingAccess, createInvoice);

router.route('/invoices/:id')
    .get(billingAccess, getInvoiceById)
    .put(billingAccess, updateInvoice);

router.route('/invoices/:id/payment')
    .post(billingAccess, recordPayment);

// Lookup routes
router.get('/appointment/:appointmentId', billingAccess, getInvoiceByAppointment);
router.get('/patient/:patientId', billingAccess, getPatientBillingHistory);

// Reports (Admin only)
router.get('/reports', admin, getFinancialReports);
router.get('/export/csv', admin, exportInvoicesCSV);

module.exports = router;
