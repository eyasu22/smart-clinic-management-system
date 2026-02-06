import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import {
    Users, Search, Plus, Filter,
    MoreHorizontal, User, Mail, Phone, MapPin,
    Calendar, Activity, ChevronRight, Eye, Edit, Trash2,
    CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import api from '../services/api';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    const [newPatient, setNewPatient] = useState({
        name: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'Unknown',
        contact: { phone: '' },
        address: '',
        medicalHistory: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/patients');
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            const historyArray = newPatient.medicalHistory.split(',').map(item => item.trim()).filter(i => i !== '');
            await api.post('/patients', { ...newPatient, medicalHistory: historyArray });
            setShowCreateModal(false);
            setNewPatient({ name: '', age: '', gender: 'Male', bloodGroup: 'Unknown', contact: { phone: '' }, address: '', medicalHistory: '' });
            fetchPatients();
            alert('Patient record created successfully!');
        } catch (error) {
            alert('Failed to create patient: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeletePatient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this patient record?')) return;
        try {
            await api.delete(`/patients/${id}`);
            fetchPatients();
            setSelectedPatient(null);
        } catch (error) {
            alert('Failed to delete patient: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const canEdit = ['admin', 'superAdmin', 'receptionist'].includes(user.role);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">Patient Directory</h1>
                    <p className="text-slate-500 mt-1">Manage, search, and view patient clinical history.</p>
                </div>
                {['admin', 'superAdmin', 'receptionist'].includes(user.role) && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
                    >
                        <Plus className="w-5 h-5" /> Register Patient
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or Patient ID..."
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button
                        onClick={fetchPatients}
                        className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white h-48 rounded-2xl border border-slate-100"></div>
                    ))}
                </div>
            ) : filteredPatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient) => (
                        <div
                            key={patient._id}
                            onClick={() => setSelectedPatient(patient)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-linear-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/20">
                                    {getInitials(patient.name)}
                                </div>
                                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                                    {patient.uniqueId}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{patient.name}</h3>
                            <div className="flex gap-4 mt-2 text-sm text-slate-500">
                                <span>{patient.age} years</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full my-auto"></span>
                                <span>{patient.gender}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full my-auto"></span>
                                <span className="text-primary-600 font-bold">{patient.bloodGroup}</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {patient.medicalHistory?.slice(0, 2).map((item, i) => (
                                    <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-red-50 text-red-600 rounded-md">
                                        {item}
                                    </span>
                                ))}
                                {patient.medicalHistory?.length > 2 && (
                                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                                        +{patient.medicalHistory.length - 2} more
                                    </span>
                                )}
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center text-primary-600 font-bold text-sm">
                                View Profile <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-3xl shadow-sm border border-slate-100 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">No patients found</h2>
                    <p className="text-slate-500 mt-2">Try adjusting your search term or register a new patient.</p>
                </div>
            )}

            {/* Patient Detail Slide-over */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPatient(null)} />
                    <div className="absolute inset-y-0 right-0 max-w-2xl w-full flex">
                        <div className="relative w-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                            <div className="h-full flex flex-col">
                                {/* Side-over Header */}
                                <div className="bg-primary-600 p-8 text-white">
                                    <div className="flex justify-between items-start mb-6">
                                        <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                        <div className="flex gap-2">
                                            {canEdit && (
                                                <>
                                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDeletePatient(selectedPatient._id)} className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-red-100">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-bold">
                                            {getInitials(selectedPatient.name)}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold font-display">{selectedPatient.name}</h2>
                                            <p className="text-primary-100 flex items-center gap-2 mt-1">
                                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono">{selectedPatient.uniqueId}</span>
                                                <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                                                <span>Registered {new Date(selectedPatient.createdAt).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Slide-over Content */}
                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="grid grid-cols-2 gap-8 mb-10">
                                        <div>
                                            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">Patient Info</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span>{selectedPatient.age} yrs, {selectedPatient.gender}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <Activity className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold text-red-600">Blood Group: {selectedPatient.bloodGroup}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">Contact Details</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span>{selectedPatient.contact?.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span>{selectedPatient.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">Medical History</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPatient.medicalHistory?.length > 0 ? (
                                                selectedPatient.medicalHistory.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-medium border border-red-100">
                                                        <AlertCircle className="w-4 h-4" /> {item}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-slate-400 italic">No medical history recorded.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">Recent Activity</h4>
                                        <div className="bg-slate-50 rounded-2xl p-6 text-center">
                                            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">Log into the appointment section to view clinical visits for this patient.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-slate-100 flex gap-4">
                                    <button
                                        onClick={() => navigate('/appointments')}
                                        className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/20"
                                    >
                                        Schedule Appointment
                                    </button>
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Register Patient Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="bg-linear-to-r from-primary-600 to-primary-700 p-6 text-white flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Register New Patient</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white transition-colors text-3xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleCreatePatient} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                    <input required type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                                        <input required type="number" className="w-full p-3 border border-slate-200 rounded-xl" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                                        <select className="w-full p-3 border border-slate-200 rounded-xl" value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Contact Phone</label>
                                    <input required type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newPatient.contact.phone} onChange={e => setNewPatient({ ...newPatient, contact: { phone: e.target.value } })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Blood Group</label>
                                    <select className="w-full p-3 border border-slate-200 rounded-xl" value={newPatient.bloodGroup} onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}>
                                        <option value="Unknown">Unknown</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Residential Address</label>
                                <textarea className="w-full p-3 border border-slate-200 rounded-xl" rows="2" value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Medical History (Comma separated)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                    rows="2"
                                    placeholder="e.g. Diabetes, Hypertension, Nut Allergy"
                                    value={newPatient.medicalHistory}
                                    onChange={e => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition shadow-xl shadow-primary-500/30">
                                Register Patient Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Patients;
