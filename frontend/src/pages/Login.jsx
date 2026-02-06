import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, Pill, Activity, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // In a real app: const { data } = await api.post('/users/login', { email, password });
            // For demo purposes with your backend:
            console.log("Attempting login", { email, password });

            const { data } = await api.post('/users/login', { email, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-primary-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex overflow-hidden border border-white/50">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 relative">
                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-4 left-4 text-slate-400 hover:text-primary-600 flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                        &larr; Back to Home
                    </button>

                    <div className="flex items-center gap-2.5 mb-8 text-primary-600 mt-6">
                        <div className="bg-primary-50 p-2.5 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight font-display text-slate-900">SmartClinic</span>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-2 font-display">Welcome Back</h2>
                    <p className="text-slate-500 mb-8 font-light">Please enter your details to sign in.</p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-slate-300"
                                placeholder="doctor@clinic.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Don't have an account? <Link to="/signup" className="text-primary-600 font-bold hover:underline">Create Account</Link>.
                    </div>
                </div>

                {/* Right Side - Decorative */}
                <div className="hidden md:flex w-1/2 bg-primary-600 p-12 flex-col justify-between relative overflow-hidden text-white">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-4 font-display">Modern Healthcare Management</h3>
                        <p className="text-primary-100 leading-relaxed font-light text-lg">
                            Streamline your clinic operations with our advanced AI-powered management system.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                            <div className="bg-white/20 p-2.5 rounded-xl">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold">Patient Records</div>
                                <div className="text-xs text-primary-200">Secure & Organized</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                            <div className="bg-white/20 p-2.5 rounded-xl">
                                <Pill className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold">Smart Prescriptions</div>
                                <div className="text-xs text-primary-200">AI Assisted</div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
