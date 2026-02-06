import { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Lock, Star, AlertCircle, Info, Plus, Trash2, Clock
} from 'lucide-react';
import { ETHIOPIAN_MONTHS, toEthiopian, getDaysInEthMonth } from '../utils/ethiopianDate';
import api from '../services/api';

const EthiopianCalendar = ({ onDateSelect, userRole, showAdminControls = false }) => {
    const todayEth = toEthiopian(new Date());
    const [currentMonth, setCurrentMonth] = useState(todayEth.month);
    const [currentYear, setCurrentYear] = useState(todayEth.year);
    const [closures, setClosures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddClosure, setShowAddClosure] = useState(false);
    const [newClosure, setNewClosure] = useState({
        title: '',
        date: '',
        type: 'Holiday',
        isFullDay: true,
        startTime: '09:00',
        endTime: '17:00'
    });

    useEffect(() => {
        fetchClosures();
    }, []);

    const fetchClosures = async () => {
        try {
            const { data } = await api.get('/calendar/closures');
            setClosures(data);
        } catch (error) {
            console.error('Error fetching closures:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClosure = async (e) => {
        e.preventDefault();
        try {
            await api.post('/calendar/closures', newClosure);
            setShowAddClosure(false);
            fetchClosures();
            alert('Closure added successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add closure');
        }
    };

    const handleDeleteClosure = async (id) => {
        if (!window.confirm('Remove this closure?')) return;
        try {
            await api.delete(`/calendar/closures/${id}`);
            fetchClosures();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const nextMonth = () => {
        if (currentMonth === 13) {
            setCurrentMonth(1);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const prevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(13);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const daysInMonth = getDaysInEthMonth(currentMonth, currentYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDayStatus = (day) => {
        return closures.find(c =>
            c.ethDate?.day === day &&
            c.ethDate?.month === currentMonth &&
            c.ethDate?.year === currentYear
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-primary-600 p-6 text-white text-center relative">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold font-display">{ETHIOPIAN_MONTHS[currentMonth - 1]}</h2>
                        <p className="text-primary-100 font-medium">{currentYear} (E.C)</p>
                    </div>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {showAdminControls && (
                    <button
                        onClick={() => setShowAddClosure(true)}
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                        title="Add Clinic Closure"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Days Grid */}
            <div className="p-6">
                <div className="grid grid-cols-5 md:grid-cols-7 gap-3">
                    {days.map(day => {
                        const status = getDayStatus(day);
                        const isToday = todayEth.day === day && todayEth.month === currentMonth && todayEth.year === currentYear;

                        return (
                            <div
                                key={day}
                                onClick={() => !status?.isFullDay && onDateSelect?.(day, currentMonth, currentYear)}
                                className={`
                                    relative p-4 rounded-2xl border transition-all group cursor-pointer
                                    ${status?.isFullDay
                                        ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 cursor-not-allowed'
                                        : status
                                            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary-400'
                                    }
                                    ${isToday ? 'ring-2 ring-primary-500' : ''}
                                `}
                            >
                                <span className={`text-lg font-bold ${status?.isFullDay ? 'text-red-600' : status ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {day}
                                </span>

                                {status && (
                                    <div className="absolute top-2 right-2">
                                        {status.type === 'Holiday' ? <Star className="w-3 h-3 text-red-400" /> : <Lock className="w-3 h-3 text-orange-400" />}
                                    </div>
                                )}

                                {status && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 rounded-2xl p-2 text-center">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-800 dark:text-white leading-tight">
                                                {status.title}
                                            </p>
                                            <p className="text-[8px] text-slate-500">{status.isFullDay ? 'Closed' : 'Partial'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-8 flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-slate-100 dark:border-slate-700 pt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div>
                        <span>Clinic Holiday</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded-sm"></div>
                        <span>Ceremony / Partial</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-primary-500 rounded-sm"></div>
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Add Closure Modal */}
            {showAddClosure && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Schedule Clinic Closure</h3>
                        <form onSubmit={handleAddClosure} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title / Reason</label>
                                <input
                                    required type="text"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl"
                                    value={newClosure.title}
                                    onChange={e => setNewClosure({ ...newClosure, title: e.target.value })}
                                    placeholder="e.g. Meskel Ceremony"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gregorian Date</label>
                                    <input
                                        required type="date"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl"
                                        value={newClosure.date}
                                        onChange={e => setNewClosure({ ...newClosure, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Closure Type</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl"
                                        value={newClosure.type}
                                        onChange={e => setNewClosure({ ...newClosure, type: e.target.value })}
                                    >
                                        <option value="Holiday">Holiday</option>
                                        <option value="Ceremony">Ceremony</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 py-2">
                                <input
                                    type="checkbox"
                                    checked={newClosure.isFullDay}
                                    onChange={e => setNewClosure({ ...newClosure, isFullDay: e.target.checked })}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Is this a full-day closure?</span>
                            </div>

                            <div className="flex gap-4">
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg">Save Closure</button>
                                <button type="button" onClick={() => setShowAddClosure(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EthiopianCalendar;
