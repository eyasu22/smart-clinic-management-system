import api from './api';

const summarizeNotes = async (notes) => {
    const response = await api.post('/ai/summarize-notes', { notes });
    return response.data;
};

const analyzeSchedule = async (date) => {
    const response = await api.post('/ai/analyze-schedule', { date });
    return response.data;
};

const getPatientInsights = async (patientId) => {
    const response = await api.post('/ai/patient-insights', { patientId });
    return response.data;
};

const getSecurityAlerts = async () => {
    const response = await api.get('/ai/security-alerts');
    return response.data;
};

const smartSearch = async (query) => {
    const response = await api.get(`/ai/smart-search?query=${encodeURIComponent(query)}`);
    return response.data;
};

const aiService = {
    summarizeNotes,
    analyzeSchedule,
    getPatientInsights,
    getSecurityAlerts,
    smartSearch
};

export default aiService;
