import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Search, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NavBar } from '@/components/partials/NavBar';
import type { EventDTO } from '@/interfaces/entities/EventDTO';
import { getAllEvents } from '@/services/eventService';

const BrowseEventsPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('published');
    const limit = 9;

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {

                const data = await getAllEvents(page, search, limit, status, category)
                setEvents(data.events);
                setTotalPages(data.pages);
            } catch (err) {
                setError('Failed to load events. Please try again later.');
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [page, search, category, status]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        setPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        setPage(1);
    };

    const handleLoadMore = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    const EventSkeleton = () => (
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
                <Skeleton className="w-full h-40 rounded-xl mb-4" />
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Events</h1>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Find exciting events near you or online. Filter by category, search by name, or explore what’s coming up!
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search events by name or location..."
                            value={search}
                            onChange={handleSearch}
                            className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Select value={category} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-48 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                                <Filter className="w-5 h-5 mr-2 text-indigo-500" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Arts">Arts & Culture</SelectItem>
                                <SelectItem value="Sports">Sports</SelectItem>
                                <SelectItem value="Music">Music</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-48 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                                <Filter className="w-5 h-5 mr-2 text-indigo-500" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="ended">Ended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <section className="mb-12">
                    {error && (
                        <Alert variant="destructive" className="mb-6 rounded-xl border-red-200">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, index) => <EventSkeleton key={index} />)
                        ) : events.length === 0 ? (
                            <Card className="col-span-full border-0 shadow-sm bg-white/80">
                                <CardContent className="text-center py-16">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                                    <p className="text-gray-600 mb-6">Try adjusting your search or filters to find more events.</p>
                                    <Button
                                        variant="outline"
                                        className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                                        onClick={() => {
                                            setSearch('');
                                            setCategory('all');
                                            setStatus('published');
                                            setPage(1);
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            events.map((event) => (
                                <Card
                                    key={event.id}
                                    className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/80"
                                >
                                    <CardContent className="p-6">
                                        <div className="relative mb-4">
                                            <img
                                                src={event.image || '/placeholder-event.jpg'}
                                                alt={event.name}
                                                className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 text-xs rounded">
                                                    {event.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                                            {event.name}
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm text-gray-700">{formatDate(event.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm text-gray-700 truncate">{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Ticket className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm text-gray-700">
                                                    {event.ticketTiers[0]?.price ? `From ₹${event.ticketTiers[0].price}` : 'Free'}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="mt-4 w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                                            onClick={() => navigate(`/events/${event.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

                {!loading && events.length > 0 && (
                    <div className="flex justify-center">
                        <Button
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 px-6"
                            disabled={page >= totalPages}
                            onClick={handleLoadMore}
                        >
                            Load More
                        </Button>
                    </div>
                )}

                <footer className="py-12 text-center text-gray-600">
                    <p className="mb-4">&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
                    <div className="flex justify-center gap-6">
                        <a href="/about" className="hover:text-indigo-600">About</a>
                        <a href="/contact" className="hover:text-indigo-600">Contact</a>
                        <a href="/privacy" className="hover:text-indigo-600">Privacy Policy</a>
                        <a href="/terms" className="hover:text-indigo-600">Terms of Service</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default BrowseEventsPage;