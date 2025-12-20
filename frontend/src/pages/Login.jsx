import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);

  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: ''
  });

  const handleChange = (e) => {
    if (authError) setAuthError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
        if (isLogin) {
            // --- LOGIN LOGIC ---
            if(!formData.email || !formData.password) throw new Error("Please fill in all fields");
            
            const { data } = await apiClient.post('/auth/login', {
                email: formData.email.toLowerCase().trim(), 
                password: formData.password
            });
            handleAuthSuccess(data, "Welcome back!");

        } else {
            // --- REGISTER LOGIC (Simple Version) ---
            if(!formData.name || !formData.email || !formData.password) throw new Error("All fields are required");
            if(formData.password !== formData.confirmPassword) throw new Error("Passwords do not match!");
            
            // Connects directly to your backend's simple /register route
            const { data } = await apiClient.post('/auth/register', {
                name: formData.name, 
                email: formData.email.toLowerCase().trim(), 
                password: formData.password
            });
            handleAuthSuccess(data, "Account created successfully!");
        }

    } catch (error) {
        console.error("Auth Error:", error);
        const serverMessage = error.response?.data?.message || error.message || "Authentication failed";
        setAuthError(serverMessage);
        toast.error(serverMessage);
    } finally { 
        setLoading(false); 
    }
  };

  const handleAuthSuccess = (data, message) => {
      if(data.token) {
        localStorage.setItem('token', data.token); // Use 'token' not 'accessToken' to match backend
        localStorage.setItem('user', JSON.stringify(data));
        if (onLogin) onLogin(data);
        toast.success(message);
        navigate('/');
      } else {
        setAuthError("Login successful but no token received.");
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="flex justify-center mb-2">
            <h1 className="text-logo" style={{fontSize: '2.5rem'}}>
                Gear <span>UP</span>
            </h1>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="mt-2 text-sm text-gray-600">
             {isLogin ? "Login to access your orders" : "Enter details to create account"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* NAME FIELD (Register Only) */}
            {!isLogin && (
                <div className="relative">
                    <User className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input name="name" type="text" placeholder="Full Name" required 
                        className="pl-10 w-full p-3 border rounded-lg focus:ring-blue-500 outline-none" 
                        onChange={handleChange} value={formData.name} 
                    />
                </div>
            )}

            {/* EMAIL FIELD */}
            <div className="relative">
                <Mail className={`absolute top-3 left-3 ${authError ? 'text-red-400' : 'text-gray-400'}`} size={20} />
                <input name="email" type="email" placeholder="Email Address" required 
                    className={`pl-10 w-full p-3 border rounded-lg outline-none transition-colors ${authError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                    onChange={handleChange} value={formData.email} 
                />
            </div>

            {/* PASSWORD FIELD */}
            <div className="relative">
                <Lock className={`absolute top-3 left-3 ${authError ? 'text-red-400' : 'text-gray-400'}`} size={20} />
                <input name="password" type="password" placeholder="Password" required 
                    className={`pl-10 w-full p-3 border rounded-lg outline-none transition-colors ${authError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`} 
                    onChange={handleChange} value={formData.password} 
                />
            </div>

            {/* CONFIRM PASSWORD (Register Only) */}
            {!isLogin && (
                <div className="relative">
                    <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input name="confirmPassword" type="password" placeholder="Confirm Password" required 
                        className={`pl-10 w-full p-3 border rounded-lg focus:ring-blue-500 outline-none ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : ''}`} 
                        onChange={handleChange} value={formData.confirmPassword}
                    />
                </div>
            )}

            {authError && <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle size={16} /><span>{authError}</span></div>}
            
            {isLogin && (
                <div className="text-right">
                    <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500">Forgot Password?</Link>
                </div>
            )}
          </div>

          <button type="submit" disabled={loading} className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition shadow-md hover:shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? <Loader className="animate-spin" /> : isLogin ? "Sign In" : "Create Account"} 
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setIsLogin(!isLogin); setAuthError(null); setFormData({name:'', email:'', password:'', confirmPassword:''}); }} className="font-bold text-blue-700 hover:underline">
                    {isLogin ? "Register Now" : "Login Here"}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;