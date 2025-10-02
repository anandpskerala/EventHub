import { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, Ticket, Filter, Search, Download, User, CreditCard, ChevronLeft, ChevronRight, XCircle, Mail, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { EventDTO } from '@/interfaces/entities/EventDTO';
import type { BookingDTO } from '@/interfaces/entities/BookingDTO';
import { useAppSelector, type RootState } from '@/store';
import type { User as UserType } from '@/interfaces/entities/User';
import type { BookingDetailsModalProps } from '@/interfaces/props/bookingDetailsProps';
import { cancelBookingService, downloadTicketService, getUserBookings } from '@/services/bookingService';
import { NavBar } from '@/components/partials/NavBar';
import { UserSideBar } from '@/components/partials/UserSideBar';

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        confirmed: 'bg-green-100 text-green-800 border-green-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

function BookingDetailsModal({ booking, event, user, onClose }: BookingDetailsModalProps) {
    if (!booking || !event || !user) return null;

    const ticketDetails = booking.tickets.map(ticket => {
        const tier = event.ticketTiers.find(t => t.id === ticket.tierId);
        return {
            ...ticket,
            tier: tier
        };
    });

    const totalTickets = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);
    const subtotal = booking.tickets.reduce((sum, t) => sum + (t.quantity * t.price), 0);

    const handleCancelBooking = async () => {
        try {
            await cancelBookingService(booking.id);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Failed to cancel booking:', error);
        }
    };

    return (
        <Dialog open={!!booking} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-2xl mb-2">Booking Details</DialogTitle>
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-gray-500">Order ID: {booking.orderId}</p>
                                <Badge className={getStatusColor(booking.status)}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                            Event Information
                        </h3>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <img
                                        src={event.image}
                                        alt={event.name}
                                        className="w-32 h-32 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-semibold text-xl">{event.name}</h4>
                                        <p className="text-sm text-gray-600">{event.description}</p>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="flex items-center text-sm">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatDate(event.date)}
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatTime(event.time)}
                                            </div>
                                            <div className="flex items-center text-sm col-span-2">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                {event.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <User className="w-5 h-5 mr-2 text-gray-600" />
                            Customer Information
                        </h3>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Name</p>
                                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="font-medium flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <Ticket className="w-5 h-5 mr-2 text-gray-600" />
                            Ticket Details
                        </h3>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    {ticketDetails.map((ticket, idx) => (
                                        <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium">{ticket.tier?.name || 'Unknown Tier'}</p>
                                                <p className="text-sm text-gray-600">{ticket.tier?.description}</p>
                                                <p className="text-sm text-gray-500 mt-1">Quantity: {ticket.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">₹{ticket.price.toFixed(2)} each</p>
                                                <p className="text-sm text-gray-600">
                                                    Total: ₹{(ticket.quantity * ticket.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal ({totalTickets} tickets)</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span>₹ {booking.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                            Payment Information
                        </h3>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                                        <p className="font-medium capitalize">{booking.paymentMethod.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                                        <p className="font-medium text-sm">{booking.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Booking Date</p>
                                        <p className="font-medium">{formatDateTime(booking.createdAt)}</p>
                                    </div>
                                    {booking.status === 'pending' && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500 mb-1">Payment Due By</p>
                                            <p className="font-medium text-yellow-600">{formatDateTime(booking.lockedUntil)}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-3 pt-4">

                        {booking.status.toLowerCase() === 'confirmed' && (
                            <>
                                <Button className="flex-1" variant="outline" onClick={() => downloadTicketService(booking.id)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Receipt
                                </Button>
                                <Button
                                    className="flex-1"
                                    variant="destructive"
                                    onClick={handleCancelBooking}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Booking
                                </Button></>

                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const ITEMS_PER_PAGE = 5;

const BookingsListingPage = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [events, setEvents] = useState<EventDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const eventMap = useMemo(() => {
        return events.reduce((acc, event) => {
            acc[event.id] = event;
            return acc;
        }, {} as Record<string, EventDTO>);
    }, [events]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const event = eventMap[booking.eventId];
            const matchesSearch = event?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.orderId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, eventMap, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getTicketDetails = (booking: BookingDTO, event: EventDTO) => {
        return booking.tickets.map(ticket => {
            const tier = event.ticketTiers.find(t => t.id === ticket.tierId);
            return {
                ...ticket,
                tierName: tier?.name || 'Unknown Tier'
            };
        });
    };

    const handleViewDetails = (booking: BookingDTO) => {
        setSelectedBooking(booking);
    };

    const handleCloseDetails = () => {
        setSelectedBooking(null);
    };

    useEffect(() => {
        const fetchBookings = async () => {
            const bookingData = await getUserBookings();
            setBookings(bookingData.bookings);
            setEvents(bookingData.events);
        }
        fetchBookings();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-6 mx-0">
            <NavBar />
            <div className="flex flex-row w-full gap-3">
                <UserSideBar name='bookings' onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
                <div className="max-w-7xl w-full space-y-6 p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-600 mt-1">Manage and view all your event bookings</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by event name or order ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <Filter className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {filteredBookings.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {paginatedBookings.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-12">
                                        <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                                        <p className="text-gray-500">Try adjusting your search or filters</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            paginatedBookings.map((booking) => {
                                const event = eventMap[booking.eventId];
                                if (!event) return null;

                                const ticketDetails = getTicketDetails(booking, event);
                                const totalTickets = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);

                                return (
                                    <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-48 h-48 md:h-auto">
                                                <img
                                                    src={event.image}
                                                    alt={event.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 p-6">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                                    {event.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-500">Order ID: {booking.orderId}</p>
                                                            </div>
                                                            <Badge className={getStatusColor(booking.status.toLowerCase())}>
                                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                                {formatDate(event.date)}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                                {formatTime(event.time)}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600 md:col-span-2">
                                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                                {event.location}
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Ticket className="w-4 h-4 text-gray-600" />
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    Tickets ({totalTickets})
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                {ticketDetails.map((ticket, idx) => (
                                                                    <div key={idx} className="flex justify-between text-sm">
                                                                        <span className="text-gray-600">
                                                                            {ticket.quantity}x {ticket.tierName}
                                                                        </span>
                                                                        <span className="text-gray-900 font-medium">
                                                                           ₹{(ticket.quantity * ticket.price).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                <span>Booked on {formatDateTime(booking.createdAt)}</span>
                                                                <span>•</span>
                                                                <span className="capitalize">Payment: {booking.paymentMethod.replace('_', ' ')}</span>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewDetails(booking)}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end">
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                                            <p className="text-2xl font-bold text-gray-900 flex items-center">
                                                                <IndianRupee className="w-5 h-5" />
                                                                {booking.totalAmount.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>

                    {totalPages > 1 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(page)}
                                                        className="w-10"
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                return <span key={page} className="text-gray-400">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <BookingDetailsModal
                booking={selectedBooking}
                event={selectedBooking ? eventMap[selectedBooking.eventId] : null}
                user={selectedBooking ? user as UserType : null}
                onClose={handleCloseDetails}
            />
        </div>
    );
}

export default BookingsListingPage;