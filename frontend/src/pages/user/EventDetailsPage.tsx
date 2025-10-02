import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NavBar } from '@/components/partials/NavBar';
import type { EventDTO } from '@/interfaces/entities/EventDTO';
import { getEventById } from '@/services/eventService';

const EventDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const data = await getEventById(id);
                setEvent(data);
            } catch (err) {
                setError('Failed to load event details. Please try again later.');
                console.error('Error fetching event:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${period}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'draft':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ended':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <NavBar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Skeleton className="h-8 w-32 mb-8" />
                    <Card className="border-0 shadow-xl">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Skeleton className="w-full h-96 rounded-xl mb-6" />
                                    <Skeleton className="h-8 w-2/3 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6 mb-6" />
                                    <Skeleton className="h-10 w-40" />
                                </div>
                                <div className="lg:col-span-1">
                                    <Skeleton className="h-64 w-full mb-6" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <NavBar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Alert variant="destructive" className="mb-6 rounded-xl border-red-200">
                        <AlertDescription>{error || 'Event not found.'}</AlertDescription>
                    </Alert>
                    <Button
                        variant="outline"
                        className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <NavBar />
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Button
                    variant="outline"
                    className="mb-8 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>
                <Card className="border-0 shadow-xl shadow-gray-200/50 backdrop-blur-sm bg-white/80">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="relative mb-6">
                                    <img
                                        src={event.image || '/placeholder-event.jpg'}
                                        alt={event.name}
                                        className="w-full h-96 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <Badge
                                        className={`absolute top-4 right-4 ${getStatusColor(event.status)} font-medium px-3 py-1`}
                                    >
                                        {event.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>
                                <p className="text-gray-600 leading-relaxed mb-6">{event.description}</p>
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-indigo-500" />
                                        <span className="text-gray-700">{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-indigo-500" />
                                        <span className="text-gray-700">{formatTime(event.time)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                        <span className="text-gray-700">{event.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Ticket className="w-5 h-5 text-indigo-500" />
                                        <span className="text-gray-700">{event.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="border-0 shadow-lg bg-white/90">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Ticket Options</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {event.ticketTiers.length === 0 ? (
                                            <p className="text-gray-600">No ticket tiers available.</p>
                                        ) : (
                                            event.ticketTiers.map((tier) => (
                                                <div
                                                    key={tier.id}
                                                    className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50"
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                                                        <span className="text-xl font-bold text-indigo-600">₹{tier.price}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{tier.description || 'No description'}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-700">
                                                            {tier.quantity - (tier.sold || 0)} tickets left
                                                        </span>
                                                        <Badge
                                                            className={
                                                                tier.quantity - (tier.sold || 0) > 0
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }
                                                        >
                                                            {tier.quantity - (tier.sold || 0) > 0 ? 'Available' : 'Sold Out'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <Button
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 mt-4"
                                            disabled={event.ticketTiers.every((tier) => tier.quantity - (tier.sold || 0) === 0)}
                                            onClick={() => navigate(`/events/${event.id}/booking`)}
                                        >
                                            <Ticket className="w-5 h-5 mr-2" />
                                            Buy Tickets
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-lg bg-white/90 mt-6">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Event Stats</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Total Tickets</span>
                                            <span className="text-lg font-bold text-blue-600">{event.totalTickets}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Tickets Sold</span>
                                            <span className="text-lg font-bold text-green-600">{event.soldTickets}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Category</span>
                                            <span className="text-sm font-bold text-purple-600">{event.category}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EventDetailsPage;