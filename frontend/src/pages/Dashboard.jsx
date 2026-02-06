import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';
import api from '../services/api';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Role-Based Redirects
    if (user.role === 'patient') return <PatientDashboard />;
    if (user.role === 'doctor') return <DoctorDashboard />;
    if (user.role === 'receptionist') return <ReceptionistDashboard />;
    if (user.role === 'admin' || user.role === 'superAdmin') return <AdminDashboard />;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real scenario, use: const { data } = await api.get('/dashboard/stats');
                // For now, let's try the real endpoint we just made
                const { data } = await api.get('/dashboard/stats');
                setStatsData(data);
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        {
            label: 'Total Patients',
            value: loading ? '...' : statsData?.users?.totalPatients?.toString() || '0',
            change: statsData?.users?.change || '+0%',
            icon: Users,
            bgClass: 'bg-primary-50',
            textClass: 'text-primary-600'
        },
        {
            label: 'Active Appointments',
            value: loading ? '...' : statsData?.appointments?.today?.toString() || '0',
            change: statsData?.appointments?.change || '+0',
            icon: Calendar,
            bgClass: 'bg-secondary-50',
            textClass: 'text-secondary-600'
        },
        {
            label: 'Pending Reports',
            value: loading ? '...' : statsData?.reports?.pending?.toString() || '0',
            change: statsData?.reports?.change || '0',
            icon: Activity,
            bgClass: 'bg-orange-50',
            textClass: 'text-orange-600'
        },
        {
            label: 'Revenue',
            value: loading ? '...' : `${statsData?.revenue?.value || 0} ETB`,
            change: statsData?.revenue?.change || '+0%',
            icon: TrendingUp,
            bgClass: 'bg-accent-50',
            textClass: 'text-accent-600'
        },
    ];

    return (
        <Layout>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 font-display">Dashboard</h1>
                <p className="text-slate-500 mt-2 font-light">Welcome back, here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bgClass} ${stat.textClass}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-secondary-50 text-secondary-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1 font-display tracking-tight">{stat.value}</h3>
                        <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 font-display">Today's Schedule</h2>
                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors group cursor-pointer border border-transparent hover:border-primary-100">
                                <div className="flex items-center space-x-5">
                                    <div className="text-center bg-white p-2 rounded-lg shadow-sm font-display min-w-[60px]">
                                        <div className="text-lg font-bold text-slate-900">09:30</div>
                                        <div className="text-xs text-slate-500 font-medium uppercase">AM</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">Sarah Johnson</div>
                                        <div className="text-sm text-slate-500 font-medium">General Checkup • Dr. Smith</div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-lg text-xs font-bold border border-secondary-200">
                                    Confirmed
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 font-display">Quick Actions</h2>
                    <div className="space-y-4 flex-1">
                        <button className="w-full py-4 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            + New Appointment
                        </button>
                        <button className="w-full py-4 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold hover:border-slate-300 flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            Register New Patient
                        </button>
                        <button className="w-full py-4 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold hover:border-slate-300 flex items-center justify-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
