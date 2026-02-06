import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Key, Moon, Sun, Globe, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState({
        name: '', email: '', phone: '', preferences: { notifications: {}, currency: 'ETB', language: 'en' }
    });
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            // Ensure preferences object structure exists
            const safeData = {
                ...data,
                preferences: {
                    notifications: { email: true, sms: false, inApp: true, ...data.preferences?.notifications },
                    currency: data.preferences?.currency || 'ETB',
                    language: data.preferences?.language || 'en'
                }
            };
            setUser(safeData);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', user);
            setUser({ ...user, ...data }); // Update with returned data (including new token if logic changed)
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
            }
            setSuccessMsg('Settings updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Update failed', error);
            alert('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = (key) => {
        setUser(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                notifications: {
                    ...prev.preferences.notifications,
                    [key]: !prev.preferences.notifications[key]
                }
            }
        }));
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your account and preferences.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 p-4">
                        <nav className="space-y-1">
                            {[
                                { id: 'profile', icon: User, label: 'Profile' },
                                { id: 'notifications', icon: Bell, label: 'Notifications' },
                                { id: 'preferences', icon: Globe, label: 'Preferences' },
                                { id: 'security', icon: Shield, label: 'Security' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${activeTab === item.id
                                            ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 md:p-8">
                        {successMsg && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 animate-fadeIn">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleUpdate}>
                            {activeTab === 'profile' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Personal Information</h2>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 text-2xl font-bold">
                                            {user.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <button type="button" className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                                                Change Avatar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                                value={user.name}
                                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                                value={user.email}
                                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                                value={user.phone || ''}
                                                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                                placeholder="+251..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Notification Preferences</h2>
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-4">
                                        {[
                                            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                                            { key: 'sms', label: 'SMS Notifications', desc: 'Receive urgent alerts via SMS' },
                                            { key: 'inApp', label: 'In-App Notifications', desc: 'Show notifications in the dashboard' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-2">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => togglePreference(item.key)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${user.preferences.notifications[item.key] ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                                                        }`}
                                                >
                                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all transform ${user.preferences.notifications[item.key] ? 'left-7' : 'left-1'
                                                        }`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">System Preferences</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Display Mode</label>
                                            <button
                                                type="button"
                                                onClick={toggleTheme}
                                                className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                                    {isDark ? 'Dark Mode' : 'Light Mode'}
                                                </span>
                                                <span className="text-sm text-primary-600 font-bold">Change</span>
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Currency</label>
                                            <select
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white"
                                                value={user.preferences.currency}
                                                onChange={(e) => setUser(prev => ({ ...prev, preferences: { ...prev.preferences, currency: e.target.value } }))}
                                            >
                                                <option value="ETB">Ethiopian Birr (ETB)</option>
                                                <option value="USD">US Dollar (USD)</option>
                                                <option value="EUR">Euro (EUR)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Language</label>
                                            <select
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white"
                                                value={user.preferences.language}
                                                onChange={(e) => setUser(prev => ({ ...prev, preferences: { ...prev.preferences, language: e.target.value } }))}
                                            >
                                                <option value="en">English</option>
                                                <option value="am">Amharic</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Security Settings</h2>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl mb-6">
                                        <div className="flex gap-3">
                                            <Key className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-amber-900 dark:text-amber-400">Password Change</p>
                                                <p className="text-sm text-amber-800 dark:text-amber-500/80">Leave blank if you don't want to change your password.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                            placeholder="••••••••"
                                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
