import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    Calendar,
    Users,
    Shield,
    Clock,
    MapPin,
    ArrowRight,
    CheckCircle,
    Star,
    Zap,
    Heart,
    TrendingUp
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-lg">
                                <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-gray-900">SmartClinic</div>
                                <div className="text-xs text-gray-500">Healthcare Management</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-5 py-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-5 py-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors"
                            >
                                Pricing
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                                <Zap className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700">#1 Healthcare Platform</span>
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                                Transform Your
                                <span className="block mt-2 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Healthcare Practice
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 leading-relaxed">
                                The all-in-one platform trusted by 2,000+ clinics worldwide. Streamline appointments, manage patient records, and grow your practice with AI-powered insights.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="group px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    View Pricing & Plans
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                                    className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all"
                                >
                                    Watch Demo Video
                                </button>
                            </div>

                            <div className="flex items-center gap-8 pt-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 border-2 border-white"></div>
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                                    </div>
                                    <div className="text-sm text-gray-600 font-semibold">
                                        <div>2,000+ Clinics</div>
                                        <div className="text-xs text-gray-500">Trust SmartClinic</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="ml-2 text-sm font-semibold text-gray-600">4.9/5.0</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80"
                                    alt="Healthcare Dashboard"
                                    className="w-full"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-blue-900/20 to-transparent"></div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-linear-to-br from-blue-400 to-indigo-600 rounded-full blur-3xl opacity-20"></div>
                            <div className="absolute -top-6 -left-6 w-72 h-72 bg-linear-to-br from-purple-400 to-pink-600 rounded-full blur-3xl opacity-20"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-linear-to-r from-blue-600 to-indigo-600">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { number: '2,000+', label: 'Active Clinics' },
                            { number: '50,000+', label: 'Happy Patients' },
                            { number: '99.9%', label: 'Uptime SLA' },
                            { number: '24/7', label: 'Support Available' }
                        ].map((stat, i) => (
                            <div key={i} className="text-white">
                                <div className="text-4xl font-extrabold mb-2">{stat.number}</div>
                                <div className="text-blue-100 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-4">
                            <span className="text-sm font-semibold text-blue-700">Features</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Everything You Need in One Place</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Powerful tools designed to help you deliver exceptional patient care</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered appointment booking with automated reminders and waitlist management', gradient: 'from-blue-500 to-cyan-500' },
                            { icon: Users, title: 'Patient Portal', desc: 'Secure patient access to records, prescriptions, and lab results', gradient: 'from-indigo-500 to-blue-500' },
                            { icon: Shield, title: 'HIPAA Compliant', desc: 'Bank-level security with end-to-end encryption for all data', gradient: 'from-green-500 to-emerald-500' },
                            { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Real-time insights into clinic performance and revenue', gradient: 'from-purple-500 to-pink-500' },
                            { icon: Heart, title: 'Telemedicine', desc: 'Built-in video consultations with integrated billing', gradient: 'from-pink-500 to-rose-500' },
                            { icon: Clock, title: 'Multi-Device', desc: 'Access anywhere on desktop, tablet, or mobile', gradient: 'from-orange-500 to-amber-500' }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 px-6 bg-linear-to-b from-slate-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80"
                                    alt="Modern Clinic"
                                    className="w-full"
                                />
                            </div>
                            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-linear-to-br from-blue-400 to-indigo-600 rounded-full blur-3xl opacity-20"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                                <span className="text-sm font-semibold text-blue-700">About SmartClinic</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                                Built for Healthcare Professionals
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                SmartClinic combines cutting-edge technology with deep healthcare expertise. Our platform is trusted by thousands of clinics worldwide to deliver better patient outcomes.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: CheckCircle, text: 'HIPAA Compliant & SOC 2 Certified', color: 'text-green-600' },
                                    { icon: CheckCircle, text: 'Cloud-Based with 99.9% Uptime', color: 'text-blue-600' },
                                    { icon: CheckCircle, text: '24/7 Dedicated Support Team', color: 'text-indigo-600' },
                                    { icon: CheckCircle, text: 'Free Training & Onboarding', color: 'text-purple-600' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                        <span className="text-gray-700 font-semibold">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-linear-to-br from-white to-blue-50 rounded-3xl p-12 shadow-xl border border-gray-100">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Visit Our Main Clinic</h3>
                            <p className="text-lg text-gray-600">State-of-the-art facility with experienced staff</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
                                        <MapPin className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Our Location</h4>
                                        <p className="text-gray-600 leading-relaxed">123 Health Avenue<br />Medical District<br />New York, NY 10001</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shrink-0">
                                        <Clock className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Opening Hours</h4>
                                        <p className="text-gray-600 leading-relaxed">Monday - Friday: 8:00 AM - 8:00 PM<br />Saturday - Sunday: 9:00 AM - 5:00 PM</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl overflow-hidden shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"
                                    alt="Clinic Interior"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
                        <div className="relative px-12 py-16 text-center">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                                Ready to Transform Your Practice?
                            </h2>
                            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                                Join thousands of healthcare professionals already using SmartClinic to deliver better patient care
                            </p>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all inline-flex items-center gap-3"
                            >
                                Start Your Free 14-Day Trial
                                <ArrowRight className="w-6 h-6" />
                            </button>
                            <p className="text-blue-200 text-sm mt-6">No credit card required • Cancel anytime • Free training included</p>
                        </div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-gray-50 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">SmartClinic</div>
                                <div className="text-xs text-gray-500">Healthcare Management</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <button onClick={() => alert("Privacy Policy coming soon")} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Privacy Policy</button>
                            <button onClick={() => alert("Terms of Service coming soon")} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Terms of Service</button>
                            <button onClick={() => alert("Contact form coming soon")} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact Us</button>
                        </div>
                        <p className="text-gray-500 text-sm">© 2026 SmartClinic. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
