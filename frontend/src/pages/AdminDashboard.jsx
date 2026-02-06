import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import {
    Users, Shield, Activity, AlertTriangle, CheckCircle, Search,
    DollarSign, Calendar, Clock, TrendingUp, FileText, Download,
    ChevronDown, Filter, RefreshCw, UserCheck, Stethoscope, Building,
    Bell, Info, ChevronRight, AlertCircle
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [securityStatus, setSecurityStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [logFilters, setLogFilters] = useState({
        action: '',
        dateRange: '7days'
    });
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',
    });
    const [capacityData, setCapacityData] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [broadcast, setBroadcast] = useState({ message: '', type: 'SYSTEM', link: '' });
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsReq, usersReq, secReq, logsReq] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/admin/users'),
                api.get('/ai/security-alerts').catch(() => ({ data: { status: 'SECURE' } })),
                api.get('/admin/audit-logs')
            ]);
            setStats(statsReq.data);
            setUsers(usersReq.data.users || usersReq.data);
            setSecurityStatus(secReq.data);
            setLogs(logsReq.data || []);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
            await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
        } catch (error) {
            alert("Failed to update user status");
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: currentStatus } : u));
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/admin/users', newUser);
            setUsers([data, ...users]);
            setShowCreateModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'patient' });
            alert(`User ${data.name} created successfully!`);
        } catch (error) {
            alert("Failed to create user: " + (error.response?.data?.message || error.message));
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const runCapacityAnalysis = async () => {
        setAnalyzing(true);
        try {
            const { data } = await api.post('/ai/analyze-schedule');
            setCapacityData(data);
        } catch (error) {
            console.error("Analysis failed", error);
            const msg = error.response?.data?.message || "Capacity analysis requires elevated AI permissions.";
            alert(`Access Denied: ${msg}`);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcast.message) return;

        setSendingBroadcast(true);
        try {
            await api.post('/dashboard/notifications/broadcast', broadcast);
            alert('Notification broadcasted successfully!');
            setBroadcast({ message: '', type: 'SYSTEM', link: '' });
        } catch (error) {
            console.error('Broadcast failed', error);
            alert('Failed to send broadcast');
        } finally {
            setSendingBroadcast(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (logFilters.action && log.action !== logFilters.action) return false;
        return true;
    });

    const getRoleBadgeColor = (role) => {
        const colors = {
            superAdmin: 'bg-red-100 text-red-800',
            admin: 'bg-purple-100 text-purple-800',
            doctor: 'bg-blue-100 text-blue-800',
            receptionist: 'bg-amber-100 text-amber-800',
            patient: 'bg-slate-100 text-slate-800'
        };
        return colors[role] || 'bg-slate-100 text-slate-800';
    };

    const getActionBadgeColor = (action) => {
        if (action.includes('DELETE') || action.includes('DEACTIVATE')) return 'bg-red-100 text-red-700';
        if (action.includes('CREATE') || action.includes('REGISTER')) return 'bg-green-100 text-green-700';
        if (action.includes('UPDATE') || action.includes('MODIFY')) return 'bg-blue-100 text-blue-700';
        if (action.includes('LOGIN')) return 'bg-indigo-100 text-indigo-700';
        if (action.includes('AI_')) return 'bg-purple-100 text-purple-700';
        return 'bg-slate-100 text-slate-700';
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading Admin Dashboard...</p>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">System Administration</h1>
                    <p className="text-slate-500 mt-1">Monitor system health, manage users, and view analytics.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh Data
                </button>
            </div>

            {/* Security Alert Banner */}
            {securityStatus?.status === 'RISK_DETECTED' && (
                <div className="bg-linear-to-r from-red-500 to-red-600 text-white p-5 rounded-2xl mb-8 flex items-start gap-4 shadow-lg shadow-red-500/30">
                    <div className="bg-white/20 p-3 rounded-xl">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Security Risk Detected</h3>
                        <p className="text-red-100">{securityStatus.recommendation}</p>
                        <ul className="list-disc list-inside text-red-200 text-sm mt-2">
                            {securityStatus.anomalies?.lockedAccounts?.length > 0 && (
                                <li>{securityStatus.anomalies.lockedAccounts.length} Locked Account(s)</li>
                            )}
                            {securityStatus.anomalies?.criticalActionsLastHour > 5 && (
                                <li>{securityStatus.anomalies.criticalActionsLastHour} Critical Actions in Last Hour</li>
                            )}
                        </ul>
                    </div>
                    <Link
                        to={JSON.parse(localStorage.getItem('user'))?.role === 'superAdmin' ? "/super-admin/settings" : "/settings"}
                        className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
                    >
                        View Settings
                    </Link>
                </div>
            )}

            {securityStatus?.status === 'CAUTION' && (
                <div className="bg-linear-to-r from-amber-400 to-amber-500 text-white p-4 rounded-2xl mb-8 flex items-center gap-4">
                    <AlertTriangle className="w-6 h-6" />
                    <div className="flex-1">
                        <h3 className="font-bold">System Caution</h3>
                        <p className="text-amber-100 text-sm">{securityStatus.recommendation}</p>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 border-b border-slate-200 pb-4 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'users', label: 'Users', icon: Users },
                    { id: 'billing', label: 'Billing', icon: DollarSign },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'logs', label: 'Audit Logs', icon: FileText }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === tab.id
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {stats?.stats?.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-${stat.color || 'blue'}-50 text-${stat.color || 'blue'}-600`}>
                                        {stat.icon === 'Users' && <Users className="w-6 h-6" />}
                                        {stat.icon === 'Calendar' && <Calendar className="w-6 h-6" />}
                                        {stat.icon === 'Clock' && <Clock className="w-6 h-6" />}
                                        {stat.icon === 'DollarSign' && <DollarSign className="w-6 h-6" />}
                                        {stat.icon === 'CheckCircle' && <CheckCircle className="w-6 h-6" />}
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Users by Role */}
                    {stats?.usersByRole && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Users by Role</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <Stethoscope className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-slate-700">Doctors</span>
                                        </div>
                                        <span className="text-2xl font-bold text-slate-900">{stats.usersByRole.doctors}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <UserCheck className="w-5 h-5 text-green-600" />
                                            </div>
                                            <span className="font-medium text-slate-700">Patients</span>
                                        </div>
                                        <span className="text-2xl font-bold text-slate-900">{stats.usersByRole.patients}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-100 p-2 rounded-lg">
                                                <Building className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <span className="font-medium text-slate-700">Receptionists</span>
                                        </div>
                                        <span className="text-2xl font-bold text-slate-900">{stats.usersByRole.receptionists}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-100 p-2 rounded-lg">
                                                <Shield className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <span className="font-medium text-slate-700">Admins</span>
                                        </div>
                                        <span className="text-2xl font-bold text-slate-900">{stats.usersByRole.admins}</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Operations Insight */}
                            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary-400" /> AI Operations Insight
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/5">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">System Stability</p>
                                                <p className="text-xl font-black text-green-400">OPTIMAL</p>
                                            </div>
                                            <Activity className="w-8 h-8 text-green-400/50" />
                                        </div>
                                        <p className="text-sm text-slate-300 italic">
                                            {capacityData ? `"${capacityData.recommendation}"` : '"Clinic load is currently balanced. Recommend prioritizing General Medicine slots for upcoming post-ceremony peaks."'}
                                        </p>
                                        <button
                                            onClick={runCapacityAnalysis}
                                            disabled={analyzing}
                                            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                        >
                                            {analyzing ? 'Analyzing Load...' : 'Run Capacity Analysis'}
                                        </button>
                                    </div>
                                </div>
                                <Activity className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
                            </div>

                            {/* Billing Summary */}
                            {stats?.billing && (
                                <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" /> Revenue Overview
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                                            <p className="text-emerald-100 text-sm">Today's Revenue</p>
                                            <p className="text-2xl font-bold">{stats.billing.todayRevenue} ETB</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                                            <p className="text-emerald-100 text-sm">Monthly Revenue</p>
                                            <p className="text-2xl font-bold">{stats.billing.monthlyRevenue} ETB</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl col-span-2">
                                            <p className="text-emerald-100 text-sm">Pending Invoices</p>
                                            <p className="text-2xl font-bold">{stats.billing.pendingInvoices}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/billing"
                                        className="mt-4 inline-flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold hover:bg-emerald-50 transition-colors"
                                    >
                                        View All Invoices →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Appointment Summary */}
                    {stats?.appointments && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Appointment Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <p className="text-3xl font-bold text-blue-600">{stats.appointments.today}</p>
                                    <p className="text-sm text-blue-700 mt-1">Today's Appointments</p>
                                </div>
                                <div className="text-center p-4 bg-amber-50 rounded-xl">
                                    <p className="text-3xl font-bold text-amber-600">{stats.appointments.pending}</p>
                                    <p className="text-sm text-amber-700 mt-1">Pending Confirmation</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-xl">
                                    <p className="text-3xl font-bold text-green-600">{stats.appointments.completedThisMonth}</p>
                                    <p className="text-sm text-green-700 mt-1">Completed This Month</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900">User Management</h2>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-primary-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <Users className="w-4 h-4" /> Add User
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">User</th>
                                    <th className="px-6 py-4 text-left">Role</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-left">Last Login</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{user.name}</div>
                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-bold">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-red-500 text-sm font-bold">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleUserStatus(user._id, user.isActive)}
                                                className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-colors ${user.isActive
                                                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                                                    }`}
                                            >
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Financial Overview</h2>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100 transition-colors">
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                        </div>

                        {stats?.billing ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-linear-to-br from-green-500 to-emerald-600 p-6 rounded-xl text-white">
                                    <p className="text-green-100 text-sm mb-1">Today's Revenue</p>
                                    <p className="text-3xl font-bold">${stats.billing.todayRevenue}</p>
                                </div>
                                <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
                                    <p className="text-blue-100 text-sm mb-1">Monthly Revenue</p>
                                    <p className="text-3xl font-bold">${stats.billing.monthlyRevenue}</p>
                                </div>
                                <div className="bg-linear-to-br from-amber-500 to-orange-600 p-6 rounded-xl text-white">
                                    <p className="text-amber-100 text-sm mb-1">Pending Invoices</p>
                                    <p className="text-3xl font-bold">{stats.billing.pendingInvoices}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">No billing data available yet.</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link to="/billing" className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">View All Invoices</p>
                                    <p className="text-sm text-slate-500">Manage patient billing</p>
                                </div>
                            </Link>
                            <Link to="/billing" className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Financial Reports</p>
                                    <p className="text-sm text-slate-500">View revenue analytics</p>
                                </div>
                            </Link>
                            <Link to="/billing" className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <Download className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Export Data</p>
                                    <p className="text-sm text-slate-500">Download CSV reports</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'logs' && (
                // ... existing logs table ...
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900">System Audit Logs</h2>
                        <div className="flex gap-3">
                            <select
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={logFilters.action}
                                onChange={(e) => setLogFilters({ ...logFilters, action: e.target.value })}
                            >
                                <option value="">All Actions</option>
                                <option value="LOGIN">Login</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                                <option value="AI_USAGE">AI Usage</option>
                            </select>
                            <select
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={logFilters.dateRange}
                                onChange={(e) => setLogFilters({ ...logFilters, dateRange: e.target.value })}
                            >
                                <option value="today">Today</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 text-left">Timestamp</th>
                                    <th className="px-6 py-4 text-left">Action</th>
                                    <th className="px-6 py-4 text-left">User</th>
                                    <th className="px-6 py-4 text-left">Resource</th>
                                    <th className="px-6 py-4 text-left">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs && filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                                            <div className="text-xs">
                                                <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                                                <div className="text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-slate-900">{log.user?.name || 'System'}</div>
                                            <div className="text-xs text-slate-400">{log.user?.email || ''}</div>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">
                                            {log.resource}
                                        </td>
                                        <td className="px-6 py-3 text-slate-500 max-w-xs truncate">
                                            {log.resourceId ? `ID: ...${log.resourceId.toString().slice(-8)}` : '-'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                            <p>No audit logs found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
                                <Bell className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Broadcast Notification</h2>
                        </div>

                        <form onSubmit={handleBroadcast} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                                <textarea
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    rows="4"
                                    placeholder="Enter your announcement here..."
                                    value={broadcast.message}
                                    onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Notice Type</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                        value={broadcast.type}
                                        onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value })}
                                    >
                                        <option value="SYSTEM">System Alert</option>
                                        <option value="APPOINTMENT">Appointment Update</option>
                                        <option value="REMINDER">General Reminder</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Link (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="/billing, /appointments"
                                        value={broadcast.link}
                                        onChange={(e) => setBroadcast({ ...broadcast, link: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={sendingBroadcast || !broadcast.message}
                                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sendingBroadcast ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Sending Broadcast...
                                    </>
                                ) : (
                                    <>
                                        <ChevronRight className="w-5 h-5" /> Send to All Users
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Info className="w-5 h-5 text-slate-400" /> Recent Broadcasts
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
                                <div className="p-2 bg-white rounded-lg h-fit shadow-sm">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Clinic will be closed this Friday for local holiday celebrations. All appointments will be rescheduled.</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Sent 2 days ago • System</p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
                                <div className="p-2 bg-white rounded-lg h-fit shadow-sm">
                                    <Info className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">New laboratory test results are now available in your patient portal.</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Sent 5 days ago • Reminder</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-linear-to-r from-primary-600 to-primary-700 p-5 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">Create New User</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                                <select
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="receptionist">Receptionist</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                            >
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;
