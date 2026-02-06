import { useState } from 'react';
import Layout from '../components/Layout';
import EthiopianCalendar from '../components/EthiopianCalendar';
import { Calendar as CalendarIcon, Info, Users, Clock, AlertTriangle } from 'lucide-react';

const CalendarPage = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const [selectedDateInfo, setSelectedDateInfo] = useState(null);

    const handleDateSelect = (day, month, year) => {
        setSelectedDateInfo({ day, month, year });
    };

    const isAdmin = ['admin', 'superAdmin'].includes(user.role);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-primary-600" /> Clinic Calendar
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Official Ethiopian Schedule, Ceremonies & Clinic Holidays</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Calendar View */}
                <div className="lg:col-span-2">
                    <EthiopianCalendar
                        onDateSelect={handleDateSelect}
                        userRole={user.role}
                        showAdminControls={isAdmin}
                    />
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary-600" /> Ethiopian Calendar Rules
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">13 Months</p>
                                    <p className="text-sm text-slate-500">12 months of 30 days and 1 month (Pagume) of 5-6 days.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Holiday Guard</p>
                                    <p className="text-sm text-slate-500">Booking is automatically disabled on all highlighted clinic holidays.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Assistance Mockup (Safe & Assistive) */}
                    <div className="bg-linear-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold">Smart Scheduling</h4>
                        </div>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                            Our AI suggests scheduling checkups 1 week after major ceremonies to avoid clinic rush hours.
                        </p>
                        <div className="p-4 bg-white/10 rounded-xl border border-white/10 text-xs">
                            <p className="font-bold mb-1 italic opacity-80 underline underline-offset-4">AI Disclaimer</p>
                            <p>Information provided is for assistive organizational purposes only.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CalendarPage;
