import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import {
    Users, Calendar, Clock, CheckCircle, Search,
    UserPlus, Filter, RefreshCw, AlertCircle, MapPin
} from 'lucide-react';
import api from '../services/api';

const ReceptionistDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeQueue, setActiveQueue] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/appointments');
            const today = new Date().toISOString().split('T')[0];
            const todayAppts = data.filter(a => a.date === today);
            setAppointments(todayAppts);

            // Focus on checked-in queue
            const inQueue = todayAppts
                .filter(a => a.checkedInAt)
                .sort((a, b) => a.queuePosition - b.queuePosition);
            setActiveQueue(inQueue);
        } catch (error) {
            console.error("Error fetching receptionist data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (apptId) => {
        try {
            await api.put(`/appointments/${apptId}/check-in`);
            fetchData();
            alert("Patient checked in and added to queue.");
        } catch (error) {
            alert("Check-in failed: " + (error.response?.data?.message || error.message));
        }
    };

    const handleStatusUpdate = async (apptId, status) => {
        try {
            await api.put(`/appointments/${apptId}`, { status });
            fetchData();
        } catch (error) {
            alert("Update failed");
        }
    };

    const confirmAppointments = appointments.filter(a => a.status === 'confirmed' && !a.checkedInAt);
    const otherAppointments = appointments.filter(a => !['confirmed'].includes(a.status) && !a.checkedInAt);

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">Receptionist Desk</h1>
                    <p className="text-slate-500 mt-1">Manage patient arrivals, queue, and today's schedule.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        <RefreshCw className="w-5 h-5 text-slate-600" />
                    </button>
                    <Link to="/patients" className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30">
                        <UserPlus className="w-5 h-5" /> New Patient
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LIVE QUEUE - High impact feature */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-400" /> Live Clinic Queue
                            </h2>
                            {activeQueue.length === 0 ? (
                                <div className="text-center py-8 opacity-50">
                                    <Users className="w-12 h-12 mx-auto mb-3" />
                                    <p>No patients in queue</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeQueue.map((appt, idx) => (
                                        <div key={appt._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center font-bold text-lg">
                                                    {appt.queuePosition}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{appt.patient?.name}</p>
                                                    <p className="text-xs text-slate-400">Dr. {appt.doctor?.user?.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                                WAITING
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Activity className="absolute -right-20 -bottom-20 w-80 h-80 text-white/5" />
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">Today's Performance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Waitlisted</span>
                                <span className="font-bold text-slate-900">{activeQueue.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Check-ins Pending</span>
                                <span className="font-bold text-slate-900">{confirmAppointments.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900">Patient Arrival Desk</h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Arrivals List */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Expected Now</h3>
                            {confirmAppointments.length === 0 && (
                                <p className="text-center py-8 text-slate-400 italic">No confirmed appointments pending check-in.</p>
                            )}
                            {confirmAppointments.map((appt) => (
                                <div key={appt._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary-200 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-xl font-black text-slate-900">{appt.time}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Scheduled</div>
                                        </div>
                                        <div className="h-10 w-px bg-slate-200"></div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{appt.patient?.name}</h4>
                                            <p className="text-sm text-slate-500">Dr. {appt.doctor?.user?.name} ({appt.doctor?.specialization})</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCheckIn(appt._id)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-primary-100 text-primary-600 rounded-xl font-bold hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Check-in
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="mt-12 space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Other Appointments Today</h3>
                            {otherAppointments.slice(0, 5).map((appt) => (
                                <div key={appt._id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 opacity-60">
                                    <div className="flex items-center gap-4">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700">{appt.time}</span>
                                        <span className="text-sm text-slate-600">{appt.patient?.name}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        appt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {appt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReceptionistDashboard;
