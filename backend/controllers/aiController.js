const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { createAuditLog } = require('../middleware/authMiddleware');

/**
 * AI Safety Disclaimer - added to all AI responses
 */
const AI_DISCLAIMER = {
    assistiveOnly: true,
    legalNotice: "AI-generated insights are for informational purposes only. They do not constitute medical advice, diagnosis, or treatment recommendations. Always consult qualified healthcare professionals for medical decisions.",
    dataPrivacy: "AI analysis is performed on anonymized data patterns. No patient data is shared with external services."
};

/**
 * Helper: Log AI usage for audit trail
 */
const logAIUsage = async (userId, feature, inputSummary, req) => {
    await createAuditLog(userId, 'AI_USAGE', 'AIFeature', null, {
        feature,
        inputSummary,
        timestamp: new Date().toISOString()
    }, req);
};

/**
 * @desc    Analyze notes and generate summary (ASSISTIVE ONLY)
 * @route   POST /api/ai/summarize-notes
 * @access  Doctor (with AI access)
 */
const summarizeNotes = async (req, res) => {
    const { notes } = req.body;

    try {
        if (!notes) return res.status(400).json({ message: 'No notes provided' });

        // Log AI usage
        await logAIUsage(req.user._id, 'summarize-notes', `Notes length: ${notes.length}`, req);

        const keyTerms = ['diagnosis', 'pain', 'fever', 'prescription', 'severe', 'mild', 'chronic', 'acute', 'symptoms', 'medication'];
        const sentences = notes.split('.');
        const criticalSentences = sentences.filter(s => keyTerms.some(term => s.toLowerCase().includes(term)));

        const summary = criticalSentences.length > 0
            ? criticalSentences.join('. ') + '.'
            : "Patient visit recorded. No critical keywords detected in notes.";

        // Build explainability
        const detectedKeywords = keyTerms.filter(term => notes.toLowerCase().includes(term));

        res.json({
            type: 'AI_SUMMARY',
            assistiveOnly: true,
            original: notes,
            summary: summary,
            explainability: {
                method: "Keyword-based extraction",
                detectedKeywords,
                sentencesAnalyzed: sentences.length,
                criticalSentencesFound: criticalSentences.length,
                reason: detectedKeywords.length > 0
                    ? `Summary generated based on detection of medical keywords: ${detectedKeywords.join(', ')}`
                    : "No critical medical keywords detected. Full notes preserved."
            },
            disclaimer: AI_DISCLAIMER
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Suggest optimal doctor/slot (ASSISTIVE SCHEDULING)
 * @route   POST /api/ai/analyze-schedule
 * @access  Admin, Receptionist (with AI access)
 */
const optimizeSchedule = async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        await logAIUsage(req.user._id, 'optimize-schedule', `Date: ${targetDate}`, req);

        const doctors = await Doctor.find({}).populate('user', 'name');
        const analytics = [];

        for (const doc of doctors) {
            const appointmentCount = await Appointment.countDocuments({
                doctor: doc._id,
                date: targetDate,
                status: { $ne: 'cancelled' }
            });

            const load = (appointmentCount / doc.maxPatientsPerDay) * 100;

            analytics.push({
                doctorName: doc.user.name,
                doctorId: doc._id,
                specialization: doc.specialization,
                currentLoad: `${load.toFixed(1)}%`,
                appointmentCount,
                maxCapacity: doc.maxPatientsPerDay,
                availableSlots: doc.maxPatientsPerDay - appointmentCount,
                status: load > 90 ? 'CRITICAL_OVERLOAD' : load > 75 ? 'HIGH_LOAD' : load > 50 ? 'MODERATE' : 'OPTIMAL'
            });
        }

        // Sort by least loaded
        analytics.sort((a, b) => parseFloat(a.currentLoad) - parseFloat(b.currentLoad));

        const recommended = analytics[0];

        res.json({
            type: 'AI_SCHEDULE_OPTIMIZATION',
            assistiveOnly: true,
            date: targetDate,
            recommendation: recommended
                ? `Suggested Doctor: ${recommended.doctorName} (${recommended.specialization}) - ${recommended.availableSlots} slots available`
                : 'No doctors available',
            explainability: {
                method: "Load balancing analysis",
                factors: [
                    "Current appointment count per doctor",
                    "Maximum daily capacity settings",
                    "Even distribution prioritization"
                ],
                reason: recommended
                    ? `${recommended.doctorName} has the lowest workload (${recommended.currentLoad}) with ${recommended.availableSlots} available appointment slots.`
                    : "No available doctors found in the system."
            },
            analysis: analytics,
            disclaimer: AI_DISCLAIMER
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get patient insights (ASSISTIVE PATTERN DETECTION)
 * @route   POST /api/ai/patient-insights
 * @access  Doctor (with AI access)
 */
const analyzePatientHistory = async (req, res) => {
    const { patientId } = req.body;
    try {
        await logAIUsage(req.user._id, 'patient-insights', `PatientId: ${patientId}`, req);

        const appointments = await Appointment.find({ patient: patientId }).sort({ createdAt: -1 });

        if (!appointments.length) {
            return res.json({
                type: 'AI_PATIENT_INSIGHTS',
                assistiveOnly: true,
                message: 'No history to analyze',
                disclaimer: AI_DISCLAIMER
            });
        }

        // Detect patterns
        const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
        const completedCount = appointments.filter(a => a.status === 'completed').length;
        const totalVisits = appointments.length;
        const recentSymptoms = appointments.slice(0, 5).map(a => a.symptoms).filter(Boolean);

        let insight = "Patient has a regular visit history.";
        let alertLevel = "LOW";
        let reasons = [];

        if (cancelledCount > 2) {
            insight = "High cancellation rate detected. May indicate engagement or scheduling issues.";
            alertLevel = "MEDIUM";
            reasons.push(`${cancelledCount} cancelled appointments out of ${totalVisits} total`);
        }

        if (completedCount > 5) {
            reasons.push(`${completedCount} completed visits indicate regular patient engagement`);
        }

        // Symptom frequency analysis
        const symptomFrequency = {};
        recentSymptoms.forEach(s => {
            const words = s.toLowerCase().split(/\s+/);
            words.forEach(w => {
                if (w.length > 3) symptomFrequency[w] = (symptomFrequency[w] || 0) + 1;
            });
        });
        const frequentSymptoms = Object.entries(symptomFrequency)
            .filter(([_, count]) => count > 1)
            .map(([word]) => word);

        if (frequentSymptoms.length > 0) {
            reasons.push(`Recurring symptom keywords: ${frequentSymptoms.join(', ')}`);
        }

        res.json({
            type: 'AI_PATIENT_INSIGHTS',
            assistiveOnly: true,
            patientId,
            trends: {
                totalVisits,
                completedVisits: completedCount,
                cancellationRate: `${((cancelledCount / totalVisits) * 100).toFixed(0)}%`,
                recurringSymptomKeywords: frequentSymptoms
            },
            aiInsight: insight,
            riskLevel: alertLevel,
            explainability: {
                method: "Statistical pattern analysis",
                dataPoints: totalVisits,
                analysisFactors: [
                    "Appointment completion rate",
                    "Cancellation frequency",
                    "Symptom keyword recurrence"
                ],
                reasons
            },
            disclaimer: AI_DISCLAIMER
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Security Anomaly Detection (ASSISTIVE SECURITY)
 * @route   GET /api/ai/security-alerts
 * @access  Admin, SuperAdmin (with AI access)
 */
const detectSecurityRisks = async (req, res) => {
    try {
        await logAIUsage(req.user._id, 'security-alerts', 'Security scan', req);

        // 1. Check for locked accounts (Brute Force Targets)
        const lockedUsers = await User.find({ lockUntil: { $gt: Date.now() } }).select('name email loginAttempts lockUntil');

        // 2. Check for mass deletions in Audit Log
        const now = new Date();
        const oneHourAgo = new Date(now - 60 * 60 * 1000);

        const criticalActions = await AuditLog.countDocuments({
            action: { $in: ['DELETE', 'DEACTIVATE', 'BULK_DELETE'] },
            createdAt: { $gte: oneHourAgo }
        });

        // 3. Check for suspicious login patterns
        const recentLogins = await AuditLog.find({
            action: 'LOGIN',
            createdAt: { $gte: oneHourAgo }
        }).limit(100);

        const uniqueIPs = [...new Set(recentLogins.map(l => l.ip).filter(Boolean))];

        const highRisk = criticalActions > 5 || lockedUsers.length > 2;
        const mediumRisk = criticalActions > 2 || lockedUsers.length > 0;

        res.json({
            type: 'AI_SECURITY_ANALYSIS',
            assistiveOnly: true,
            status: highRisk ? 'RISK_DETECTED' : mediumRisk ? 'CAUTION' : 'SECURE',
            anomalies: {
                lockedAccounts: lockedUsers.map(u => ({
                    name: u.name,
                    email: u.email,
                    attempts: u.loginAttempts,
                    lockedUntil: u.lockUntil
                })),
                criticalActionsLastHour: criticalActions,
                uniqueLoginIPs: uniqueIPs.length
            },
            explainability: {
                method: "Real-time anomaly pattern matching",
                factors: [
                    "Account lockout frequency",
                    "Critical action volume",
                    "Login pattern diversity"
                ],
                thresholds: {
                    highRisk: "More than 5 critical actions OR more than 2 locked accounts",
                    mediumRisk: "More than 2 critical actions OR any locked accounts"
                }
            },
            recommendation: highRisk
                ? "URGENT: Review user access logs immediately. Consider enabling maintenance mode."
                : mediumRisk
                    ? "ATTENTION: Monitor system activity closely. Review locked accounts."
                    : "System operating within normal security parameters.",
            disclaimer: AI_DISCLAIMER
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Natural Language Search (ASSISTIVE SEARCH)
 * @route   GET /api/ai/smart-search
 * @access  Staff (with AI access)
 */
const smartSearch = async (req, res) => {
    const { query } = req.query;
    try {
        if (!query) return res.status(400).json({ message: 'Query required' });

        await logAIUsage(req.user._id, 'smart-search', `Query: ${query}`, req);

        const q = query.toLowerCase();
        let results = {};
        let detectedIntents = [];

        // 1. Intent: Cancelled Appointments
        if (q.includes('cancel')) {
            detectedIntents.push('cancelled_appointments');
            results.appointments = await Appointment.find({ status: 'cancelled' })
                .populate('patient', 'name uniqueId').limit(10);
        }

        // 2. Intent: Find Patient by name
        if (q.includes('patient')) {
            detectedIntents.push('patient_search');
            const nameMatch = q.replace('patient', '').trim();
            if (nameMatch) {
                results.patients = await Patient.find({
                    name: { $regex: nameMatch, $options: 'i' }
                }).limit(10);
            } else {
                results.patients = await Patient.find({}).limit(10);
            }
        }

        // 3. Intent: Symptom Search
        if (q.includes('fever') || q.includes('pain') || q.includes('cough')) {
            detectedIntents.push('symptom_search');
            results.symptomMatches = await Appointment.find({
                symptoms: { $regex: q, $options: 'i' }
            }).populate('patient', 'name').limit(10);
        }

        // 4. Intent: Today's appointments
        if (q.includes('today')) {
            detectedIntents.push('todays_appointments');
            const today = new Date().toISOString().split('T')[0];
            results.todaysAppointments = await Appointment.find({ date: today })
                .populate('patient', 'name')
                .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
        }

        res.json({
            type: 'AI_SMART_SEARCH',
            assistiveOnly: true,
            query: query,
            detectedIntents,
            explainability: {
                method: "Natural language intent matching",
                matchedPatterns: detectedIntents,
                reason: detectedIntents.length > 0
                    ? `Detected ${detectedIntents.length} search intent(s): ${detectedIntents.join(', ')}`
                    : "No specific intent patterns matched. Try more specific keywords."
            },
            results,
            disclaimer: AI_DISCLAIMER
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Recommend patients for follow-up based on specialization (ASSISTIVE)
 * @route   GET /api/ai/recommend-patients
 * @access  Doctor (with AI access)
 */
const recommendPatients = async (req, res) => {
    try {
        await logAIUsage(req.user._id, 'recommend-patients', 'Follow-up recommendations', req);

        // Get doctor profile to know specialization
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

        const specialization = doctor.specialization.toLowerCase();

        // Define keywords based on specialization
        const specializationKeywords = {
            'cardiology': ['chest pain', 'heart', 'pressure', 'breath', 'palpitation'],
            'dermatology': ['skin', 'rash', 'acne', 'itch', 'lesion'],
            'pediatrics': ['baby', 'child', 'growth', 'vaccine', 'infant'],
            'orthopedics': ['bone', 'joint', 'fracture', 'muscle', 'back pain'],
            'neurology': ['headache', 'migraine', 'numbness', 'seizure', 'dizziness'],
            'general': ['fever', 'cold', 'checkup', 'fatigue', 'general']
        };

        let keywords = [];
        for (const [spec, kw] of Object.entries(specializationKeywords)) {
            if (specialization.includes(spec)) {
                keywords = kw;
                break;
            }
        }
        if (keywords.length === 0) keywords = specializationKeywords.general;

        // Find appointments with these symptoms
        const relevantAppointments = await Appointment.find({
            symptoms: { $regex: keywords.join('|'), $options: 'i' },
            status: 'completed'
        }).populate('patient', 'name age gender contact uniqueId').sort({ createdAt: -1 });

        // Deduplicate patients and find those needing follow-up
        const uniquePatients = {};
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        relevantAppointments.forEach(appt => {
            if (appt.patient && !uniquePatients[appt.patient._id]) {
                const lastVisitDate = new Date(appt.date);
                const needsFollowUp = lastVisitDate < thirtyDaysAgo;

                uniquePatients[appt.patient._id] = {
                    ...appt.patient.toObject(),
                    triggerSymptom: appt.symptoms,
                    lastVisit: appt.date,
                    needsFollowUp,
                    daysSinceLastVisit: Math.floor((Date.now() - lastVisitDate) / (1000 * 60 * 60 * 24))
                };
            }
        });

        const patientList = Object.values(uniquePatients);
        const followUpNeeded = patientList.filter(p => p.needsFollowUp);

        res.json({
            type: 'AI_PATIENT_RECOMMENDATIONS',
            assistiveOnly: true,
            doctorSpecialization: doctor.specialization,
            totalRelevantPatients: patientList.length,
            followUpRecommendations: followUpNeeded.length,
            explainability: {
                method: "Symptom-specialty matching with temporal analysis",
                matchedKeywords: keywords,
                criteria: [
                    `Symptoms matching ${doctor.specialization} specialty keywords`,
                    "Completed appointments only",
                    "Last visit more than 30 days ago (for follow-up)"
                ],
                reason: `Found ${patientList.length} patients with ${doctor.specialization}-related symptoms. ${followUpNeeded.length} may benefit from a follow-up visit.`
            },
            patients: patientList.slice(0, 20), // Limit results
            disclaimer: AI_DISCLAIMER
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    summarizeNotes,
    optimizeSchedule,
    analyzePatientHistory,
    detectSecurityRisks,
    smartSearch,
    recommendPatients
};

