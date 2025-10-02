import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, Mail, User, Ticket, Sparkles } from 'lucide-react';
import { signupSchema, type SignupValidationError } from '@/schemas/signupSchema';
import z from 'zod';
import { useAppDispatch } from '@/store';
import { signupUser } from '@/store/actions/auth/signupUser';
import { useNavigate } from 'react-router-dom';


const validateForm = (firstName: string, lastName: string, email: string, password: string, confirmPassword: string): SignupValidationError => {
    const errors: SignupValidationError = {};

    try {
        signupSchema.parse({ firstName, lastName, email, password, confirmPassword });
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.issues.forEach((err) => {
                const field = err.path[0];
                errors[field as keyof SignupValidationError] = err.message;
            })
        }
    }
    return errors;
};

const SignupPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<SignupValidationError>({});
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            confirmPassword: true,
        });

        const validationErrors = validateForm(firstName, lastName, email, password, confirmPassword);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsLoading(true);
            await dispatch(
                signupUser({ firstName, lastName, email, password, confirmPassword })
            );
        }

        setIsLoading(false);
    };


    const handleBlur = (field: keyof typeof touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const validationErrors = validateForm(firstName, lastName, email, password, confirmPassword);
        setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-3xl"></div>

                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 flex flex-col justify-around p-12 text-white w-full">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Ticket className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold">EventHub</span>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h1 className="text-5xl font-bold leading-tight mb-4">
                                Join Millions of
                                <br />
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Event Enthusiasts
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300 max-w-md">
                                Create your account and start discovering unforgettable experiences tailored just for you.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Personalized Recommendations</p>
                                    <p className="text-sm text-gray-400">Events curated for your interests</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Instant Booking</p>
                                    <p className="text-sm text-gray-400">Secure your spot in seconds</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Safe & Secure</p>
                                    <p className="text-sm text-gray-400">Your data is always protected</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Quote */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <p className="text-sm text-gray-300 italic">
                                "EventHub transformed how I discover and attend events. Absolutely love it!"
                            </p>
                        </div>
                        <p className="text-sm text-gray-400">- Alex Martinez, Community Member</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Ticket className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">EventHub</span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-gray-300">Start your event journey today</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
                                        First Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className={`h-5 w-5 transition-colors ${touched.firstName && errors.firstName ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-400'}`} />
                                        </div>
                                        <input
                                            id="firstName"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            onBlur={() => handleBlur('firstName')}
                                            className={`block w-full pl-12 pr-4 py-3 bg-white/10 border ${touched.firstName && errors.firstName ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500'} rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm`}
                                            placeholder="John"
                                        />
                                    </div>
                                    {touched.firstName && errors.firstName && (
                                        <div className="flex items-center mt-1.5 text-red-400 text-xs">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            <span>{errors.firstName}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
                                        Last Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className={`h-5 w-5 transition-colors ${touched.lastName && errors.lastName ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-400'}`} />
                                        </div>
                                        <input
                                            id="lastName"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            onBlur={() => handleBlur('lastName')}
                                            className={`block w-full pl-12 pr-4 py-3 bg-white/10 border ${touched.lastName && errors.lastName ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500'} rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm`}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    {touched.lastName && errors.lastName && (
                                        <div className="flex items-center mt-1.5 text-red-400 text-xs">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            <span>{errors.lastName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className={`h-5 w-5 transition-colors ${touched.email && errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-400'}`} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => handleBlur('email')}
                                        className={`block w-full pl-12 pr-4 py-3 bg-white/10 border ${touched.email && errors.email ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500'} rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm`}
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
                                        <Lock className={`h-5 w-5 transition-colors ${touched.password && errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-400'}`} />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        className={`block w-full pl-12 pr-12 py-3 bg-white/10 border ${touched.password && errors.password ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500'} rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm`}
                                        placeholder="Create a strong password"
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

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`h-5 w-5 transition-colors ${touched.confirmPassword && errors.confirmPassword ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-400'}`} />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onBlur={() => handleBlur('confirmPassword')}
                                        className={`block w-full pl-12 pr-12 py-3 bg-white/10 border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500'} rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm`}
                                        placeholder="Re-enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <div className="flex items-center mt-2 text-red-400 text-sm">
                                        <AlertCircle className="h-4 w-4 mr-1.5" />
                                        <span>{errors.confirmPassword}</span>
                                    </div>
                                )}
                            </div>


                            <div className="flex items-start pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="h-4 w-4 mt-0.5 text-blue-500 focus:ring-purple-500 focus:ring-offset-0 border-gray-400 rounded cursor-pointer"
                                />
                                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                                    I agree to the{' '}
                                    <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-cyan-600 hover:to-lime-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 hover:scale-[1.02] active:scale-[0.98] mt-6"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-300">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate("/login")}
                                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;