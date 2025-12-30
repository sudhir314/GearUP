import axios from 'axios';
import toast from 'react-hot-toast';

// AUTO-DETECT: Uses Render URL if available (Live), otherwise Localhost (Dev)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.message === "Network Error") {
            console.error("Network Error");
            toast.error("Cannot connect to server");
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401) {
            if (window.location.pathname === '/login') {
                return Promise.reject(error);
            }
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default apiClient;