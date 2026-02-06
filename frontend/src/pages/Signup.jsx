import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, Pill, Activity, ArrowRight, User, Users, Lock, Mail, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Signup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedPlan = location.state?.plan || 'Starter';

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.post('/users', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                plan: selectedPlan
            });

            console.log("Registration successful:", data);

            // Automatically log the user in by saving the token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-primary-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex overflow-hidden border border-white/50">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-4 left-4 text-slate-400 hover:text-primary-600 flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                        &larr; Back to Home
                    </button>

                    <div className="flex items-center gap-2.5 mb-6 text-primary-600 mt-2">
                        <div className="bg-primary-50 p-2.5 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight font-display text-slate-900">SmartClinic</span>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-2 font-display">Create Account</h2>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-slate-500 font-light text-sm">Join us to manage your clinic efficiently.</span>
                        {selectedPlan && (
                            <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-200 uppercase tracking-wider">
                                {selectedPlan} Plan
                            </span>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Dr. John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="doctor@clinic.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account? <button onClick={() => navigate('/login')} className="text-primary-600 font-bold hover:underline">Log in</button>
                    </div>
                </div>

                {/* Right Side - Decorative */}
                <div className="hidden md:flex w-1/2 bg-primary-600 p-12 flex-col justify-center relative overflow-hidden text-white">
                    <div className="relative z-10 text-center">
                        <div className="inline-flex bg-white/10 p-4 rounded-full mb-6 backdrop-blur-sm border border-white/20">
                            <Users className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 font-display">Join Our Network</h3>
                        <p className="text-primary-100 leading-relaxed font-light text-lg mb-8">
                            Connect with thousands of healthcare professionals managing their practice with SmartClinic.
                        </p>

                        <div className="flex flex-col gap-4 max-w-xs mx-auto text-left">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-400/20 p-1.5 rounded-full">
                                    <CheckCircle className="w-4 h-4 text-green-300" />
                                </div>
                                <span className="text-primary-50">Instant Access to Dashboard</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-green-400/20 p-1.5 rounded-full">
                                    <CheckCircle className="w-4 h-4 text-green-300" />
                                </div>
                                <span className="text-primary-50">Complimentary 14-day Trial</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-green-400/20 p-1.5 rounded-full">
                                    <CheckCircle className="w-4 h-4 text-green-300" />
                                </div>
                                <span className="text-primary-50">No Credit Card Required</span>
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

export default Signup;
