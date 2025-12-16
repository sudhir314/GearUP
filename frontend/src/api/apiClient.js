import axios from 'axios';
import toast from 'react-hot-toast';

// Your Render Backend URL
// const API_URL = 'https://phitku-natural-care.onrender.com/api';
        const API_URL = 'http://localhost:5000/api'; // LOCAL DEVELOPMENT


const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    // FIX: Removed the hardcoded 'Content-Type' header. 
    // This allows axios to automatically handle Image Uploads.
});

// Request Interceptor
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Response Interceptor
apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (error.message === "Network Error") {
            toast.error("Cannot connect to server. Check internet.");
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {}, {
                    withCredentials: true
                });

                const newAccessToken = refreshRes.data.accessToken;
                localStorage.setItem('token', newAccessToken);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest); 
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Optional redirect to login
                return Promise.reject(refreshError); 
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;