import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, AlertCircle, Ticket, Clock, Users, CreditCard, Wallet, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { NavBar } from '@/components/partials/NavBar';
import axiosInstance from '@/utils/axiosInstance';
import type { EventDTO } from '@/interfaces/entities/EventDTO';
import { getEventById } from '@/services/eventService';
import type { RazorpayOptions, RazorpayResponse } from '@/interfaces/entities/RazorPay';
import config from '@/config';
import { useAppSelector, type RootState } from '@/store';
import { failedBookings, handleBookingService, handleRPayPayment, walletPayment } from '@/services/bookingService';

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
            on(event: "payment.failed", handler: () => void): void;
        };
    }
}

export interface TicketSelection {
    tierId: string;
    quantity: number;
}

type PaymentMethod = 'razorpay' | 'wallet';

const BookingPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDTO | null>(null);
    const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        const fetchEvent = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const response = await getEventById(id);
                setEvent(response);
                setTicketSelections(
                    response.ticketTiers.map((tier: EventDTO['ticketTiers'][0]) => ({
                        tierId: tier.id,
                        quantity: 0,
                    }))
                );

                if (token) {
                    try {
                        const walletResponse = await axiosInstance.get('/api/wallet/balance');
                        setWalletBalance(walletResponse.data.balance || 0);
                    } catch (err) {
                        console.error('Error fetching wallet balance:', err);
                    }
                }
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
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleQuantityChange = (tierId: string, value: string) => {
        const quantity = parseInt(value, 10) || 0;
        const tier = event?.ticketTiers.find((t) => t.id === tierId);
        if (!tier) return;

        const available = tier.quantity - (tier.sold || 0);
        if (quantity < 0 || quantity > available) {
            setBookingError(`Cannot select more than ₹{available} tickets for ₹{tier.name}.`);
            return;
        }

        setBookingError(null);
        setTicketSelections((prev) =>
            prev.map((selection) =>
                selection.tierId === tierId ? { ...selection, quantity } : selection
            )
        );
    };

    const incrementQuantity = (tierId: string) => {
        if (totalTickets < 10) {
            setTicketSelections((prev) =>
                prev.map((selection) => {
                    if (selection.tierId !== tierId) return selection;

                    const tier = event?.ticketTiers.find((t) => t.id === tierId);
                    if (!tier) return selection;

                    const available = tier.quantity - (tier.sold || 0);
                    const newQuantity = Math.min(selection.quantity + 1, available);

                    return { ...selection, quantity: newQuantity };
                })
            );
        }
        setBookingError(null);
    };

    const decrementQuantity = (tierId: string) => {
        setTicketSelections((prev) =>
            prev.map((selection) => {
                if (selection.tierId !== tierId) return selection;

                const newQuantity = Math.max(selection.quantity - 1, 0);

                return { ...selection, quantity: newQuantity };
            })
        );
        setBookingError(null);
    };

    const calculateTotal = () => {
        if (!event) return 0;
        return ticketSelections.reduce((total, selection) => {
            const tier = event.ticketTiers.find((t) => t.id === selection.tierId);
            return total + (tier ? tier.price * selection.quantity : 0);
        }, 0);
    };

    const getTotalTickets = () => {
        return ticketSelections.reduce((sum, s) => sum + s.quantity, 0);
    };

    const handleBooking = async () => {

        if (ticketSelections.every((s) => s.quantity === 0)) {
            setBookingError('Please select at least one ticket.');
            return;
        }

        if (paymentMethod === 'wallet' && walletBalance < total) {
            setBookingError(`Insufficient wallet balance. You need ₹{(total - walletBalance).toFixed(2)} more.`);
            return;
        }

        setIsProcessing(true);
        setBookingError(null);

        try {
            const bookingData = {
                eventId: id,
                tickets: ticketSelections.filter((s) => s.quantity > 0),
                paymentMethod: paymentMethod as unknown as PaymentMethodData,
            };

            const booking = await handleBookingService(bookingData);

            if (paymentMethod === 'razorpay') {
                const options: RazorpayOptions = {
                    key: config.RPAY_KEY,
                    amount: booking.totalAmount * 100,
                    currency: "INR",
                    name: event?.name as string,
                    description: "Ticket Booking",
                    order_id: booking.orderId,
                    handler: async (response: RazorpayResponse) => {
                        await handleRPayPayment(response, booking.id);
                        navigate(`/payment/${booking.orderId}`);
                    },
                    prefill: {
                        name: user?.firstName || "",
                        email: user?.email || "",
                    },
                    theme: {
                        color: "#0193ff",
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', async () => {
                    await failedBookings(booking.id);
                    window.location.href = `/payment/${booking.orderId}`;
                })
                rzp.open();
            } else if (paymentMethod === 'wallet') {
                const response = await walletPayment(booking.id);
                navigate(`/bookings/${response.data.bookingId}/success`);
            }
        } catch (err) {
            setBookingError('Failed to create booking. Please try again.');
            console.error('Error creating booking:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
                <NavBar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <Skeleton className="h-10 w-40 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6 md:p-8">
                                    <Skeleton className="h-10 w-3/4 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6 mb-6" />
                                    <div className="space-y-3">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-6 w-56" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <Card className="border-0 shadow-lg sticky top-24">
                                <CardContent className="p-6">
                                    <Skeleton className="h-8 w-32 mb-6" />
                                    <Skeleton className="h-32 w-full mb-4" />
                                    <Skeleton className="h-32 w-full mb-6" />
                                    <Skeleton className="h-12 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
                <NavBar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error || 'Event not found.'}</AlertDescription>
                    </Alert>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/events')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Button>
                </div>
            </div>
        );
    }

    const total = calculateTotal();
    const totalTickets = getTotalTickets();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <Button
                    variant="ghost"
                    className="mb-6 hover:bg-gray-100"
                    onClick={() => navigate(`/events/${id}`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Event
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <CardContent className="p-6 md:p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{event.name}</h1>
                                    <Badge variant="secondary" className="ml-4">
                                        <Ticket className="w-3 h-3 mr-1" />
                                        {event.ticketTiers.length} Tiers
                                    </Badge>
                                </div>

                                <p className="text-gray-600 leading-relaxed mb-8 text-lg">{event.description}</p>

                                <Separator className="my-6" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Calendar className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Event Date</p>
                                            <p className="text-gray-900 font-semibold">{formatDate(event.date)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Clock className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Start Time</p>
                                            <p className="text-gray-900 font-semibold">{formatTime(event.date)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl md:col-span-2">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <MapPin className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                                            <p className="text-gray-900 font-semibold">{event.location}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <Separator />

                            <CardHeader className="pb-4">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Ticket className="w-6 h-6 text-indigo-600" />
                                    Select Tickets
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {event.ticketTiers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No ticket tiers available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {event.ticketTiers.map((tier) => {
                                            const available = tier.quantity - (tier.sold || 0);
                                            const selectedQty = ticketSelections.find(s => s.tierId === tier.id)?.quantity || 0;

                                            return (
                                                <div
                                                    key={tier.id}
                                                    className={`group relative p-5 rounded-xl border-2 transition-all ${selectedQty > 0
                                                        ? 'border-indigo-500 bg-indigo-50/50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg">{tier.name}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {tier.description || 'Standard admission'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-indigo-600">
                                                                ₹{tier.price}
                                                            </div>
                                                            <p className="text-xs text-gray-500">per ticket</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {available} available
                                                            </span>
                                                        </div>
                                                        <Badge
                                                            variant={available > 0 ? "default" : "destructive"}
                                                            className={available > 0 ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                                                        >
                                                            {available > 0 ? 'Available' : 'Sold Out'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10"
                                                            onClick={() => decrementQuantity(tier.id)}
                                                            disabled={available === 0 || selectedQty === 0}
                                                        >
                                                            -
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={available}
                                                            value={selectedQty}
                                                            onChange={(e) => handleQuantityChange(tier.id, e.target.value)}
                                                            className="h-10 text-center font-semibold"
                                                            disabled={available === 0}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10"
                                                            onClick={() => incrementQuantity(tier.id)}
                                                            disabled={available === 0 || selectedQty >= available}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>

                        </Card>

                    </div>

                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-lg sticky top-24">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Ticket className="w-6 h-6 text-indigo-600" />
                                    Booking Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {bookingError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{bookingError}</AlertDescription>
                                    </Alert>
                                )}

                                {/* {event.ticketTiers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No ticket tiers available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {event.ticketTiers.map((tier) => {
                                            const available = tier.quantity - (tier.sold || 0);
                                            const selectedQty = ticketSelections.find(s => s.tierId === tier.id)?.quantity || 0;
                                            
                                            return (
                                                <div
                                                    key={tier.id}
                                                    className={`group relative p-5 rounded-xl border-2 transition-all ${
                                                        selectedQty > 0 
                                                            ? 'border-indigo-500 bg-indigo-50/50' 
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg">{tier.name}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {tier.description || 'Standard admission'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-indigo-600">
                                                                ${tier.price}
                                                            </div>
                                                            <p className="text-xs text-gray-500">per ticket</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {available} available
                                                            </span>
                                                        </div>
                                                        <Badge 
                                                            variant={available > 0 ? "default" : "destructive"}
                                                            className={available > 0 ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                                                        >
                                                            {available > 0 ? 'Available' : 'Sold Out'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10"
                                                            onClick={() => decrementQuantity(tier.id)}
                                                            disabled={available === 0 || selectedQty === 0}
                                                        >
                                                            -
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={available}
                                                            value={selectedQty}
                                                            onChange={(e) => handleQuantityChange(tier.id, e.target.value)}
                                                            className="h-10 text-center font-semibold"
                                                            disabled={available === 0}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10"
                                                            onClick={() => incrementQuantity(tier.id)}
                                                            disabled={available === 0 || selectedQty >= available}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )} */}

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Payment Method
                                    </h3>

                                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                                        <div className="space-y-3">
                                            <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'razorpay'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}>
                                                <RadioGroupItem value="razorpay" id="razorpay" />
                                                <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Razorpay</p>
                                                                <p className="text-xs text-gray-500">Credit/Debit Card, UPI, Net Banking</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </div>

                                            <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'wallet'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}>
                                                <RadioGroupItem value="wallet" id="wallet" />
                                                <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-100 rounded-lg">
                                                                <Wallet className="w-5 h-5 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Wallet</p>
                                                                <p className="text-xs text-gray-500">
                                                                    Balance: <span className="font-semibold text-green-600">₹{walletBalance.toFixed(2)}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {walletBalance < total && total > 0 && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Insufficient
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Tickets</span>
                                        <span className="font-semibold text-gray-900">{totalTickets}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                                        <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                        <span className="text-3xl font-bold text-indigo-600">
                                            ₹{total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                                    disabled={ticketSelections.every((s) => s.quantity === 0) || isProcessing}
                                    onClick={handleBooking}
                                >
                                    {isProcessing ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <IndianRupee className="w-5 h-5 mr-2" />
                                            Proceed to Payment
                                        </>
                                    )}
                                </Button>

                                {!isAuthenticated && (
                                    <p className="text-xs text-center text-gray-500">
                                        You'll be redirected to login before checkout
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;