import { NavBar } from "@/components/partials/NavBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventDTO } from "@/interfaces/entities/EventDTO";
import { fetchFeaturedEvents } from "@/services/eventService";
import { useAppSelector, type RootState } from "@/store";
import { Calendar, MapPin, Plus, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const HomePage = () => {
	const { user } = useAppSelector((state: RootState) => state.auth);
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState<EventDTO[]>([]);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	};

	const handleCreateEvent = () => {
		if (user?.roles.includes("organizer")) {
			navigate("/organizer/events");
		} else {
			navigate("/apply-for-organizer");
		}
	}

	useEffect(() => {
		const fetchPublicEvents = async () => {
			setLoading(true);
			setError(null);
			try {
				const events = await fetchFeaturedEvents();
				setEvents(events);
			} catch (err) {
				setError('Failed to load events. Please try again later.');
				console.error('Error fetching events:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchPublicEvents();
	}, []);

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
				<section className="text-center py-16">
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
						Create and Discover Amazing Events
					</h1>
					<p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
						Organize unforgettable events or find exciting experiences near you. Your next big moment starts here!
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Button
							size="lg"
							className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold h-12 px-6"
							onClick={handleCreateEvent}
						>
							<Plus className="w-5 h-5 mr-2" />
							Create an Event
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 h-12 px-6"
							onClick={() => navigate('/events')}
						>
							Browse Events
						</Button>
					</div>
				</section>

				<section className="py-12">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
						<Button
							variant="link"
							className="text-indigo-600 hover:text-indigo-700"
							onClick={() => navigate('/events')}
						>
							View All
						</Button>
					</div>
					{error && (
						<Alert variant="destructive" className="mb-6 rounded-xl border-red-200">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{loading ? (
							<>
								<EventSkeleton />
								<EventSkeleton />
								<EventSkeleton />
							</>
						) : events.length === 0 ? (
							<Card className="col-span-full border-0 shadow-sm">
								<CardContent className="text-center py-16">
									<h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
									<p className="text-gray-600 mb-6">Check back soon for exciting new events!</p>
								</CardContent>
							</Card>
						) : (
							events.map(event => (
								<Card
									key={event.id}
									className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
								>
									<CardContent className="p-6">
										<div className="relative mb-4">
											<img
												src={event.image || '/placeholder-event.jpg'}
												alt={event.name}
												className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
											/>
											<div className="absolute top-3 right-3">
												<span className="px-2 py-1 bg-green-100 text-xs text-green-700 border border-green-200 rounded">
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
	)
}

export default HomePage;