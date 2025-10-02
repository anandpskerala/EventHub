import { useState, useEffect, useMemo } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    Ticket,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    XCircle,
    User as UserIcon,
    IndianRupee,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { NavBar } from "@/components/partials/NavBar";
import { OrganizerSideBar } from "@/components/partials/OrganizerSideBar";
import { getOrganizerBookings, cancelBookingService } from "@/services/bookingService";
import { getOrganizerEvents } from "@/services/eventService";
import type { EventDTO } from "@/interfaces/entities/EventDTO";
import { useAppSelector, type RootState } from "@/store";
import { toast } from "sonner";
import type { BookingDTO } from "@/interfaces/entities/BookingDTO";
import type { User } from "@/interfaces/entities/User";
import { getUserDetails } from "@/services/profileService";

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        confirmed: "bg-green-100 text-green-800 border-green-200",
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        cancelled: "bg-red-100 text-red-800 border-red-200",
        refunded: "bg-gray-100 text-gray-800 border-gray-200",
        expired: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};


const BookingAttendeesPage = () => {
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [events, setEvents] = useState<EventDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [eventFilter, setEventFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
    const [attendeeDetails, setAttendeeDetails] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const organizer = useAppSelector((state: RootState) => state.auth.user);

    const eventMap = useMemo(() => {
        return events.reduce((acc, event) => {
            acc[event.id] = event;
            return acc;
        }, {} as Record<string, EventDTO>);
    }, [events]);

    const fetchData = async () => {
        try {
            if (!organizer?.id) {
                toast.error("Organizer not found");
                return;
            }
            const params = new URLSearchParams();
            params.append("userId", organizer.id);
            params.append("page", currentPage.toString());
            params.append("search", searchQuery);
            params.append("status", statusFilter);
            if (eventFilter !== "all") {
                params.append("eventId", eventFilter);
            }

            const [bookingsResponse, eventsResponse] = await Promise.all([
                getOrganizerBookings(params),
                getOrganizerEvents(new URLSearchParams({ userId: organizer.id }))
            ]);
            setBookings(bookingsResponse.bookings);
            setTotalPages(bookingsResponse.pages);
            setEvents(eventsResponse.events);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load bookings or events");
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchQuery, statusFilter, eventFilter, organizer]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelBooking = async (bookingId: string) => {
        try {
            await cancelBookingService(bookingId);
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === bookingId ? { ...b, status: "cancelled" } : b
                )
            );
            toast.success("Booking cancelled successfully");
        } catch (error) {
            console.error("Failed to cancel booking:", error);
            toast.error("Failed to cancel booking");
        }
    };

    const handleViewAttendee = async (booking: BookingDTO) => {
        try {
            const userDetails = await getUserDetails(booking.userId);
            setSelectedBooking(booking);
            setAttendeeDetails(userDetails);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch attendee details:", error);
            toast.error("Failed to load attendee details");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
        setAttendeeDetails(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-6 mx-0">
            <NavBar />
            <div className="flex flex-row w-full gap-3">
                <OrganizerSideBar name="bookings" />
                <div className="max-w-7xl w-full space-y-6 p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Booking & Attendees Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage bookings and view attendee details
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by event, order ID, or attendee..."
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
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={eventFilter} onValueChange={setEventFilter}>
                                    <SelectTrigger>
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Filter by event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Events</SelectItem>
                                        {events.map((event) => (
                                            <SelectItem key={event.id} value={event.id}>
                                                {event.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            {bookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                        No bookings found
                                    </h3>
                                    <p className="text-gray-500">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Tickets</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map((booking) => {
                                            const event = eventMap[booking.eventId];
                                            if (!event) return null;

                                            return (
                                                <TableRow key={booking.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={event.image}
                                                                alt={event.name}
                                                                className="w-12 h-12 rounded object-cover"
                                                            />
                                                            <div>
                                                                <p className="font-medium">{event.name}</p>
                                                                <p className="text-sm text-gray-500 flex items-center">
                                                                    <MapPin className="w-4 h-4 mr-1" />
                                                                    {event.location}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{booking.orderId}</TableCell>
                                                    <TableCell>{booking.totalTickets}</TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center">
                                                            <IndianRupee className="w-4 h-4 mr-1" />
                                                            {booking.totalAmount.toFixed(2)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(booking.status)}>
                                                            {booking.status.charAt(0).toUpperCase() +
                                                                booking.status.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                {formatDate(event.date)}
                                                            </span>
                                                            <span className="flex items-center text-sm text-gray-500">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {formatTime(event.time)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewAttendee(booking)}
                                                            >
                                                                <UserIcon className="w-4 h-4 mr-2" />
                                                                View Attendee
                                                            </Button>
                                                            {booking.status.toLowerCase() === "confirmed" && (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleCancelBooking(booking.id)}
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-2" />
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {totalPages > 1 && (
                        <Card>
                            <CardContent className="pt-6 flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Dialog open={isModalOpen} onOpenChange={closeModal}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Attendee Details</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && attendeeDetails && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Event</h4>
                                        <p className="text-lg font-semibold">{eventMap[selectedBooking.eventId]?.name}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Attendee</h4>
                                        <p className="text-lg">{attendeeDetails.firstName} {attendeeDetails.lastName}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                        <p>{attendeeDetails.email}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Tickets</h4>
                                        <p>{selectedBooking.totalTickets} ticket(s)</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Order ID</h4>
                                        <p>{selectedBooking.orderId}</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <DialogClose asChild>
                                            <Button variant="outline">Close</Button>
                                        </DialogClose>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default BookingAttendeesPage;