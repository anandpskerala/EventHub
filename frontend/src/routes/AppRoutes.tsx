import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useAppSelector, type RootState } from '../store';
import { AuthRedirect } from './AuthRedirect';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoutes } from './AdminRoutes';
import { OrganizerRoutes } from './OrganizerRoutes';

const AppRoutes = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);

    const HomePage = lazy(() => import("../pages/user/HomePage"));
    const LoginPage = lazy(() => import("../pages/user/LoginPage"));
    const SignupPage = lazy(() => import("../pages/user/SignupPage"));
    const ProfilePage = lazy(() => import("../pages/user/ProfilePage"));
    const OrganizerApplicationPage = lazy(() => import("../pages/user/OrganizerApplicationPage"));
    const EventDetailsPage = lazy(() => import("../pages/user/EventDetailsPage"));
    const BrowseEventsPage = lazy(() => import("../pages/user/BrowseEventsPage"));
    const BookingPage = lazy(() => import("../pages/user/BookingPage"));
    const ConfirmationPage = lazy(() => import("../pages/user/ConfirmationPage"));
    const EventBookingsPage = lazy(() => import("../pages/user/EventBookingsPage"));


    const OrganizerApplicationsAdmin = lazy(() => import("../pages/admin/OrganizerApplicationsAdmin"));

    const OrganizerEventListing = lazy(() => import("../pages/organizer/OrganizerEventListing"));
    const EventCreationPage = lazy(() => import("../pages/organizer/EventCreationPage"));
    const EventEditPage = lazy(() => import("../pages/organizer/EventEditPage"));
    const BookingAttendeesPage = lazy(() => import("../pages/organizer/BookingAttendeesPage"));
    return (
        <Suspense>
            <Routes>
                <Route element={<AuthRedirect user={user} />}>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/signup' element={<SignupPage />} />
                </Route>

                <Route element={<ProtectedRoute user={user} />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/profile' element={<ProfilePage />} />
                    <Route path='/apply-for-organizer' element={<OrganizerApplicationPage />} />
                    <Route path='/events/:id' element={<EventDetailsPage />} />
                    <Route path='/events' element={<BrowseEventsPage />} />
                    <Route path='/events/:id/booking' element={<BookingPage />} />
                    <Route path='/payment/:id' element={<ConfirmationPage />} />
                    <Route path='/bookings' element={<EventBookingsPage />} />
                </Route>

                <Route element={<OrganizerRoutes user={user} />}>
                    <Route path='/organizer/create-event' element={<EventCreationPage />} />
                    <Route path='/organizer/:id/edit' element={<EventEditPage />} />
                    <Route path='/organizer/events' element={<OrganizerEventListing />} />
                    <Route path='/organizer/bookings' element={<BookingAttendeesPage />} />
                </Route>

                <Route element={<AdminRoutes user={user} />}>
                    <Route path='/admin/applications' element={<OrganizerApplicationsAdmin />} />
                </Route>
                
            </Routes>
        </Suspense>
    )
}

export default AppRoutes;