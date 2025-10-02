import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, TrendingUp, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter, X, Ticket, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TicketTier } from '@/interfaces/formdata/ticketTier';
import type { EventDTO } from '@/interfaces/entities/EventDTO';
import { NavBar } from '@/components/partials/NavBar';
import { OrganizerSideBar } from '@/components/partials/OrganizerSideBar';
import { AxiosError } from 'axios';
import { deleteEventService, getOrganizerEvents } from '@/services/eventService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

const OrganizerEventListing = () => {
    const [events, setEvents] = useState<EventDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const categories = ["Technology", "Business", "Arts", "Sports", "Music", "Education"];
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const naviagte = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
            });

            if (debouncedSearch) params.append('search', debouncedSearch);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);

            const data = await getOrganizerEvents(params);
            setEvents(data.events);
            setTotalPages(Math.ceil(data.total / pageSize));
            setCurrentPage(data.page);
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || 'Failed to load events');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [debouncedSearch, statusFilter, categoryFilter, currentPage, pageSize]);

    const handleDelete = (eventId: string) => {
        setEventToDelete(eventId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        console.log(eventToDelete)
        if (!eventToDelete) return;

        setIsDeleting(true);
        try {
            await deleteEventService(eventToDelete);
            await fetchEvents();
            setDeleteDialogOpen(false);
            setEventToDelete(null);
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || 'Failed to delete event');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setEventToDelete(null);
    };

    const handleCreateEvent = () => {
        naviagte("/organizer/create-event");
    };

    const handleEditEvent = (eventId: string) => {
        naviagte(`/organizer/${eventId}/edit`)
    };

    const handleViewBookings = () => {
       naviagte("/organizer/bookings") 
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-700 border-green-200';
            case 'draft': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ended': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const calculateRevenue = (ticketTiers: TicketTier[]) => {
        return ticketTiers.reduce((sum, tier) => sum + (tier.price * (tier.sold ?? 0)), 0);
    };

    const activeFiltersCount = [
        statusFilter !== 'all',
        categoryFilter !== 'all',
        searchQuery !== ''
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCategoryFilter('all');
    };

    const EventSkeleton = () => (
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <Skeleton className="w-full lg:w-64 h-40 rounded-xl" />
                    <div className="flex-grow space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-2/3" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
            <NavBar />

            <div className="flex flex-row w-full">
                <OrganizerSideBar name="events" />

                <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Events</h1>
                            <p className="text-gray-600">Manage and track all your events in one place</p>
                        </div>
                        <div className="flex gap-3">
                            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleCreateEvent}>
                                <Plus className="h-5 w-5" />
                                Create Event
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="Search events by name, location, or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setShowFilters(!showFilters)}
                                className="gap-2 h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <Badge className="ml-1 bg-blue-600 hover:bg-blue-700 text-white">
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>
                        </div>

                        {showFilters && (
                            <Card className="border-0 shadow-sm bg-white">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">Filter Events</h3>
                                        {activeFiltersCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAllFilters}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                Clear all
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                Status
                                            </label>
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                                                    <SelectValue placeholder="All Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="ended">Ended</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                Category
                                            </label>
                                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                                                    <SelectValue placeholder="All Categories" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                Results per page
                                            </label>
                                            <Select value={pageSize.toString()} onValueChange={(val) => {
                                                setPageSize(Number(val));
                                                setCurrentPage(1);
                                            }}>
                                                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                                                    <SelectValue placeholder="Page Size" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="10">10 per page</SelectItem>
                                                    <SelectItem value="20">20 per page</SelectItem>
                                                    <SelectItem value="50">50 per page</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6 rounded-xl border-red-200">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-5">
                        {loading ? (
                            <>
                                <EventSkeleton />
                                <EventSkeleton />
                                <EventSkeleton />
                            </>
                        ) : events.length === 0 ? (
                            <Card className="border-0 shadow-sm">
                                <CardContent className="text-center py-16">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                                    <p className="text-gray-600 mb-6">
                                        {activeFiltersCount > 0
                                            ? "Try adjusting your filters to see more results"
                                            : "Get started by creating your first event"}
                                    </p>
                                    {activeFiltersCount > 0 ? (
                                        <Button variant="outline" onClick={clearAllFilters}>
                                            Clear filters
                                        </Button>
                                    ) : (
                                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleCreateEvent}>
                                            <Plus className="h-4 w-4" />
                                            Create your first event
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            events.map(event => (
                                <Card key={event.id} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="relative flex-shrink-0 overflow-hidden rounded-xl">
                                                <img
                                                    src={event.image}
                                                    alt={event.name}
                                                    className="w-full lg:w-64 h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <Badge className={`${getStatusColor(event.status)} border font-medium px-3 py-1`}>
                                                        {event.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                                                            {event.name}
                                                        </h3>
                                                        <p className="text-gray-600 line-clamp-2 leading-relaxed">
                                                            {event.description}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                                                            title="View Bookings"
                                                            onClick={() => handleViewBookings()}
                                                        >
                                                            <Ticket className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                                                            title="Edit Event"
                                                            onClick={() => handleEditEvent(event.id)}
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(event.id)}
                                                            className="hover:bg-red-50 hover:text-red-600 rounded-lg"
                                                            title="Delete Event"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                            <Calendar size={18} className="text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-gray-500 mb-0.5">Date</p>
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {formatDate(event.date)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                            <MapPin size={18} className="text-green-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-gray-500 mb-0.5">Location</p>
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {event.location}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                            <Users size={18} className="text-purple-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-gray-500 mb-0.5">Tickets Sold</p>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {event.soldTickets ?? 0} / {event.totalTickets ?? 0}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                            <TrendingUp size={18} className="text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-blue-700 mb-0.5">Revenue</p>
                                                            <p className="text-sm font-bold text-blue-900">
                                                                ₹{calculateRevenue(event.ticketTiers).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {event.ticketTiers.map(tier => (
                                                        <Badge
                                                            key={tier.id}
                                                            variant="outline"
                                                            className="px-3 py-1.5 bg-white border-gray-200 text-gray-700"
                                                        >
                                                            <span className="font-semibold">{tier.name}</span>
                                                            <span className="mx-1.5">•</span>
                                                            <span>₹{tier.price}</span>
                                                            <span className="mx-1.5">•</span>
                                                            <span className="text-gray-500">{tier.sold ?? 0}/{tier.quantity}</span>
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-gray-600 font-medium">Sales Progress</span>
                                                        <span className="text-gray-900 font-bold">
                                                            {event.totalTickets > 0 
                                                                ? Math.round(((event.soldTickets ?? 0) / event.totalTickets) * 100)
                                                                : 0}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                                                            style={{ 
                                                                width: `${event.totalTickets > 0 
                                                                    ? ((event.soldTickets ?? 0) / event.totalTickets) * 100 
                                                                    : 0}%` 
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {!loading && events.length > 0 && (
                        <Card className="mt-8 border-0 shadow-sm">
                            <CardContent className="py-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-sm text-gray-600">
                                        Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                                        <span className="font-semibold text-gray-900">{totalPages}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="gap-2 rounded-lg border-gray-200 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="gap-2 rounded-lg border-gray-200 disabled:opacity-50"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-xl">Delete Event</AlertDialogTitle>
                                <AlertDialogDescription className="mt-2">
                                    Are you sure you want to delete this event? This action cannot be undone and will permanently remove all event data, tickets, and registrations.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Deleting...
                                </span>
                            ) : (
                                'Delete Event'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default OrganizerEventListing;