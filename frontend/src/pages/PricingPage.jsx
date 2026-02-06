import { useNavigate } from 'react-router-dom';
import { Check, Activity, Zap, Shield, Rocket, ArrowRight } from 'lucide-react';

const PricingPage = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Starter',
            price: '29',
            description: 'Perfect for small clinics just getting started.',
            features: [
                'Up to 500 Patients',
                'Basic Appointment Scheduling',
                'Patient Records (EMR)',
                'Email Notifications',
                'Standard Analytics',
                'Email Support'
            ],
            icon: Activity,
            color: 'blue',
            buttonText: 'Start 14-Day Free Trial',
            popular: false
        },
        {
            name: 'Professional',
            price: '79',
            description: 'Advanced features for growing healthcare practices.',
            features: [
                'Unlimited Patients',
                'AI-Powered Scheduling',
                'Smart Prescriptions',
                'SMS & Email Notifications',
                'Advanced Billing Unit',
                'Priority Support (24/7)',
                'Custom Branding',
                'Telemedicine Integration'
            ],
            icon: Zap,
            color: 'indigo',
            buttonText: 'Get Started Today',
            popular: true
        },
        {
            name: 'Enterprise',
            price: '199',
            description: 'Custom solutions for hospitals and large networks.',
            features: [
                'Multi-Clinic Support',
                'Custom AI Models',
                'Hardware Integration',
                'White-label Solution',
                'Dedicated Account Manager',
                'API Access',
                'On-premise Deployment Option',
                'Advanced Data Migration'
            ],
            icon: Rocket,
            color: 'purple',
            buttonText: 'Contact Sales',
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 py-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-8 text-slate-500 hover:text-primary-600 flex items-center gap-1 mx-auto text-sm font-medium transition-colors"
                    >
                        &larr; Back to Home
                    </button>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 font-display">
                        Simple, Transparent <span className="text-primary-600">Pricing</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Choose the plan that's right for your practice. All plans include a 14-day free trial.
                    </p>
                </div>
            </div>

            {/* Pricing Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => {
                        const Icon = plan.icon;
                        const bgColor = plan.color === 'blue' ? 'bg-blue-600' : plan.color === 'indigo' ? 'bg-indigo-600' : 'bg-purple-600';
                        const textColor = plan.color === 'blue' ? 'text-blue-600' : plan.color === 'indigo' ? 'text-indigo-600' : 'text-purple-600';
                        const shadowColor = plan.color === 'blue' ? 'shadow-blue-500/30' : plan.color === 'indigo' ? 'shadow-indigo-500/30' : 'shadow-purple-500/30';

                        return (
                            <div
                                key={i}
                                className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 hover:-translate-y-2 ${plan.popular ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-slate-100 shadow-xl'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center mb-6 shadow-lg`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                                    <span className="text-slate-500 font-medium">/month</span>
                                </div>
                                <p className="text-slate-600 mb-8 leading-relaxed">
                                    {plan.description}
                                </p>

                                <button
                                    onClick={() => navigate('/signup', { state: { plan: plan.name } })}
                                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-8 ${plan.popular
                                        ? `${bgColor} text-white shadow-lg ${shadowColor} hover:brightness-110`
                                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                        }`}
                                >
                                    {plan.buttonText}
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">What's Included:</p>
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className={`mt-1 p-0.5 rounded-full ${bgColor} bg-opacity-10`}>
                                                <Check className={`w-4 h-4 ${textColor}`} strokeWidth={3} />
                                            </div>
                                            <span className="text-slate-600 text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Comparison Table Link or FAQ */}
            <div className="bg-slate-900 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Can I switch plans later?</h4>
                            <p className="text-slate-400">Yes, you can upgrade or downgrade your plan at any time from your clinic settings.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Do you offer discounts?</h4>
                            <p className="text-slate-400">We offer a 20% discount if you choose yearly billing over monthly billing.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Is my data secure?</h4>
                            <p className="text-slate-400">Absolutely. We are HIPAA compliant and use bank-level encryption (AES-256).</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">What happens after the trial?</h4>
                            <p className="text-slate-400">You'll be asked to add a payment method to continue using after 14 days.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12 px-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Activity className="w-8 h-8 text-primary-600" />
                    <span className="text-2xl font-bold text-slate-900">SmartClinic</span>
                </div>
                <p className="text-slate-500 text-sm">© 2026 SmartClinic. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PricingPage;
