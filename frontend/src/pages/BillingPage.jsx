import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
    DollarSign, FileText, Download, Search, Filter, Plus,
    CheckCircle, Clock, AlertCircle, X, Calendar, User,
    TrendingUp, ChevronDown, Eye, Printer, CreditCard
} from 'lucide-react';
import api from '../services/api';

const BillingPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isStaff = ['admin', 'superAdmin', 'receptionist'].includes(user.role);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [newInvoice, setNewInvoice] = useState({
        patientId: '',
        appointmentId: '',
        items: [{ description: 'Consultation', quantity: 1, unitPrice: 100 }],
        tax: 5,
        discount: 0,
        notes: ''
    });

    const [payment, setPayment] = useState({
        amount: 0,
        method: 'cash',
        reference: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invoicesRes, statsRes] = await Promise.all([
                api.get(`/billing/invoices?status=${statusFilter}`),
                api.get('/dashboard/stats')
            ]);
            setInvoices(invoicesRes.data.invoices || []);
            setStats(statsRes.data.billing);
        } catch (error) {
            console.error('Error fetching billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientsAndAppointments = async () => {
        try {
            const [patientsRes, appointmentsRes] = await Promise.all([
                api.get('/patients'),
                api.get('/appointments?status=completed')
            ]);
            setPatients(patientsRes.data || []);
            setAppointments(appointmentsRes.data || []);
        } catch (error) {
            console.error('Error fetching patients/appointments:', error);
        }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            await api.post('/billing/invoices', newInvoice);
            setShowCreateModal(false);
            setNewInvoice({
                patientId: '',
                appointmentId: '',
                items: [{ description: 'Consultation', quantity: 1, unitPrice: 100 }],
                tax: 5,
                discount: 0,
                notes: ''
            });
            fetchData();
            alert('Invoice created successfully!');
        } catch (error) {
            alert('Failed to create invoice: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/billing/invoices/${selectedInvoice._id}/payment`, payment);
            setShowPaymentModal(false);
            setSelectedInvoice(null);
            setPayment({ amount: 0, method: 'cash', reference: '', notes: '' });
            fetchData();
            alert('Payment recorded successfully!');
        } catch (error) {
            alert('Failed to record payment: ' + (error.response?.data?.message || error.message));
        }
    };

    const openPaymentModal = (invoice) => {
        setSelectedInvoice(invoice);
        setPayment({
            ...payment,
            amount: invoice.total - (invoice.paidAmount || 0)
        });
        setShowPaymentModal(true);
    };

    const handleExportCSV = async () => {
        try {
            const response = await api.get('/billing/export/csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoices_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to export: ' + error.message);
        }
    };

    const addLineItem = () => {
        setNewInvoice({
            ...newInvoice,
            items: [...newInvoice.items, { description: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const updateLineItem = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index][field] = field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value;
        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const removeLineItem = (index) => {
        if (newInvoice.items.length > 1) {
            const updatedItems = newInvoice.items.filter((_, i) => i !== index);
            setNewInvoice({ ...newInvoice, items: updatedItems });
        }
    };

    const calculateSubtotal = () => {
        return newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = (subtotal * newInvoice.tax) / 100;
        return subtotal + tax - newInvoice.discount;
    };

    const getStatusBadge = (status) => {
        const badges = {
            paid: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Paid' },
            pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
            partially_paid: { bg: 'bg-blue-100', text: 'text-blue-700', icon: DollarSign, label: 'Partial' },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Overdue' },
            cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', icon: X, label: 'Cancelled' }
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                <Icon className="w-3 h-3" /> {badge.label}
            </span>
        );
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <DollarSign className="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4" />
                        <p className="text-slate-500">Loading Billing Data...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 font-display">Billing & Invoices</h1>
                <p className="text-slate-500 mt-1">Manage patient invoices and track payments.</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-linear-to-br from-green-500 to-emerald-600 p-5 rounded-2xl text-white shadow-lg shadow-green-500/30">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-200" />
                        </div>
                        <p className="text-green-100 text-sm">Today's Revenue</p>
                        <p className="text-2xl font-bold">{stats.todayRevenue || 0} ETB</p>
                    </div>
                    <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-blue-100 text-sm">Monthly Revenue</p>
                        <p className="text-2xl font-bold">{stats.monthlyRevenue || 0} ETB</p>
                    </div>
                    <div className="bg-linear-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-white shadow-lg shadow-amber-500/30">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-amber-100 text-sm">Pending Invoices</p>
                        <p className="text-2xl font-bold">{stats.pendingInvoices || 0}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-slate-100 p-2 rounded-lg">
                                <FileText className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm">Total Invoices</p>
                        <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
                    </div>
                </div>
            )}

            {/* Actions Bar - Only for Staff */}
            {isStaff && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex gap-3 flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search invoices..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="partially_paid">Partially Paid</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                            <button
                                onClick={() => { setShowCreateModal(true); fetchPatientsAndAppointments(); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                            >
                                <Plus className="w-4 h-4" /> New Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoices Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Invoice #</th>
                                <th className="px-6 py-4 text-left">Patient</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Paid</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                {isStaff && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                                <tr key={invoice._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-primary-600">{invoice.invoiceNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{invoice.patient?.name || 'N/A'}</div>
                                        <div className="text-sm text-slate-500">{invoice.patient?.uniqueId || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(invoice.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                                        {invoice.total?.toFixed(2)} ETB
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-600 font-bold">
                                        {(invoice.paidAmount || 0).toFixed(2)} ETB
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(invoice.status)}
                                    </td>
                                    {isStaff && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="View">
                                                    <Eye className="w-4 h-4 text-slate-600" />
                                                </button>
                                                <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Print">
                                                    <Printer className="w-4 h-4 text-slate-600" />
                                                </button>
                                                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => openPaymentModal(invoice)}
                                                        className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                                                        title="Record Payment"
                                                    >
                                                        <CreditCard className="w-4 h-4 text-green-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>No invoices found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
                        <div className="bg-linear-to-r from-primary-600 to-primary-700 p-5 text-white flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-xl font-bold">Create New Invoice</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Patient</label>
                                    <select
                                        required
                                        className="w-full p-3 border border-slate-200 rounded-xl"
                                        value={newInvoice.patientId}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, patientId: e.target.value })}
                                    >
                                        <option value="">Select Patient</option>
                                        {patients.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} - {p.uniqueId}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Appointment (Optional)</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl"
                                        value={newInvoice.appointmentId}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, appointmentId: e.target.value })}
                                    >
                                        <option value="">Select Appointment</option>
                                        {appointments.map(a => (
                                            <option key={a._id} value={a._id}>{a.date} - {a.time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-slate-700">Line Items</label>
                                    <button
                                        type="button"
                                        onClick={addLineItem}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {newInvoice.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                className="flex-1 p-3 border border-slate-200 rounded-xl"
                                                value={item.description}
                                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="w-20 p-3 border border-slate-200 rounded-xl"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                                min="1"
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                className="w-28 p-3 border border-slate-200 rounded-xl"
                                                value={item.unitPrice}
                                                onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                                                step="0.01"
                                                required
                                            />
                                            {newInvoice.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLineItem(index)}
                                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tax (%)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-slate-200 rounded-xl"
                                        value={newInvoice.tax}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, tax: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Discount (ETB)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-slate-200 rounded-xl"
                                        value={newInvoice.discount}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, discount: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                    />
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <p className="text-sm text-slate-500">Total</p>
                                    <p className="text-2xl font-bold text-primary-600">{calculateTotal().toFixed(2)} ETB</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                    rows="2"
                                    value={newInvoice.notes}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                            >
                                Create Invoice
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="bg-linear-to-r from-green-600 to-emerald-600 p-5 text-white flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-xl font-bold">Record Payment</h2>
                            <button onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }} className="text-white/80 hover:text-white text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-sm text-slate-500">Invoice</p>
                                <p className="font-mono font-bold text-primary-600">{selectedInvoice.invoiceNumber}</p>
                                <div className="flex justify-between mt-2 text-sm">
                                    <span>Total: {selectedInvoice.total?.toFixed(2)} ETB</span>
                                    <span className="text-red-600">Due: {(selectedInvoice.total - (selectedInvoice.paidAmount || 0)).toFixed(2)} ETB</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full p-3 border border-slate-200 rounded-xl text-xl font-bold"
                                    value={payment.amount}
                                    onChange={(e) => setPayment({ ...payment, amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                                <select
                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                    value={payment.method}
                                    onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="telebirr">Telebirr</option>
                                    <option value="cbe_birr">CBE Birr</option>
                                    <option value="mpesa">M-Pesa Safaricom</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Reference (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                    value={payment.reference}
                                    onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
                                    placeholder="Transaction ID, Receipt #, etc."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30"
                            >
                                Record Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default BillingPage;
