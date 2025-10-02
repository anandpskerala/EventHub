import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, Mail, Ticket, Sparkles } from 'lucide-react';
import { loginUser } from '@/store/actions/auth/loginUser';
import type { LoginFormData } from '@/interfaces/formdata/loginFormdata';
import { useAppDispatch } from '@/store';
import { loginSchema, type LoginValidationError } from '@/schemas/loginSchema';
import z from 'zod';
import { useNavigate } from 'react-router-dom';



const validateForm = (email: string, password: string): LoginValidationError => {
    const errors: LoginValidationError = {};

    try {
        loginSchema.parse({ email, password });
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.issues.forEach((err) => {
                const field = err.path[0];
                errors[field as keyof LoginValidationError] = err.message
            })
        }
    }

    return errors;
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<LoginValidationError>({});
    const [touched, setTouched] = useState({ email: false, password: false });
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        const validationErrors = validateForm(email, password);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsLoading(true);
            const formadata: LoginFormData = {
                email,
                password
            }
            await dispatch(loginUser(formadata));
            setIsLoading(false);
        }
    };

    const handleEmailBlur = () => {
        setTouched(prev => ({ ...prev, email: true }));
        const validationErrors = validateForm(email, password);
        setErrors(prev => ({ ...prev, email: validationErrors.email }));
    };

    const handlePasswordBlur = () => {
        setTouched(prev => ({ ...prev, password: true }));
        const validationErrors = validateForm(email, password);
        setErrors(prev => ({ ...prev, password: validationErrors.password }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex font-sans">
            
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-3xl"></div>

                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 flex flex-col justify-around p-12 text-white w-full">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                            <Ticket className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold">EventHub</span>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h1 className="text-5xl font-bold leading-tight mb-4">
                                Discover Amazing
                                <br />
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Experiences
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300 max-w-md">
                                Join millions of people discovering and booking unforgettable experiences every day.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <p className="text-sm text-gray-300 italic">
                                "The best platform for discovering local events and connecting with communities."
                            </p>
                        </div>
                        <p className="text-sm text-gray-400">- Sarah Johnson, Event Organizer</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Ticket className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">EventHub</span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-gray-300">Sign in to continue your journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className={`h-5 w-5 transition-colors ${touched.email && errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-400'
                                            }`} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={handleEmailBlur}
                                        className={`block w-full pl-12 pr-4 py-3.5 bg-white/10 border ${touched.email && errors.email
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-white/20 focus:border-blue-500'
                                            } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-sm`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {touched.email && errors.email && (
                                    <div className="flex items-center mt-2 text-red-400 text-sm">
                                        <AlertCircle className="h-4 w-4 mr-1.5" />
                                        <span>{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`h-5 w-5 transition-colors ${touched.password && errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-400'
                                            }`} />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={handlePasswordBlur}
                                        className={`block w-full pl-12 pr-12 py-3.5 bg-white/10 border ${touched.password && errors.password
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-white/20 focus:border-blue-500'
                                            } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-sm`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {touched.password && errors.password && (
                                    <div className="flex items-center mt-2 text-red-400 text-sm">
                                        <AlertCircle className="h-4 w-4 mr-1.5" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                            </div>


                            <div className="flex items-center justify-between mb-10">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 border-gray-400 rounded cursor-pointer bg-white/10"
                                    />
                                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">Remember me</span>
                                </label>
                                <button onClick={() => console.log('Forgot password clicked')} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-cyan-600 hover:to-lime-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-300">
                                Don't have an account?{' '}
                                <button 
                                onClick={() => navigate("/signup")} 
                                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                                    Sign up for free
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            By signing in, you agree to our{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">Terms</a>
                            {' '}and{' '}
                            <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;