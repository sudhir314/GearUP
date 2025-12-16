import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, Loader, CheckCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation
  const validatePasswordStrength = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Step 1: Send OTP
        if (step === 1) {
            await apiClient.post('/auth/forgot-password', { email: formData.email });
            toast.success(`OTP sent to ${formData.email}`);
            setStep(2);
        }
        // Step 2: Verify OTP
        else if (step === 2) {
            await apiClient.post('/auth/verify-forgot-otp', { 
                email: formData.email, 
                otp: formData.otp.trim() 
            });
            toast.success("Verified! Create new password.");
            setStep(3);
        }
        // Step 3: Reset Password
        else if (step === 3) {
            if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
            if (!validatePasswordStrength(formData.password)) throw new Error("Password too weak (Min 8 chars, letter & number)");

            await apiClient.post('/auth/reset-password', {
                email: formData.email,
                otp: formData.otp.trim(),
                password: formData.password
            });
            toast.success("Password reset successful! Please login.");
            navigate('/login');
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Error occurred");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? "Enter your email to receive a code" : step === 2 ? "Enter the OTP sent to your email" : "Set your new secure password"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                
                {step === 1 && (
                    <div className="relative animate-in fade-in">
                        <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
                        <input name="email" type="email" placeholder="Email Address" required className="pl-10 w-full p-3 border rounded-lg focus:ring-green-500 outline-none" onChange={handleChange} value={formData.email} />
                    </div>
                )}

                {step === 2 && (
                    <div className="relative animate-in fade-in">
                        <KeyRound className="absolute top-3 left-3 text-green-600" size={20} />
                        <input name="otp" type="text" maxLength="6" placeholder="Enter 6-digit OTP" required className="pl-10 w-full p-3 border border-green-300 rounded-lg focus:ring-green-500 text-xl font-bold text-center outline-none tracking-[0.5em]" onChange={handleChange} value={formData.otp} autoFocus />
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                         <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border flex gap-2">
                            <ShieldAlert size={14} className="text-gray-400 mt-0.5 shrink-0" />
                            <span>Min 8 chars, letter & number required.</span>
                         </div>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                            <input name="password" type="password" placeholder="New Password" required className="pl-10 w-full p-3 border rounded-lg outline-none focus:ring-green-500" onChange={handleChange} />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                            <input name="confirmPassword" type="password" placeholder="Confirm New Password" required className="pl-10 w-full p-3 border rounded-lg outline-none focus:ring-green-500" onChange={handleChange} />
                        </div>
                    </div>
                )}

            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-black hover:bg-gray-800 transition shadow-lg">
                {loading ? <Loader className="animate-spin" /> : (step === 3 ? "Reset Password" : step === 2 ? "Verify Code" : "Send Code")}
                {!loading && <ArrowRight size={16} />}
            </button>
        </form>

        <div className="text-center mt-4">
            <button onClick={() => navigate('/login')} className="text-sm text-gray-500 hover:text-black flex items-center justify-center gap-1 mx-auto">
                <ArrowLeft size={14} /> Back to Login
            </button>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;