import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, X, Calendar, AlertCircle, Info, ChevronRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        // Setup polling for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/dashboard/notifications');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/dashboard/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/dashboard/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'APPOINTMENT': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'SYSTEM': return <Info className="w-4 h-4 text-amber-500" />;
            case 'REMINDER': return <Clock className="w-4 h-4 text-green-500" />;
            case 'BILLING': return <DollarSign className="w-4 h-4 text-emerald-500" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`p-4 border-b border-slate-50 dark:border-slate-700/50 flex gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 group ${!notif.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                                >
                                    <div className={`mt-1 p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm shrink-0 group-hover:scale-110 transition-transform`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm leading-tight ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {notif.message}
                                            </p>
                                            {!notif.read && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                                                    className="p-1 text-slate-300 hover:text-primary-600 transition-colors cursor-pointer"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                            <Clock className="w-3 h-3" />
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                        </div>
                                        {notif.link && (
                                            <Link
                                                to={notif.link}
                                                onClick={() => setIsOpen(false)}
                                                className="mt-2 text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline cursor-pointer"
                                            >
                                                View Details <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <Bell className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/settings?tab=notifications"
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors uppercase tracking-wider"
                    >
                        Notification Settings
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
