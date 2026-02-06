import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api', // Pointing to your Node.js backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for offline-tolerant read-only mode
api.interceptors.response.use(
    (response) => {
        // Cache GET requests for offline mode
        if (response.config.method === 'get') {
            const cacheKey = `offline_cache_${response.config.url}`;
            localStorage.setItem(cacheKey, JSON.stringify(response.data));
            localStorage.setItem(`${cacheKey}_time`, Date.now());
        }
        return response;
    },
    (error) => {
        // Handle network error - attempt to serve from cache
        if (!error.response && error.config?.method === 'get') {
            const cacheKey = `offline_cache_${error.config.url}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                console.warn("⚠️ Switching to Offline Read-Only Mode (Cached Data)");
                return Promise.resolve({
                    data: JSON.parse(cachedData),
                    status: 200,
                    statusText: 'OK (Offline Cache)',
                    config: error.config,
                    isOffline: true
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
