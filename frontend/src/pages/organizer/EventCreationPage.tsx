import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ImageIcon, Calendar, MapPin, Clock, Ticket, Sparkles, AlertCircle } from 'lucide-react';
import { NavBar } from '@/components/partials/NavBar';
import type { FormErrors } from '@/interfaces/formdata/formErrors';
import { EventCreationSchema, type EventFormData } from '@/schemas/eventSchema';
import z from 'zod';
import { createEventService } from '@/services/eventService';
import type { TicketTier } from '@/interfaces/formdata/ticketTier';


const EventCreationPage = () => {
    const [formData, setFormData] = useState<Partial<EventFormData>>({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'Technology',
        image: '',
        ticketTiers: []
    });

    const [newTier, setNewTier] = useState<Partial<TicketTier>>({
        name: '',
        price: 0,
        quantity: 0,
        description: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'File size must be less than 5MB' }));
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, image: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' }));
                return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            if (errors.image) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.image;
                    return newErrors;
                });
            }
        }
    };

    const validate = (): boolean => {
        try {
            EventCreationSchema.parse(formData);
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

    const handleCreateEvent = async () => {
        if (validate()) {
            const formDataToSend = new FormData();

            formDataToSend.append('name', formData.name as string);
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('date', formData.date as string);
            formDataToSend.append('time', formData.time || '09:00');
            formDataToSend.append('location', formData.location as string);
            formDataToSend.append('category', formData.category || 'Technology');
            formDataToSend.append('status', 'published');

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            if (formData.ticketTiers && formData.ticketTiers.length > 0) {
                formDataToSend.append('ticketTiers', JSON.stringify(formData.ticketTiers));
            }

            try {
                await createEventService(formDataToSend);
                
                setFormData({ 
                    name: '', 
                    description: '', 
                    date: '', 
                    time: '', 
                    location: '', 
                    category: 'Technology', 
                    image: '', 
                    ticketTiers: [] 
                });
                setImageFile(null);
                setImagePreview('');
            } catch (error) {
                console.error('Error creating event:', error);
                setErrors(prev => ({ 
                    ...prev, 
                    submit: 'Failed to create event. Please try again.' 
                }));
            }
        }
    };

    const addTicketTier = () => {
        if (newTier.name && newTier.price && newTier.quantity) {
            const tier: TicketTier = {
                id: Date.now().toString(),
                name: newTier.name,
                price: newTier.price,
                quantity: newTier.quantity,
                sold: 0,
                description: newTier.description || ''
            };
            setFormData({
                ...formData,
                ticketTiers: [...(formData.ticketTiers || []), tier]
            });
            setNewTier({ name: '', price: 0, quantity: 0, description: '' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <NavBar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-xl shadow-gray-200/50 backdrop-blur-sm bg-white/80">
                            <CardHeader className="border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Event Details</CardTitle>
                                        <CardDescription>Tell us about your amazing event</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Event Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Give your event an exciting name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 h-11"
                                    />
                                    {errors.name && (
                                        <div className="flex items-center mt-2 text-red-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            <span>{errors.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="What makes this event special? Share the details..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={5}
                                        className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                                    />
                                    {errors.description && (
                                        <div className="flex items-center mt-2 text-red-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            <span>{errors.description}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            Date *
                                        </Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 h-11"
                                        />
                                        {errors.date && (
                                            <div className="flex items-center mt-2 text-red-500 text-sm">
                                                <AlertCircle className="h-4 w-4 mr-1.5" />
                                                <span>{errors.date}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            Time *
                                        </Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 h-11"
                                        />
                                        {errors.time && (
                                            <div className="flex items-center mt-2 text-red-500 text-sm">
                                                <AlertCircle className="h-4 w-4 mr-1.5" />
                                                <span>{errors.time}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                        Location *
                                    </Label>
                                    <Input
                                        id="location"
                                        placeholder="Where will this happen?"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 h-11"
                                    />
                                    {errors.location && (
                                        <div className="flex items-center mt-2 text-red-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            <span>{errors.location}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                        <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 h-11 w-full">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Technology">💻 Technology</SelectItem>
                                            <SelectItem value="Business">💼 Business</SelectItem>
                                            <SelectItem value="Arts">🎨 Arts & Culture</SelectItem>
                                            <SelectItem value="Sports">⚽ Sports</SelectItem>
                                            <SelectItem value="Music">🎵 Music</SelectItem>
                                            <SelectItem value="Education">📚 Education</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <div className="flex items-center mt-2 text-red-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            <span>{errors.category}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl shadow-gray-200/50 backdrop-blur-sm bg-white/80">
                            <CardHeader className="border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Ticket className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Ticket Tiers</CardTitle>
                                        <CardDescription>Create pricing options for attendees</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {formData.ticketTiers && formData.ticketTiers.length > 0 && (
                                    <div className="space-y-3">
                                        {formData.ticketTiers.map((tier, index) => (
                                            <div key={tier.id} className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 transition-all hover:shadow-lg hover:border-indigo-300">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900 text-lg">{tier.name}</h4>
                                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                                                                Tier {index + 1}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-2xl font-bold text-indigo-600">₹{tier.price}</span>
                                                                <span className="text-sm text-gray-500">per ticket</span>
                                                            </div>
                                                            <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">
                                                                {tier.quantity} available
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            ticketTiers: formData.ticketTiers?.filter((_, i) => i !== index)
                                                        })}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white hover:border-indigo-300 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-indigo-600" />
                                        <h4 className="font-bold text-gray-900">Add New Tier</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tierName" className="text-sm font-semibold text-gray-700">Tier Name</Label>
                                            <Input
                                                id="tierName"
                                                placeholder="e.g., Early Bird, VIP"
                                                value={newTier.name}
                                                onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                                                className="border-gray-200 h-10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tierPrice" className="text-sm font-semibold text-gray-700">Price (₹)</Label>
                                            <Input
                                                id="tierPrice"
                                                type="number"
                                                placeholder="0"
                                                value={newTier.price || ''}
                                                onChange={(e) => setNewTier({ ...newTier, price: parseFloat(e.target.value) || 0 })}
                                                className="border-gray-200 h-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tierQuantity" className="text-sm font-semibold text-gray-700">Available Quantity</Label>
                                        <Input
                                            id="tierQuantity"
                                            type="number"
                                            placeholder="0"
                                            value={newTier.quantity || ''}
                                            onChange={(e) => setNewTier({ ...newTier, quantity: parseInt(e.target.value) || 0 })}
                                            className="border-gray-200 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tierDesc" className="text-sm font-semibold text-gray-700">Description</Label>
                                        <Input
                                            id="tierDesc"
                                            placeholder="Brief description of this tier"
                                            value={newTier.description}
                                            onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                                            className="border-gray-200 h-10"
                                        />
                                    </div>
                                    <Button
                                        onClick={addTicketTier}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-11"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Ticket Tier
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Card className="border-0 shadow-xl shadow-gray-200/50 backdrop-blur-sm bg-white/80">
                                <CardHeader className="border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-indigo-600" />
                                        <CardTitle className="text-lg">Event Image</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="imageUpload"
                                            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg cursor-pointer transition-all shadow-md"
                                        >
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Choose Image
                                        </label>
                                    </div>
                                    {imagePreview ? (
                                        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg group">
                                            <img
                                                src={imagePreview}
                                                alt="Event preview"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            <button
                                                onClick={() => {
                                                    setImagePreview('');
                                                    setImageFile(null);
                                                }}
                                                className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                            <ImageIcon className="w-16 h-16 text-gray-300 mb-3" />
                                            <p className="text-sm text-gray-400 font-medium">No image uploaded</p>
                                            <p className="text-xs text-gray-400">Click the button above to upload</p>
                                        </div>
                                    )}
                                    {errors.image && (
                                        <div className="flex items-center mt-2 text-red-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            <span>{errors.image}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl shadow-gray-200/50 backdrop-blur-sm bg-white/80">
                                <CardHeader className="border-b border-gray-100">
                                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Ticket Tiers</span>
                                        <span className="text-xl font-bold text-blue-600">{formData.ticketTiers?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Total Capacity</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {formData.ticketTiers?.reduce((sum, tier) => sum + tier.quantity, 0) || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Category</span>
                                        <span className="text-sm font-bold text-purple-600">{formData.category}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                onClick={handleCreateEvent}
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Publish Event
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventCreationPage;