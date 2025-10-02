import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    Building2,
    Award
} from 'lucide-react';
import { NavBar } from '@/components/partials/NavBar';
import { UserSideBar } from '@/components/partials/UserSideBar';
import { applicationFormSchema, type ApplicationFormData } from '@/schemas/applicationSchema';
import z from 'zod';
import { useNavigate } from 'react-router-dom';
import { submitApplicationService } from '@/services/applicationService';
import type { FormErrors } from '@/interfaces/formdata/formErrors';


const OrganizerApplicationPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formData, setFormData] = useState<ApplicationFormData>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        organization: '',
        organizationType: '',
        experience: '',
        previousEvents: '',
        motivation: '',
        identityProof: null,
        identityProofType: '',
        identityProofNumber: ''
    });

    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [fileName, setFileName] = useState<string>('');
    const navigate = useNavigate();

    const organizationTypes = [
        'Individual',
        'Company',
        'Non-Profit Organization',
        'Educational Institution',
        'Government Agency',
        'Other'
    ];

    const identityProofTypes = [
        'Passport',
        'National ID Card',
        'Driver\'s License',
        'Voter ID',
        'Other Government ID'
    ];

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { id, value } = e.currentTarget;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, identityProof: 'File size must be less than 5MB' }));
                return;
            }
            setFormData(prev => ({ ...prev, identityProof: file }));
            setFileName(file.name);
            if (errors.identityProof) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.identityProof;
                    return newErrors;
                });
            }
        }
    };

    const validate = (): boolean => {
        try {
            applicationFormSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: FormErrors = {};
                error.issues.forEach((err) => {
                    const field = err.path[0] as keyof FormErrors;
                    newErrors[field] = err.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async () => {
        if (validate()) {
            const res = await submitApplicationService(formData)
            if (res) setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col h-screen">
                <NavBar />
                <div className="flex flex-row w-full gap-5">
                    <UserSideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <div className="space-y-6 flex w-full flex-col mt-5 mr-1">
                        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                            <div className="max-w-2xl mx-auto">
                                <Card className="border-0 shadow-lg">
                                    <CardContent className="pt-12 pb-8 text-center">
                                        <div className="flex justify-center mb-6">
                                            <div className="bg-green-100 rounded-full p-4">
                                                <CheckCircle2 className="w-16 h-16 text-green-600" />
                                            </div>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
                                        <p className="text-lg text-gray-600 mb-2">
                                            Thank you for your interest in becoming an event organizer.
                                        </p>
                                        <p className="text-gray-500 mb-8">
                                            We'll review your application and get back to you within 2-3 business days via email.
                                        </p>
                                        <Button
                                            onClick={() => navigate("/")}
                                            size="lg"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Back to Home
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <NavBar />
            <div className="flex flex-row w-full gap-5">
                <UserSideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="space-y-6 flex w-full flex-col mt-5 mr-1">
                    <div className="max-w-full px-10">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Apply for Organizer Role
                            </h1>
                            <p className="text-gray-600">
                                Complete this application to become a verified event organizer on our platform.
                            </p>
                        </div>

                        <Card className="border-0 shadow-lg mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>Provide your basic contact details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-sm font-semibold">
                                            Full Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="h-11"
                                        />
                                        {errors.fullName && (
                                            <div className="flex items-center mt-2 text-red-500 text-sm">
                                                <AlertCircle className="h-4 w-4 mr-1.5" />
                                                <span>{errors.fullName}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold">
                                                Email Address <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="john@example.com"
                                                    className="pl-10 h-11"
                                                />
                                            </div>
                                            {errors.email && (
                                                <div className="flex items-center mt-2 text-red-500 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    <span>{errors.email}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-semibold">
                                                Phone Number <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="pl-10 h-11"
                                                />
                                            </div>
                                            {errors.phone && (
                                                <div className="flex items-center mt-2 text-red-500 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    <span>{errors.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-semibold">
                                            Street Address <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="123 Main Street"
                                                className="pl-10 h-11"
                                            />
                                        </div>
                                        {errors.address && (
                                            <div className="flex items-center mt-2 text-red-500 text-sm">
                                                <AlertCircle className="h-4 w-4 mr-1.5" />
                                                <span>{errors.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-sm font-semibold">
                                                City <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="New York"
                                                className="h-11"
                                            />
                                            {errors.city && (
                                                <div className="flex items-center mt-2 text-red-500 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    <span>{errors.city}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state" className="text-sm font-semibold">
                                                State/Province <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                placeholder="NY"
                                                className="h-11"
                                            />
                                            {errors.state && (
                                                <div className="flex items-center mt-2 text-red-500 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    <span>{errors.state}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="zipCode" className="text-sm font-semibold">
                                                ZIP Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleChange}
                                                placeholder="10001"
                                                className="h-11"
                                            />
                                            {errors.zipCode && (
                                                <div className="flex items-center mt-2 text-red-500 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    <span>{errors.zipCode}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    Organization Information
                                </CardTitle>
                                <CardDescription>Tell us about your organization or business</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="organizationType" className="text-sm font-semibold">
                                                Organization Type <span className="text-red-500">*</span>
                                            </Label>
                                            <select
                                                id="organizationType"
                                                value={formData.organizationType}
                                                onChange={handleChange}
                                                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select type</option>
                                                {organizationTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {errors.organizationType && (
                                                <div className="flex items-center mt-2 text-red-500 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    <span>{errors.organizationType}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="organization" className="text-sm font-semibold">
                                                Organization Name (Optional)
                                            </Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="organization"
                                                    value={formData.organization}
                                                    onChange={handleChange}
                                                    placeholder="Your Company/Organization"
                                                    className="pl-10 h-11"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-blue-600" />
                                    Experience & Motivation
                                </CardTitle>
                                <CardDescription>Share your experience and why you want to become an organizer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="experience" className="text-sm font-semibold">
                                            Event Organizing Experience <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select experience level</option>
                                            <option value="first-time">First Time Organizer</option>
                                            <option value="1-2">1-2 years</option>
                                            <option value="3-5">3-5 years</option>
                                            <option value="5+">5+ years</option>
                                        </select>
                                        {errors.experience && (
                                            <div className="flex items-center mt-2 text-red-500 text-sm">
                                                <AlertCircle className="h-4 w-4 mr-1.5" />
                                                <span>{errors.experience}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="previousEvents" className="text-sm font-semibold">
                                            Previous Events Organized (Optional)
                                        </Label>
                                        <textarea
                                            id="previousEvents"
                                            value={formData.previousEvents}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="List any previous events you've organized or been involved with..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="motivation" className="text-sm font-semibold">
                                            Why do you want to become an organizer? <span className="text-red-500">*</span>
                                        </Label>
                                        <textarea
                                            id="motivation"
                                            value={formData.motivation}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Tell us about your motivation and what kind of events you plan to organize..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {errors.motivation && (
                                            <div className="flex items-center mt-2 text-red-500 text-sm">
                                                <AlertCircle className="h-4 w-4 mr-1.5" />
                                                <span>{errors.motivation}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Identity Verification
                                </CardTitle>
                                <CardDescription>Upload a government-issued ID for verification purposes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="identityProofType" className="text-sm font-semibold">
                                                Identity Proof Type <span className="text-red-500">*</span>
                                            </Label>
                                            <select
                                                id="identityProofType"
                                                value={formData.identityProofType}
                                                onChange={handleChange}
                                                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select ID type</option>
                                                {identityProofTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {errors.identityProofType && (
                                                <div className="flex items-center mt-2 text-red-500 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    <span>{errors.identityProofType}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="identityProofNumber" className="text-sm font-semibold">
                                                ID Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="identityProofNumber"
                                                value={formData.identityProofNumber}
                                                onChange={handleChange}
                                                placeholder="Enter ID number"
                                                className="h-11"
                                            />
                                            {errors.identityProofNumber && (
                                                <div className="flex items-center mt-2 text-red-500 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    <span>{errors.identityProofNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="identityProof" className="text-sm font-semibold">
                                            Upload Identity Proof <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                            <input
                                                id="identityProof"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="identityProof" className="cursor-pointer">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                {fileName ? (
                                                    <p className="text-sm text-gray-700 font-medium">{fileName}</p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm text-gray-700 font-medium mb-1">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            JPG, PNG or PDF (max. 5MB)
                                                        </p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                        {errors.identityProof && (
                                            <div className="flex items-center mt-2 text-red-500 text-sm">
                                                <AlertCircle className="h-4 w-4 mr-1.5" />
                                                <span>{errors.identityProof}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Alert className="bg-blue-50 border-blue-200">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-sm text-gray-700">
                                            Your identity information is encrypted and will only be used for verification purposes. We take your privacy seriously.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-6">
                                <Alert className="mb-6 bg-gray-50 border-gray-200">
                                    <AlertDescription className="text-sm text-gray-700">
                                        By submitting this application, you agree to our terms and conditions. All information provided will be reviewed by our team.
                                    </AlertDescription>
                                </Alert>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={handleSubmit}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Submit Application
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrganizerApplicationPage