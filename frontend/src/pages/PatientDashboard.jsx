import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Calendar, Activity, Pill, AlertCircle, Plus, Clock, FileText } from 'lucide-react';
import api from '../services/api';

const PatientDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [doctors, setDoctors] = useState([]);

    const [profileData, setProfileData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        bloodGroup: '',
        contact: '',
        address: ''
    });

    // Form State for Booking
    const [bookingData, setBookingData] = useState({
        doctorId: '',
        date: '',
        time: '',
        symptoms: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            const statsReq = await api.get('/dashboard/stats');
            setStats(statsReq.data);

            if (statsReq.data?.profileComplete) {
                const [apptReq, docReq] = await Promise.all([
                    api.get('/appointments'),
                    api.get('/doctors')
                ]);
                setAppointments(apptReq.data);
                console.log("Doctors fetched:", docReq.data);
                setDoctors(docReq.data || []);
            } else {
                setShowProfileModal(true);
            }
        } catch (error) {
            console.error("Error fetching patient data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patients', profileData);
            setShowProfileModal(false);
            fetchData();
        } catch (error) {
            alert("Failed to create profile: " + (error.response?.data?.message || error.message));
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', bookingData);
            setShowBookingModal(false);
            alert("Appointment booked successfully!");
            fetchData();
        } catch (error) {
            alert("Booking failed: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading your health dashboard...</p>
                </div>
            </div>
        </Layout>
    );

    const cancelAppointment = async (id) => {
        if (window.confirm("Are you sure you want to cancel this appointment?")) {
            try {
                await api.put(`/appointments/${id}/cancel`);
                setAppointments(appointments.map(appt =>
                    appt._id === id ? { ...appt, status: 'cancelled' } : appt
                ));
            } catch (error) {
                alert("Failed to cancel: " + (error.response?.data?.message || error.message));
            }
        }
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Calendar': return Calendar;
            case 'Activity': return Activity;
            case 'Pill': return Pill;
            default: return Activity;
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 font-display">My Health Overview</h1>
                <p className="text-slate-500 mt-2">Manage your appointments and medical records.</p>
            </div>

            {!stats?.profileComplete && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                        <span className="font-bold">Action Required:</span> Please complete your patient profile to access all features.
                        <button onClick={() => setShowProfileModal(true)} className="ml-2 underline text-orange-900 font-semibold">Complete Now</button>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            {stats?.profileComplete && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {stats.stats.map((stat, index) => {
                        const Icon = getIcon(stat.icon);
                        return (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                    <p className="text-sm text-slate-500">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">My Appointments</h2>
                            <button onClick={() => setShowBookingModal(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
                                <Plus className="w-4 h-4" /> Book New
                            </button>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>No appointments found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((appt) => (
                                    <div key={appt._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:border-primary-200">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-2 rounded-lg text-center min-w-[60px] shadow-sm">
                                                <div className="text-xs text-slate-500 font-bold uppercase">{new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                                                <div className="text-lg font-bold text-slate-900">{new Date(appt.date).getDate()}</div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{appt.doctor?.user?.name || 'Doctor'}</h4>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {appt.time} • {appt.status}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {appt.status === 'confirmed' && (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Confirmed</span>
                                            )}
                                            {appt.status === 'pending' && (
                                                <>
                                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                                                    <button
                                                        onClick={() => cancelAppointment(appt._id)}
                                                        className="text-xs text-red-600 font-semibold hover:underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {appt.status === 'cancelled' && (
                                                <span className="bg-red-50 text-red-400 px-3 py-1 rounded-full text-xs font-bold">Cancelled</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Status */}
                <div className="space-y-6">
                    <div className="bg-linear-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Need a Checkup?</h3>
                            <p className="text-primary-100 text-sm mb-4">Our AI scheduling assistant can help you find the best time.</p>
                            <button onClick={() => setShowBookingModal(true)} className="bg-white text-primary-600 px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-primary-50 transition-colors">
                                Find Availability
                            </button>
                        </div>
                        <Activity className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-400" /> Recent Prescriptions
                        </h3>
                        <p className="text-sm text-slate-500 italic">No recent prescriptions available.</p>
                    </div>
                </div>
            </div>

            {/* Profile Creation Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="bg-primary-600 p-4 text-white">
                            <h2 className="text-xl font-bold">Complete Your Profile</h2>
                            <p className="text-primary-100 text-sm">We need a few details to manage your health records.</p>
                        </div>
                        <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input required type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} className="w-full p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                                    <input required type="number" value={profileData.age} onChange={e => setProfileData({ ...profileData, age: e.target.value })} className="w-full p-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                    <select value={profileData.gender} onChange={e => setProfileData({ ...profileData, gender: e.target.value })} className="w-full p-2 border rounded-lg">
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                                    <input placeholder="e.g. O+" value={profileData.bloodGroup} onChange={e => setProfileData({ ...profileData, bloodGroup: e.target.value })} className="w-full p-2 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                <input required type="tel" value={profileData.contact} onChange={e => setProfileData({ ...profileData, contact: e.target.value })} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea required rows="2" value={profileData.address} onChange={e => setProfileData({ ...profileData, address: e.target.value })} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                                    Save & Continue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="bg-primary-600 p-4 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Book Appointment</h2>
                                <p className="text-primary-100 text-sm">Select a doctor and time slot.</p>
                            </div>
                            <button onClick={() => setShowBookingModal(false)} className="text-white hover:bg-primary-700 p-1 rounded-full transition-colors">
                                <div className="text-2xl leading-none">&times;</div>
                            </button>
                        </div>
                        <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={bookingData.doctorId}
                                    onChange={e => setBookingData({ ...bookingData, doctorId: e.target.value })}
                                >
                                    <option value="">-- Choose a Doctor --</option>
                                    {doctors.length === 0 ? (
                                        <option value="" disabled>No doctors available. Please contact admin.</option>
                                    ) : (
                                        doctors.map(doc => (
                                            <option key={doc._id} value={doc._id}>
                                                {doc.user?.name || 'Dr. ' + doc.specialization} - {doc.specialization || 'General'}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full p-2 border rounded-lg"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingData.date}
                                        onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full p-2 border rounded-lg"
                                        value={bookingData.time}
                                        onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms / Reason</label>
                                <textarea
                                    required
                                    rows="2"
                                    placeholder="Briefly describe your symptoms..."
                                    className="w-full p-2 border rounded-lg"
                                    value={bookingData.symptoms}
                                    onChange={e => setBookingData({ ...bookingData, symptoms: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PatientDashboard;
