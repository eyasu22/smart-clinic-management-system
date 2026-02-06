import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
    Calendar, Clock, User, Activity, Plus, Search,
    CheckCircle, XCircle, AlertCircle, ChevronRight,
    MapPin, MoreVertical, FileText, Clipboard, Stethoscope,
    Filter, ArrowRight, Video, MessageSquare
} from 'lucide-react';
import api from '../services/api';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Create Appointment Form State
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState(['General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics']);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [newAppointment, setNewAppointment] = useState({
        doctorId: '',
        patientId: '', // For staff booking
        specialization: 'General Medicine',
        date: new Date().toISOString().split('T')[0],
        time: '',
        symptoms: '',
        notes: ''
    });

    const [aiSuggestion, setAiSuggestion] = useState(null);

    useEffect(() => {
        const fetchAISuggestion = async () => {
            if (!newAppointment.date) return;
            try {
                const { data } = await api.get(`/calendar/suggestions?date=${newAppointment.date}`);
                setAiSuggestion(data);
            } catch (err) {
                console.error("AI Suggestion fetch failed", err);
            }
        };
        fetchAISuggestion();
    }, [newAppointment.date]);

    // Clinical Update State (for doctors)
    const [clinicalData, setClinicalData] = useState({
        diagnosis: '',
        visitNotes: '',
        prescription: ''
    });

    useEffect(() => {
        fetchAppointments();
        if (showCreateModal) {
            fetchDoctorsBySpecialty(newAppointment.specialization);
        }
    }, [statusFilter, showCreateModal]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/appointments?status=${statusFilter}`);
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctorsBySpecialty = async (spec) => {
        try {
            const { data } = await api.get(`/appointments/doctors-by-specialty?specialization=${spec}&date=${newAppointment.date}`);
            setDoctors(data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const fetchAvailableSlots = async (docId, date) => {
        if (!docId || !date) return;
        try {
            const { data } = await api.get(`/appointments/available-slots?doctorId=${docId}&date=${date}`);
            setAvailableSlots(data.availableSlots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', newAppointment);
            setShowCreateModal(false);
            setNewAppointment({ doctorId: '', specialization: 'General Medicine', date: new Date().toISOString().split('T')[0], time: '', symptoms: '', notes: '' });
            fetchAppointments();
            alert('Appointment requested successfully!');
        } catch (error) {
            alert('Booking failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/appointments/${id}`, { status, ...clinicalData });
            setShowDetailModal(false);
            fetchAppointments();
            alert(`Appointment marked as ${status}`);
        } catch (error) {
            alert('Update failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await api.put(`/appointments/${id}/cancel`);
            fetchAppointments();
            setSelectedAppointment(null);
            setShowDetailModal(false);
        } catch (error) {
            alert('Cancellation failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Pending' },
            confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle, label: 'Confirmed' },
            completed: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle, label: 'Completed' },
            cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Cancelled' }
        };
        const config = badges[status] || badges.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-tight ${config.bg} ${config.text}`}>
                <Icon className="w-3.5 h-3.5" /> {config.label}
            </span>
        );
    };

    const upcomingAppointments = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
    const pastAppointments = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

    const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    if (loading && appointments.length === 0) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Calendar className="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Syncing Schedules...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage schedules, clinical visits, and patient consultations.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/25"
                    >
                        <Plus className="w-5 h-5" /> Book Appointment
                    </button>
                </div>
            </div>

            {/* Quick Stats & Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div
                    onClick={() => setActiveTab('upcoming')}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer ${activeTab === 'upcoming' ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-500/20' : 'bg-white text-slate-600 border-slate-100 hover:border-primary-200'}`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className={`p-2 rounded-xl ${activeTab === 'upcoming' ? 'bg-white/20' : 'bg-primary-50 text-primary-600'}`}>
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className={`text-2xl font-bold ${activeTab === 'upcoming' ? 'text-white' : 'text-slate-900'}`}>{upcomingAppointments.length}</span>
                    </div>
                    <p className={`text-sm font-bold uppercase tracking-wider ${activeTab === 'upcoming' ? 'text-primary-100' : 'text-slate-500'}`}>Upcoming</p>
                </div>
                <div
                    onClick={() => setActiveTab('past')}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer ${activeTab === 'past' ? 'bg-slate-800 text-white border-slate-800 shadow-xl' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'}`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className={`p-2 rounded-xl ${activeTab === 'past' ? 'bg-white/10' : 'bg-slate-100 text-slate-600'}`}>
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className={`text-2xl font-bold ${activeTab === 'past' ? 'text-white' : 'text-slate-900'}`}>{pastAppointments.length}</span>
                    </div>
                    <p className={`text-sm font-bold uppercase tracking-wider ${activeTab === 'past' ? 'text-slate-300' : 'text-slate-500'}`}>History</p>
                </div>
                <div className="col-span-1 md:col-span-2 bg-linear-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-white/80 text-sm font-medium mb-1">Today's Focus</p>
                        <h3 className="text-xl font-bold">You have {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length} visits today</h3>
                    </div>
                    <Activity className="w-12 h-12 text-white/30" />
                </div>
            </div>

            {/* List Header */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-600"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    <Filter className="w-4 h-4" /> All Status
                </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {displayAppointments.length > 0 ? displayAppointments.map((appointment) => (
                    <div
                        key={appointment._id}
                        onClick={() => { setSelectedAppointment(appointment); setClinicalData({ diagnosis: appointment.diagnosis || '', visitNotes: appointment.visitNotes || '', prescription: appointment.prescription || '' }); setShowDetailModal(true); }}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Date Badge */}
                            <div className="flex flex-col items-center justify-center bg-slate-50 w-20 h-20 rounded-2xl border border-slate-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors relative">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter group-hover:text-primary-400 transition-colors">
                                    {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                                <span className="text-2xl font-black text-slate-800 group-hover:text-primary-700 transition-colors">
                                    {new Date(appointment.date).getDate()}
                                </span>
                                {appointment.ethDate && (
                                    <span className="absolute -bottom-2 bg-primary-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                        {appointment.ethDate.month}/{appointment.ethDate.day} EC
                                    </span>
                                )}
                            </div>

                            {/* Main Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {getStatusBadge(appointment.status)}
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                        <Clock className="w-3.5 h-3.5" /> {appointment.time}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                                    {user.role === 'patient'
                                        ? `Dr. ${appointment.doctor?.user?.name || 'Doctor'}`
                                        : appointment.patient?.name || 'Patient'}
                                    <span className="text-sm font-medium text-slate-400">({appointment.doctor?.specialization})</span>
                                </h3>
                                <p className="text-slate-500 font-medium flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-slate-400" />
                                    {appointment.symptoms || 'General Checkup'}
                                </p>
                            </div>

                            {/* Actions/Status */}
                            <div className="flex items-center gap-4 ml-auto">
                                <div className="hidden lg:flex gap-2">
                                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                                        <Video className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center p-3 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white p-20 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">No appointments found</h2>
                        <p className="text-slate-500 mt-2">There are no {activeTab} appointments records to display.</p>
                    </div>
                )}
            </div>

            {/* Create Appointment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3">
                            <div className="bg-primary-600 p-8 text-white">
                                <h2 className="text-2xl font-bold mb-6">Book Consultation</h2>
                                <p className="text-primary-100 mb-8 font-medium">Please select your preferred specialization and time slot to book an appointment.</p>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Instant Confirmation</p>
                                            <p className="text-xs text-primary-200">Pending clinic approval</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Flexible Slots</p>
                                            <p className="text-xs text-primary-200">30-min consultation windows</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-bold text-slate-900">Appointment Details</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-3xl font-light">&times;</button>
                                </div>

                                <form onSubmit={handleCreateAppointment} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Specialization</label>
                                            <div className="relative">
                                                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                                    value={newAppointment.specialization}
                                                    onChange={(e) => { setNewAppointment({ ...newAppointment, specialization: e.target.value }); fetchDoctorsBySpecialty(e.target.value); }}
                                                >
                                                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Doctor</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                                    value={newAppointment.doctorId}
                                                    onChange={(e) => { setNewAppointment({ ...newAppointment, doctorId: e.target.value }); fetchAvailableSlots(e.target.value, newAppointment.date); }}
                                                >
                                                    <option value="">Select Doctor</option>
                                                    {doctors.map(d => (
                                                        <option key={d._id} value={d._id}>Dr. {d.name} {d.isFullyBooked ? '(Full)' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="date"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                                    value={newAppointment.date}
                                                    onChange={(e) => { setNewAppointment({ ...newAppointment, date: e.target.value }); fetchAvailableSlots(newAppointment.doctorId, e.target.value); }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Available Times</label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableSlots.length > 0 ? availableSlots.map(slot => (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => setNewAppointment({ ...newAppointment, time: slot })}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${newAppointment.time === slot ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'}`}
                                                    >
                                                        {slot}
                                                    </button>
                                                )) : (
                                                    <p className="text-xs text-slate-400 italic py-2">Select a date and doctor to see slots</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {aiSuggestion && aiSuggestion.alert && (
                                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 mb-6 animate-pulse">
                                            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-indigo-900">AI Scheduling Insight</p>
                                                <p className="text-xs text-indigo-700 mt-1">{aiSuggestion.suggestion}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Description of Symptoms</label>
                                        <textarea
                                            required
                                            placeholder="Please describe what you're experiencing..."
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                            rows="2"
                                            value={newAppointment.symptoms}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, symptoms: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!newAppointment.time || !newAppointment.doctorId}
                                        className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition shadow-xl shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Appointment Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Appointment Detail & Clinical Update Modal */}
            {showDetailModal && selectedAppointment && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                                    <Clipboard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Visit Summary</h2>
                                    <p className="text-slate-500 font-medium">Ref: {selectedAppointment._id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-300 hover:text-slate-600 text-3xl font-light">&times;</button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                            {/* Entity Header */}
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-xl text-primary-600">
                                        {(user.role === 'patient' ? selectedAppointment.doctor?.user?.name?.[0] : selectedAppointment.patient?.name?.[0]) || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.role === 'patient' ? 'Attending Doctor' : 'Patient Name'}</p>
                                        <h4 className="text-lg font-bold text-slate-900">
                                            {user.role === 'patient'
                                                ? `Dr. ${selectedAppointment.doctor?.user?.name || 'Doctor'}`
                                                : selectedAppointment.patient?.name || 'Patient'}
                                        </h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Schedule</p>
                                    <p className="font-bold text-slate-900">{selectedAppointment.date} at {selectedAppointment.time}</p>
                                </div>
                            </div>

                            {/* Symptoms & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                                        <Activity className="w-4 h-4 text-primary-500" /> Patient Complaints
                                    </h4>
                                    <p className="p-4 bg-orange-50/50 text-orange-800 rounded-xl border border-orange-100 font-medium leading-relaxed">
                                        {selectedAppointment.symptoms || 'No symptoms provided.'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                                        <FileText className="w-4 h-4 text-primary-500" /> Appointment Notes
                                    </h4>
                                    <p className="p-4 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 font-medium leading-relaxed italic">
                                        {selectedAppointment.notes || 'No administrative notes.'}
                                    </p>
                                </div>
                            </div>

                            {/* Clinical Section (Only if Doctor or completed/confirmed) */}
                            {(user.role === 'doctor' || selectedAppointment.diagnosis) && (
                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Stethoscope className="w-5 h-5 text-primary-600" />
                                        <h3 className="text-lg font-bold text-slate-900">Clinical Evaluation</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Diagnosis</label>
                                            {user.role === 'doctor' && selectedAppointment.status !== 'completed' ? (
                                                <input
                                                    type="text"
                                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                                    value={clinicalData.diagnosis}
                                                    onChange={(e) => setClinicalData({ ...clinicalData, diagnosis: e.target.value })}
                                                    placeholder="Enter medical diagnosis..."
                                                />
                                            ) : (
                                                <p className="p-4 bg-primary-50 text-primary-900 rounded-xl border border-primary-100 font-bold">{selectedAppointment.diagnosis || 'Pending evaluation...'}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Prescription</label>
                                                {user.role === 'doctor' && selectedAppointment.status !== 'completed' ? (
                                                    <textarea
                                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium font-mono"
                                                        rows="4"
                                                        value={clinicalData.prescription}
                                                        onChange={(e) => setClinicalData({ ...clinicalData, prescription: e.target.value })}
                                                        placeholder="Medications and dosage..."
                                                    />
                                                ) : (
                                                    <div className="p-4 bg-slate-800 text-white rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                                        {selectedAppointment.prescription || 'No medications prescribed.'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Clinical Notes</label>
                                                {user.role === 'doctor' && selectedAppointment.status !== 'completed' ? (
                                                    <textarea
                                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                                        rows="4"
                                                        value={clinicalData.visitNotes}
                                                        onChange={(e) => setClinicalData({ ...clinicalData, visitNotes: e.target.value })}
                                                        placeholder="Detailed clinical findings..."
                                                    />
                                                ) : (
                                                    <div className="p-4 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 text-sm leading-relaxed">
                                                        {selectedAppointment.visitNotes || 'No visit notes recorded.'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-4">
                            {/* Doctor Actions */}
                            {user.role === 'doctor' && selectedAppointment.status === 'pending' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedAppointment._id, 'confirmed')}
                                    className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/20 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> Accept & Confirm
                                </button>
                            )}

                            {user.role === 'doctor' && selectedAppointment.status === 'confirmed' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedAppointment._id, 'completed')}
                                    className="px-8 py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/20 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> Complete Visit
                                </button>
                            )}

                            {/* Patient/Staff Actions */}
                            {((user.role === 'patient' && selectedAppointment.status === 'pending') ||
                                (['admin', 'superAdmin', 'receptionist'].includes(user.role) && ['pending', 'confirmed'].includes(selectedAppointment.status))) && (
                                    <button
                                        onClick={() => handleCancelAppointment(selectedAppointment._id)}
                                        className="px-8 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition flex items-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" /> Cancel Appointment
                                    </button>
                                )}

                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-8 py-3.5 bg-white text-slate-600 border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition ml-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Appointments;
