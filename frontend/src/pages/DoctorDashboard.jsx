import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Calendar, Users, Clock, CheckCircle, FileText, Activity, Brain } from 'lucide-react';
import api from '../services/api';

const DoctorDashboard = () => {
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Clinical Data Form State
    const [clinicalData, setClinicalData] = useState({
        diagnosis: '',
        visitNotes: '',
        prescription: ''
    });

    const fetchData = async () => {
        try {
            const [statsReq, apptReq, recReq] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/appointments'),
                api.get('/ai/recommend-patients')
            ]);
            setStats(statsReq.data);
            setAppointments(apptReq.data);
            setRecommendations(recReq.data);
        } catch (error) {
            console.error("Error fetching doctor data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/appointments/${id}`, { status: newStatus });
            setAppointments(appointments.map(appt =>
                appt._id === id ? { ...appt, status: newStatus } : appt
            ));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleAiSummary = async () => {
        if (!clinicalData.visitNotes) {
            alert("Please enter some notes to summarize.");
            return;
        }
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/summarize-notes', { notes: clinicalData.visitNotes });
            setClinicalData(prev => ({
                ...prev,
                visitNotes: prev.visitNotes + "\n\n" + data.summary
            }));
        } catch (error) {
            alert("AI Summarization failed");
        } finally {
            setAiLoading(false);
        }
    };

    const handleClinicalSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/appointments/${selectedAppointment._id}`, {
                ...clinicalData,
                status: 'completed'
            });
            setShowClinicalModal(false);
            alert("Consultation completed & notes saved.");
            fetchData();
        } catch (error) {
            alert("Failed to save clinical data");
        }
    };

    const openClinicalModal = (appt) => {
        setSelectedAppointment(appt);
        setClinicalData({
            diagnosis: appt.diagnosis || '',
            visitNotes: appt.visitNotes || '',
            prescription: appt.prescription?.[0]?.instructions || ''
        });
        setShowClinicalModal(true);
    };

    const [showClinicalModal, setShowClinicalModal] = useState(false);

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Syncing Clinic Data...</p>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">Doctor Dashboard</h1>
                    <p className="text-slate-500 mt-2">Manage your schedule and patient clinical records.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Brain className="w-4 h-4" /> AI Assisted
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Calendar className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats?.appointments?.today || 0}</h3>
                        <p className="text-sm text-slate-500">Today's Appts</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-xl text-green-600"><Users className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats?.users?.totalPatients || 0}</h3>
                        <p className="text-sm text-slate-500">Total Patients</p>
                    </div>
                </div>
            </div>

            {/* AI Recommendations Panel */}
            {recommendations && recommendations.patients?.length > 0 && (
                <div className="bg-indigo-900 rounded-2xl p-6 text-white mb-10 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-indigo-300" />
                            AI Suggested Follow-ups ({recommendations.specialization})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendations.patients.map((patient, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                                    <h4 className="font-bold">{patient.name}</h4>
                                    <p className="text-indigo-200 text-sm mb-2">Trigger: {patient.triggerSymptom}</p>
                                    <button className="text-xs bg-white text-indigo-900 px-3 py-1 rounded-lg font-bold">Contact Patient</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Activity className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
                </div>
            )}

            {/* Appointments List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">Upcoming Appointments</h2>

                {appointments.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No appointments scheduled.</p>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appt) => (
                            <div key={appt._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                {/* Time & Date */}
                                <div className="md:col-span-2 text-center md:text-left">
                                    <div className="text-lg font-bold text-slate-900">{appt.time}</div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">{new Date(appt.date).toLocaleDateString()}</div>
                                </div>

                                {/* Patient Info */}
                                <div className="md:col-span-4">
                                    <h4 className="font-bold text-slate-900 text-lg">{appt.patient?.name || 'Unknown Patient'}</h4>
                                    <p className="text-sm text-slate-500">Reason: {appt.symptoms || 'General Checkup'}</p>
                                </div>

                                {/* Status Badge */}
                                <div className="md:col-span-2">
                                    {appt.status === 'confirmed' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Confirmed</span>}
                                    {appt.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>}
                                    {appt.status === 'completed' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Completed</span>}
                                    {appt.status === 'cancelled' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Cancelled</span>}
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-4 flex justify-end gap-2">
                                    {appt.status === 'pending' && (
                                        <button onClick={() => handleUpdateStatus(appt._id, 'confirmed')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                                            Confirm
                                        </button>
                                    )}
                                    {['confirmed', 'completed'].includes(appt.status) && (
                                        <button onClick={() => openClinicalModal(appt)} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Consultation
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Clinical Modal */}
            {showClinicalModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">Clinical Consultation</h2>
                                <p className="text-slate-400 text-sm">Patient: {selectedAppointment.patient?.name}</p>
                            </div>
                            <button onClick={() => setShowClinicalModal(false)} className="text-white hover:text-slate-300">
                                <div className="text-2xl leading-none">&times;</div>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="clinical-form" onSubmit={handleClinicalSubmit} className="space-y-6">
                                {/* Patient Summary Section (Read Only) */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-700 mb-2 text-sm uppercase">Patient Reported Symptoms</h3>
                                    <p className="text-slate-900">{selectedAppointment.symptoms || "No symptoms provided."}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Diagnosis</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Acute Viral Bronchitis"
                                        value={clinicalData.diagnosis}
                                        onChange={e => setClinicalData({ ...clinicalData, diagnosis: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-bold text-slate-700">Visit Notes & Observations</label>
                                        <button
                                            type="button"
                                            onClick={handleAiSummary}
                                            disabled={aiLoading}
                                            className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800 disabled:opacity-50"
                                        >
                                            <Brain className="w-3 h-3" />
                                            {aiLoading ? 'Summarizing...' : 'AI Auto-Summarize'}
                                        </button>
                                    </div>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Detailed clinical observations..."
                                        value={clinicalData.visitNotes}
                                        onChange={e => setClinicalData({ ...clinicalData, visitNotes: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Prescription (Quick Note)</label>
                                    <textarea
                                        rows="2"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                        placeholder="e.g. Amoxicillin 500mg - 1 tablet every 8 hours for 5 days"
                                        value={clinicalData.prescription}
                                        onChange={e => setClinicalData({ ...clinicalData, prescription: e.target.value })}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 shrink-0 bg-white">
                            <button form="clinical-form" type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                                <CheckCircle className="w-5 h-5" /> Complete Consultation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DoctorDashboard;
