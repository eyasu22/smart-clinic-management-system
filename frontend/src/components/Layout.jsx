import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    LogOut,
    Activity,
    Menu,
    X,
    Moon,
    Sun,
    DollarSign,
    Shield,
    Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';

const Sidebar = ({ isOpen, setIsOpen, user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Base menu items for all roles
    const baseMenuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ];

    // Role-specific menu items
    const roleMenuItems = {
        admin: [
            { icon: Users, label: 'Patients', path: '/patients' },
            { icon: Calendar, label: 'Appointments', path: '/appointments' },
            { icon: Calendar, label: 'Clinic Calendar', path: '/calendar' },
            { icon: DollarSign, label: 'Billing', path: '/billing' },
            { icon: Settings, label: 'Settings', path: '/settings' },
        ],
        superAdmin: [
            { icon: Users, label: 'Patients', path: '/patients' },
            { icon: Calendar, label: 'Appointments', path: '/appointments' },
            { icon: Calendar, label: 'Clinic Calendar', path: '/calendar' },
            { icon: DollarSign, label: 'Billing', path: '/billing' },
            { icon: Settings, label: 'Settings', path: '/settings' },
            { icon: Shield, label: 'Super Admin', path: '/super-admin/settings', highlight: true },
        ],
        doctor: [
            { icon: Users, label: 'My Patients', path: '/patients' },
            { icon: Calendar, label: 'Appointments', path: '/appointments' },
            { icon: Calendar, label: 'Clinic Calendar', path: '/calendar' },
            { icon: Settings, label: 'Settings', path: '/settings' },
        ],
        receptionist: [
            { icon: LayoutDashboard, label: 'Receptionist Desk', path: '/dashboard' },
            { icon: Users, label: 'Patients', path: '/patients' },
            { icon: Calendar, label: 'Appointments', path: '/appointments' },
            { icon: Calendar, label: 'Clinic Calendar', path: '/calendar' },
            { icon: DollarSign, label: 'Billing', path: '/billing' },
            { icon: Settings, label: 'Settings', path: '/settings' },
        ],
        patient: [
            { icon: Calendar, label: 'Appointments', path: '/appointments' },
            { icon: Calendar, label: 'Clinic Calendar', path: '/calendar' },
            { icon: DollarSign, label: 'My Billing', path: '/billing' },
            { icon: Settings, label: 'Settings', path: '/settings' },
        ]
    };

    const menuItems = [
        ...baseMenuItems,
        ...(roleMenuItems[user?.role] || roleMenuItems.patient)
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden animate-fadeIn"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
        transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <Link
                        to="/dashboard"
                        className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                        <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg mr-3 transition-transform hover:scale-110 duration-300">
                            <Activity className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                        </div>
                        <span className="text-xl font-bold text-slate-800 dark:text-white transition-colors">SmartClinic</span>
                    </Link>

                    {/* Menu */}
                    <nav className="flex-1 p-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const isHighlighted = item.highlight;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                    transition-all duration-200 transform hover:scale-[1.02]
                    ${isActive
                                            ? isHighlighted
                                                ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30'
                                                : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 font-medium shadow-md'
                                            : isHighlighted
                                                ? 'bg-linear-to-r from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 font-medium hover:from-purple-500/20 hover:to-indigo-500/20 border-2 border-purple-200 dark:border-purple-700'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}
                  `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                    {isHighlighted && <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">⭐</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Utils & Logout */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="px-4 py-3 mb-2 bg-slate-50 dark:bg-slate-900 rounded-lg transition-colors">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'Doctor'}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'Admin'}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-bold text-center py-1 z-100 flex items-center justify-center gap-2">
                    <Activity className="w-3 h-3 animate-pulse" /> OFFLINE MODE: VIEWING CACHED CLINICAL DATA (READ-ONLY)
                </div>
            )}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} user={user} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8 transition-colors duration-300">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center space-x-4 ml-auto">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-300 hover:rotate-12"
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 animate-pulse" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        <NotificationDropdown />

                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold transition-colors">
                            {user?.name?.[0] || 'D'}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
