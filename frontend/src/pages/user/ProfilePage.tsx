import { useState } from 'react';
import {
    AlertCircle,
    Camera,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserSideBar } from '@/components/partials/UserSideBar';
import { NavBar } from '@/components/partials/NavBar';
import { useAppSelector, type RootState } from '@/store';
import type { User } from '@/interfaces/entities/User';
import { changePasswordService, changeUserDataService } from '@/services/profileService';
import { toast } from 'sonner';
import { passwordSchema, type PasswordFormData } from '@/schemas/passwordSchema';
import z from 'zod';
import { useNavigate } from 'react-router-dom';



const ProfilePage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user: User = useAppSelector((state: RootState) => state.auth.user as User);
    const [formData, setFormData] = useState(user);
    const [userData, setUserData] = useState(user);
    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        password: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPassErrors] = useState<Partial<PasswordFormData>>({});
    const navigate = useNavigate();

    const changeUserData = async () => {
        const res = await changeUserDataService({ firstName: formData.firstName, lastName: formData.lastName });
        if (res) {
            toast.success(res);
            setUserData(formData);
        }
    }

    const changePassForm = (e: React.FormEvent<HTMLInputElement>) => {
        const { id, value } = e.currentTarget;
        setPasswordData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const validatePassForm = () => {
        const errors: Partial<PasswordFormData> = {}
        try {
            passwordSchema.parse(passwordData);
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((err) => {
                    const field = err.path[0];
                    errors[field as keyof PasswordFormData] = err.message;
                })
            }
        }
        return errors;
    }

    const changePassword = async () => {
        const errors = validatePassForm();
        setPassErrors(errors);
        if (Object.keys(errors).length == 0) {
            const res = await changePasswordService(passwordData);
            if (res) {
                toast.success(res);
            }
        }
    }


    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <NavBar />
            <div className="flex flex-row w-full gap-5">
                <UserSideBar name="profile" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="space-y-6 flex w-full flex-col mt-2 mr-1">
                    <Card className="border-0 shadow-lg overflow-hidden py-0">
                        <div className="h-24 p-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                        <CardContent className="p-8">
                            <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16 sm:-mt-20">
                                <div className="relative group">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback className="text-2xl">{user.firstName.substring(0, 2).toLocaleUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <button className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <Camera className="text-white" size={24} />
                                    </button>
                                </div>
                                <div className="flex-1 mt-16 sm:mt-12">
                                    <h2 className="text-2xl font-bold">{userData?.firstName} {userData?.lastName}</h2>
                                    <p className="text-gray-500 mt-1">Member since {new Date(userData.createdAt).toDateString()}</p>
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                                            <Camera size={16} className="mr-2" />
                                            Change Photo
                                        </Button>
                                        {userData.image && (
                                            <Button size="sm" variant="outline">Remove</Button>
                                        )}
                                    </div>
                                </div>
                                <Button className="lg:mt-10 cursor-pointer" onClick={() => navigate("/apply-for-organizer")}>Apply For Organizer</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details and contact information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={formData?.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold">Last Name</Label>

                                        <Input
                                            id="lastName"
                                            value={formData?.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData?.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="pl-10 h-11 cursor-not-allowed"
                                                disabled
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        size="lg"
                                        type="button"
                                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                        onClick={changeUserData}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium">
                                        Current Password
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordData?.password}
                                        placeholder="Enter your current password"
                                        onChange={changePassForm}
                                        required
                                    />
                                    {passwordErrors.password && (
                                        <div className="flex items-center mt-2 text-red-400 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            <span>{passwordErrors.password}</span>
                                        </div>
                                        )
                                    }
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium">
                                        New Password
                                    </label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwordData?.newPassword}
                                        placeholder="Enter new password"
                                        onChange={changePassForm}
                                        required
                                    />
                                    {passwordErrors.newPassword && (
                                        <div className="flex items-center mt-2 text-red-400 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            <span>{passwordErrors.newPassword}</span>
                                        </div>
                                        )
                                    }
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium"
                                    >
                                        Confirm Password
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwordData?.confirmPassword}
                                        placeholder="Re-enter new password"
                                        onChange={changePassForm}
                                        required
                                    />

                                    {passwordErrors.confirmPassword && (
                                        <div className="flex items-center mt-2 text-red-400 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            <span>{passwordErrors.confirmPassword}</span>
                                        </div>
                                        )
                                    }
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        size="lg"
                                        type="button"
                                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                        onClick={changePassword}
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>


                    <Card className="border-0 shadow-lg border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions for your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                                <div>
                                    <p className="font-medium text-red-900">Delete Account</p>
                                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                                </div>
                                <Button variant="destructive">Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage