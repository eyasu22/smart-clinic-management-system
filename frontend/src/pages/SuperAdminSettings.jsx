import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
    Settings, Shield, Database, Brain, Bell, Activity, Lock,
    Users, FileText, Globe, Clock, Server, AlertTriangle, Save,
    Download, Upload, Radio
} from 'lucide-react';
import api from '../services/api';

const SuperAdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('system');
    const [healthStatus, setHealthStatus] = useState(null);

    const tabs = [
        { id: 'system', label: 'System Config', icon: Settings },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'roles', label: 'Roles & Permissions', icon: Users },
        { id: 'audit', label: 'Audit & Compliance', icon: FileText },
        { id: 'data', label: 'Data Management', icon: Database },
        { id: 'ai', label: 'AI Settings', icon: Brain },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'monitoring', label: 'System Health', icon: Activity },
    ];

    useEffect(() => {
        fetchSettings();
        fetchHealthStatus();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/admin/settings');
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHealthStatus = async () => {
        try {
            const { data } = await api.get('/admin/settings/health');
            setHealthStatus(data);
        } catch (error) {
            console.error('Error fetching health:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings', settings);
            alert('✅ Settings saved successfully!');
        } catch (error) {
            alert('❌ Failed to save settings: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (category, field, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const updateNestedSetting = (category, parent, field, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [parent]: {
                    ...prev[category][parent],
                    [field]: value
                }
            }
        }));
    };

    const triggerBackup = async () => {
        if (!window.confirm('Trigger a manual system backup?')) return;
        try {
            const { data } = await api.post('/admin/settings/backup');
            alert(`✅ Backup started: ${data.backupId}`);
        } catch (error) {
            alert('❌ Backup failed');
        }
    };

    const broadcastEmergency = async () => {
        const message = prompt('Enter emergency message to broadcast to all users:');
        if (!message) return;
        try {
            await api.post('/admin/settings/broadcast', { message });
            alert('✅ Emergency broadcast sent!');
        } catch (error) {
            alert('❌ Broadcast failed');
        }
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading System Configuration...</p>
                </div>
            </div>
        </Layout>
    );

    if (!settings) return (
        <Layout>
            <div className="flex items-center justify-center h-96">
                <div className="text-center bg-red-50 p-10 rounded-3xl border border-red-100">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-900 mb-2">Failed to Load Settings</h2>
                    <p className="text-red-700 mb-6">There was an error connecting to the administration service.</p>
                    <button onClick={fetchSettings} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
                        Retry Connection
                    </button>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                        <Settings className="w-8 h-8 text-primary-600" />
                        Super Admin Settings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Enterprise-level system configuration and control</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">

                {/* SYSTEM CONFIGURATION */}
                {activeTab === 'system' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Globe className="w-6 h-6 text-primary-600" /> System Configuration
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Clinic Name</label>
                                <input
                                    type="text"
                                    value={settings.systemConfig?.clinicName || ''}
                                    onChange={e => updateNestedSetting('systemConfig', 'clinicName', null, e.target.value)}
                                    className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
                                <select
                                    value={settings.systemConfig?.timezone || 'UTC'}
                                    onChange={e => updateNestedSetting('systemConfig', 'timezone', null, e.target.value)}
                                    className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">EST (New York)</option>
                                    <option value="Europe/London">GMT (London)</option>
                                    <option value="Asia/Dubai">GST (Dubai)</option>
                                    <option value="Asia/Kolkata">IST (India)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Default Language</label>
                                <select
                                    value={settings.systemConfig?.defaultLanguage || 'en'}
                                    onChange={e => updateNestedSetting('systemConfig', 'defaultLanguage', null, e.target.value)}
                                    className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="en">English</option>
                                    <option value="ar">Arabic</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Environment Mode</label>
                                <select
                                    value={settings.systemConfig?.environmentMode || 'production'}
                                    onChange={e => updateNestedSetting('systemConfig', 'environmentMode', null, e.target.value)}
                                    className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="production">Production</option>
                                    <option value="demo">Demo Mode</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div>
                                <p className="font-bold text-orange-900 dark:text-orange-300">Maintenance Mode</p>
                                <p className="text-sm text-orange-700 dark:text-orange-400">Enable to block all user access (except Super Admin)</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.systemConfig?.maintenanceMode || false}
                                    onChange={e => updateNestedSetting('systemConfig', 'maintenanceMode', null, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-300 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* SECURITY & AUTHENTICATION */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-primary-600" /> Security & Authentication
                        </h2>

                        {/* Password Policy */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                <Lock className="w-5 h-5" /> Password Policy
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Minimum Length</label>
                                    <input
                                        type="number"
                                        min="6"
                                        max="20"
                                        value={settings.security?.passwordPolicy?.minLength || 8}
                                        onChange={e => updateNestedSetting('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                                        className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.security?.passwordPolicy?.requireUppercase || false}
                                            onChange={e => updateNestedSetting('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium dark:text-white">Require Uppercase</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.security?.passwordPolicy?.requireNumbers || false}
                                            onChange={e => updateNestedSetting('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium dark:text-white">Require Numbers</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.security?.passwordPolicy?.requireSymbols || false}
                                            onChange={e => updateNestedSetting('security', 'passwordPolicy', 'requireSymbols', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium dark:text-white">Require Symbols</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Account Lockout */}
                        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Account Lockout Policy</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Max Failed Attempts</label>
                                    <input
                                        type="number"
                                        min="3"
                                        max="10"
                                        value={settings.security?.accountLockout?.maxAttempts || 5}
                                        onChange={e => updateNestedSetting('security', 'accountLockout', 'maxAttempts', parseInt(e.target.value))}
                                        className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lock Duration (minutes)</label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={settings.security?.accountLockout?.lockDuration || 30}
                                        onChange={e => updateNestedSetting('security', 'accountLockout', 'lockDuration', parseInt(e.target.value))}
                                        className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Other Security Settings */}
                        <div className="space-y-3">
                            {[
                                { key: 'twoFactorAuth', label: '🔐 Enable Two-Factor Authentication (2FA)', color: 'green' },
                                { key: 'forcePasswordChangeOnFirstLogin', label: '🔄 Force Password Change on First Login', color: 'blue' },
                                { key: 'multiDeviceLogin', label: '📱 Allow Multi-Device Login', color: 'indigo' },
                                { key: 'refreshTokenRotation', label: '🔁 Enable Refresh Token Rotation', color: 'purple' }
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <p className="font-medium dark:text-white">{item.label}</p>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.security?.[item.key] || false}
                                            onChange={e => updateNestedSetting('security', item.key, null, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className={`w-11 h-6 bg-slate-300 peer-focus:ring-4 peer-focus:ring-${item.color}-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${item.color}-600`}></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ROLES & PERMISSIONS */}
                {activeTab === 'roles' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary-600" /> Role & Permission Control
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {['superAdmin', 'admin', 'receptionist', 'doctor', 'patient'].map(role => (
                                <div key={role} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <p className="font-medium capitalize dark:text-white">{role.replace(/([A-Z])/g, ' $1')}</p>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.roleControl?.enabledRoles?.[role] !== false}
                                            onChange={e => updateNestedSetting('roleControl', 'enabledRoles', role, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="font-medium dark:text-white">🚫 Restrict Admin Account Creation (Only Super Admin)</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.roleControl?.restrictAdminCreation || false}
                                        onChange={e => updateNestedSetting('roleControl', 'restrictAdminCreation', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="font-medium dark:text-white">🏥 Restrict Doctor Account Creation (Only Admin+)</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.roleControl?.restrictDoctorCreation || false}
                                        onChange={e => updateNestedSetting('roleControl', 'restrictDoctorCreation', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* AUDIT & COMPLIANCE */}
                {activeTab === 'audit' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary-600" /> Audit & Compliance
                        </h2>

                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div>
                                <p className="font-bold text-green-900 dark:text-green-300">Enable Audit Logging</p>
                                <p className="text-sm text-green-700 dark:text-green-400">Track all critical system actions</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.audit?.enableAuditLogging !== false}
                                    onChange={e => updateNestedSetting('audit', 'enableAuditLogging', null, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Log Retention Period</label>
                            <select
                                value={settings.audit?.logRetentionDays || 90}
                                onChange={e => updateNestedSetting('audit', 'logRetentionDays', null, parseInt(e.target.value))}
                                className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                            >
                                <option value={30}>30 Days</option>
                                <option value={90}>90 Days</option>
                                <option value={180}>180 Days</option>
                                <option value={365}>1 Year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Compliance Mode</label>
                            <select
                                value={settings.audit?.complianceMode || 'none'}
                                onChange={e => updateNestedSetting('audit', 'complianceMode', null, e.target.value)}
                                className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                            >
                                <option value="none">None</option>
                                <option value="hipaa">HIPAA-like</option>
                                <option value="gdpr">GDPR-like</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* DATA MANAGEMENT */}
                {activeTab === 'data' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Database className="w-6 h-6 text-primary-600" /> Data Management
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Backup Frequency</label>
                                <select
                                    value={settings.dataManagement?.backupFrequency || 'weekly'}
                                    onChange={e => updateNestedSetting('dataManagement', 'backupFrequency', null, e.target.value)}
                                    className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Backup Retention (Days)</label>
                                <input
                                    type="number"
                                    min="7"
                                    max="90"
                                    value={settings.dataManagement?.backupRetentionDays || 30}
                                    onChange={e => updateNestedSetting('dataManagement', 'backupRetentionDays', null, parseInt(e.target.value))}
                                    className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={triggerBackup}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Trigger Manual Backup
                            </button>
                            <button
                                onClick={() => alert('Restore feature requires confirmation workflow')}
                                className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                                Restore from Backup
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="font-medium dark:text-white">Enable Soft Delete (Recoverable)</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.dataManagement?.softDelete !== false}
                                        onChange={e => updateNestedSetting('dataManagement', 'softDelete', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="font-medium dark:text-white">Anonymize Deleted Patient Data (GDPR)</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.dataManagement?.anonymizeDeletedPatients !== false}
                                        onChange={e => updateNestedSetting('dataManagement', 'anonymizeDeletedPatients', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI SETTINGS */}
                {activeTab === 'ai' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-primary-600" /> AI & Intelligence Settings
                        </h2>

                        <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <div>
                                <p className="font-bold text-indigo-900 dark:text-indigo-300">Enable AI Features Globally</p>
                                <p className="text-sm text-indigo-700 dark:text-indigo-400">Master switch for all AI capabilities</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.aiSettings?.enableAI !== false}
                                    onChange={e => updateNestedSetting('aiSettings', 'enableAI', null, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Recommendation Sensitivity</label>
                            <select
                                value={settings.aiSettings?.recommendationSensitivity || 'medium'}
                                onChange={e => updateNestedSetting('aiSettings', 'recommendationSensitivity', null, e.target.value)}
                                className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                            >
                                <option value="low">Low (Conservative)</option>
                                <option value="medium">Medium (Balanced)</option>
                                <option value="high">High (Aggressive)</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="font-medium dark:text-white">🔍 Enable AI Explainability (Show reasoning)</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.aiSettings?.enableExplainability !== false}
                                        onChange={e => updateNestedSetting('aiSettings', 'enableExplainability', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div>
                                    <p className="font-medium text-red-900 dark:text-red-300">⚠️ Assistive Only Mode</p>
                                    <p className="text-sm text-red-700 dark:text-red-400">AI cannot make final medical decisions</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.aiSettings?.assistiveOnly !== false}
                                        onChange={e => updateNestedSetting('aiSettings', 'assistiveOnly', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* NOTIFICATIONS */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Bell className="w-6 h-6 text-primary-600" /> Notification System Control
                        </h2>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { key: 'enableInApp', label: '🔔 In-App Notifications', color: 'blue' },
                                { key: 'enableEmail', label: '📧 Email Notifications', color: 'green' },
                                { key: 'enableSMS', label: '📱 SMS Notifications', color: 'purple' }
                            ].map(item => (
                                <div key={item.key} className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <p className="font-medium text-center mb-3 dark:text-white">{item.label}</p>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications?.[item.key] !== false}
                                            onChange={e => updateNestedSetting('notifications', item.key, null, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className={`w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${item.color}-600`}></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rate Limit (notifications/hour)</label>
                            <input
                                type="number"
                                min="10"
                                max="500"
                                value={settings.notifications.rateLimit || 100}
                                onChange={e => updateNestedSetting('notifications', 'rateLimit', null, parseInt(e.target.value))}
                                className="w-full p-3 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                            />
                        </div>

                        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <h3 className="font-bold text-lg mb-3 text-red-900 dark:text-red-300 flex items-center gap-2">
                                <Radio className="w-5 h-5" /> Emergency Broadcast
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-400 mb-4">Send an urgent message to all active users</p>
                            <button
                                onClick={broadcastEmergency}
                                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                            >
                                <AlertTriangle className="w-5 h-5" />
                                Broadcast Emergency Message
                            </button>
                        </div>
                    </div>
                )}

                {/* SYSTEM HEALTH */}
                {activeTab === 'monitoring' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-primary-600" /> System Health & Monitoring
                        </h2>

                        {healthStatus && (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                                    <Server className="w-10 h-10 mx-auto mb-2 text-green-600" />
                                    <p className="text-sm text-green-700 dark:text-green-400">Status</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-300 capitalize">{healthStatus.status}</p>
                                </div>
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                    <Clock className="w-10 h-10 mx-auto mb-2 text-blue-600" />
                                    <p className="text-sm text-blue-700 dark:text-blue-400">Uptime</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{Math.floor(healthStatus.uptime / 60)}m</p>
                                </div>
                                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                    <Database className="w-10 h-10 mx-auto mb-2 text-purple-600" />
                                    <p className="text-sm text-purple-700 dark:text-purple-400">Database</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 capitalize">{healthStatus.database}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="font-medium dark:text-white">Enable Health Checks</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.monitoring?.enableHealthChecks !== false}
                                        onChange={e => updateNestedSetting('monitoring', 'enableHealthChecks', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <p className="font-medium dark:text-white">Enable Performance Alerts</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.monitoring?.enablePerformanceAlerts !== false}
                                        onChange={e => updateNestedSetting('monitoring', 'enablePerformanceAlerts', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div>
                                    <p className="font-medium text-red-900 dark:text-red-300">Auto-Restart on Failure</p>
                                    <p className="text-sm text-red-700 dark:text-red-400">Automatic recovery (use with caution)</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.monitoring?.autoRestartOnFailure || false}
                                        onChange={e => updateNestedSetting('monitoring', 'autoRestartOnFailure', null, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={fetchHealthStatus}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Activity className="w-5 h-5" />
                            Refresh Health Status
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SuperAdminSettings;
