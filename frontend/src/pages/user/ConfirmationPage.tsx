import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Download, Mail, ArrowLeft, Ticket, Calendar, CreditCard, XCircle, Clock, RefreshCw, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { BookingDTO, BookingTicketDTO, EventDetails } from '@/interfaces/entities/BookingDTO';
import { useNavigate, useParams } from 'react-router-dom';
import { checkConfirmation, downloadTicketService, failedBookings, handleRPayPayment, walletPayment } from '@/services/bookingService';
import { getEventById } from '@/services/eventService';
import type { TicketTier } from '@/interfaces/formdata/ticketTier';
import { NavBar } from '@/components/partials/NavBar';
import config from '@/config';
import type { RazorpayOptions, RazorpayResponse } from '@/interfaces/entities/RazorPay';
import { useAppSelector, type RootState } from '@/store';



type LoadingState = 'loading' | 'success' | 'error';

const PaymentConfirmation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [loadingState, setLoadingState] = useState<LoadingState>('loading');
    const [bookingData, setBookingData] = useState<BookingDTO | null>(null);
    const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
    const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);
    const [emailSending, setEmailSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
    }, []);

    const fetchBookingDetails = async () => {
        try {
            setLoadingState('loading');
            const data = await checkConfirmation(id as string);
            const eventData = await getEventById(data.booking.eventId);

            setBookingData(data.booking);
            setEventDetails(eventData);
            setTicketTiers(eventData.ticketTiers);
            setLoadingState('success');
        } catch (error) {
            console.log(error)
            setLoadingState('error');
        }
    };

    const handleRetryPayment = async () => {
        if (!bookingData) return;

        setRetrying(true);
        try {
            if (bookingData.paymentMethod === 'razorpay') {
                const options: RazorpayOptions = {
                    key: config.RPAY_KEY,
                    amount: bookingData.totalAmount * 100,
                    currency: "INR",
                    name: eventDetails?.name as string,
                    description: "Ticket Booking",
                    order_id: bookingData.orderId,
                    handler: async (response: RazorpayResponse) => {
                        await handleRPayPayment(response, bookingData.id);
                        navigate(`/payment/${bookingData.orderId}`);
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
                    await failedBookings(bookingData.id);
                    window.location.href = `/payment/${bookingData.orderId}`;
                })
                rzp.open();
            } else if (bookingData.paymentMethod === 'wallet') {
                const response = await walletPayment(bookingData.id);
                navigate(`/bookings/${response.data.bookingId}/success`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRetrying(false);
        }
    };

    const handleEmailReceipt = async () => {
        if (!bookingData) return;

        setEmailSending(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
            setEmailSent(true);
        } catch (error) {
            console.error(error);
        } finally {
            setEmailSending(false);
        }
    };

    const handleDownloadReceipt = () => {
        if (!bookingData) return;
        downloadTicketService(bookingData.id);
    };

    const handleContactSupport = () => {
        console.log('Opening support chat...');
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getTotalTickets = (tickets: BookingTicketDTO[]) => {
        return tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    };

    const getStatusConfig = (status: BookingDTO['status']) => {
        switch (status) {
            case 'confirmed':
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: CheckCircle2,
                    iconColor: 'text-green-600',
                    bgColor: 'bg-green-100',
                    title: 'Payment Confirmed!',
                    message: 'Your booking has been successfully processed',
                    showActions: true
                };
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: Clock,
                    iconColor: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    title: 'Payment Pending',
                    message: 'Your payment is being processed. This may take a few moments.',
                    showActions: false
                };
            case 'failed':
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: XCircle,
                    iconColor: 'text-red-600',
                    bgColor: 'bg-red-100',
                    title: 'Payment Failed',
                    message: 'We were unable to process your payment. Please try again.',
                    showActions: false
                };
            case 'cancelled':
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: XCircle,
                    iconColor: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    title: 'Booking Cancelled',
                    message: 'This booking has been cancelled.',
                    showActions: false
                };
            case 'expired':
                return {
                    color: 'bg-orange-100 text-orange-800 border-orange-200',
                    icon: AlertCircle,
                    iconColor: 'text-orange-600',
                    bgColor: 'bg-orange-100',
                    title: 'Booking Expired',
                    message: 'This booking reservation has expired. Please create a new booking.',
                    showActions: false
                };
            case 'refunded':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: RefreshCw,
                    iconColor: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    title: 'Payment Refunded',
                    message: 'Your payment has been refunded to your original payment method.',
                    showActions: false
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: HelpCircle,
                    iconColor: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    title: 'Unknown Status',
                    message: 'Please contact support for assistance.',
                    showActions: false
                };
        }
    };

    if (loadingState === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
                        <p className="text-lg font-medium text-gray-700">Loading booking details...</p>
                        <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loadingState === 'error' || !bookingData || !eventDetails) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="py-12">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                                <AlertCircle className="h-12 w-12 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
                            <p className="text-gray-600">Unable to load booking details</p>
                        </div>
                        <Alert className="border-red-200 bg-red-50 mb-6">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <AlertDescription className="text-red-800 ml-2">
                                We couldn't retrieve your booking information. This could be due to a network issue or an invalid booking reference.
                            </AlertDescription>
                        </Alert>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                            <Button className="flex-1" onClick={() => window.location.reload()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusConfig = getStatusConfig(bookingData.status.toLocaleLowerCase() as BookingDTO['status']);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-0 pb=8 px-4">
            <NavBar />
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 text-center mt-5">
                    <div className={`inline-flex items-center justify-center w-20 h-20 ${statusConfig.bgColor} rounded-full mb-4`}>
                        <StatusIcon className={`h-12 w-12 ${statusConfig.iconColor}`} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{statusConfig.title}</h1>
                    <p className="text-gray-600">{statusConfig.message}</p>
                </div>

                {bookingData.status === 'failed' && bookingData.failureReason && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <AlertTitle className="text-red-900 ml-2">Payment Failed</AlertTitle>
                        <AlertDescription className="text-red-800 ml-2">
                            Reason: {bookingData.failureReason}
                        </AlertDescription>
                    </Alert>
                )}

                {bookingData.status === 'pending' && (
                    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <AlertTitle className="text-yellow-900 ml-2">Payment Processing</AlertTitle>
                        <AlertDescription className="text-yellow-800 ml-2">
                            Your payment is being verified. This usually takes 2-5 minutes. You'll receive an email once the payment is confirmed.
                        </AlertDescription>
                    </Alert>
                )}

                {bookingData.status === 'expired' && (
                    <Alert className="mb-6 border-orange-200 bg-orange-50">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <AlertTitle className="text-orange-900 ml-2">Reservation Expired</AlertTitle>
                        <AlertDescription className="text-orange-800 ml-2">
                            Your ticket reservation has expired. Tickets are held for 15 minutes. Please create a new booking to secure your tickets.
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="mb-6 shadow-lg pt-0">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg py-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl mb-2">{eventDetails.name}</CardTitle>
                                <CardDescription className="text-blue-50 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(eventDetails.date)}
                                </CardDescription>
                                <CardDescription className="text-blue-50 mt-1">
                                    {eventDetails.venue}
                                </CardDescription>
                            </div>
                            <Badge className={statusConfig.color}>
                                {bookingData.status.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                                <p className="font-mono font-semibold text-gray-900">{bookingData.id}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                                <p className="font-mono font-semibold text-gray-900">{bookingData.orderId}</p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Ticket className="h-5 w-5" />
                                Ticket Details
                            </h3>
                            <div className="space-y-3">
                                {bookingData.tickets.map((ticket) => {
                                    const tierInfo = ticketTiers.find(t => t.id == ticket.tierId);
                                    return (
                                        <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {tierInfo?.name || ticket.tierId}
                                                </p>
                                                <p className="text-sm text-gray-600">{tierInfo?.description}</p>
                                                <p className="text-sm text-gray-500 mt-1">Quantity: {ticket.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{formatCurrency(ticket.price)}</p>
                                                <p className="text-sm text-gray-600">per ticket</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <Separator className="my-6" />


                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Summary
                            </h3>
                            <div className="flex justify-between text-gray-600">
                                <span>Total Tickets</span>
                                <span className="font-medium">{getTotalTickets(bookingData.tickets)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Payment Method</span>
                                <span className="font-medium capitalize">{bookingData.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Booking Date</span>
                                <span className="font-medium">{new Date(bookingData.createdAt).toLocaleDateString()}</span>
                            </div>
                            {bookingData.status === 'pending' && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Reserved Until</span>
                                    <span className="font-medium text-orange-600">
                                        {new Date(bookingData.lockedUntil).toLocaleTimeString()}
                                    </span>
                                </div>
                            )}
                            <Separator className="my-4" />
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total Amount</span>
                                <span className="text-blue-600">{formatCurrency(bookingData.totalAmount)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {bookingData.status.toLowerCase() === 'confirmed' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleDownloadReceipt}
                                className="w-full"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleEmailReceipt}
                                disabled={emailSending || emailSent}
                                className="w-full"
                            >
                                {emailSending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : emailSent ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Email Sent
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Email Receipt
                                    </>
                                )}
                            </Button>
                        </div>

                        <Alert className="border-blue-200 bg-blue-50 mb-6">
                            <AlertDescription className="text-blue-800">
                                Your tickets have been sent to your registered email address. Please check your inbox and spam folder.
                            </AlertDescription>
                        </Alert>
                    </>
                )}

                {bookingData.status.toLowerCase() === 'failed' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleContactSupport}
                            className="w-full"
                        >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Contact Support
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleRetryPayment}
                            disabled={retrying}
                            className="w-full"
                        >
                            {retrying ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry Payment
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {bookingData.status.toLowerCase() === 'pending' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={fetchBookingDetails}
                            className="w-full"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Check Status
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleContactSupport}
                            className="w-full"
                        >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Need Help?
                        </Button>
                    </div>
                )}

                {bookingData.status.toLowerCase() === 'expired' && (
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <Button
                            size="lg"
                            onClick={() => console.log('Navigate to event page')}
                            className="w-full"
                        >
                            <Ticket className="h-4 w-4 mr-2" />
                            Book Again
                        </Button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Button variant="ghost" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Events
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;