import { useState } from 'react'
import { Button } from '@/components/ui/button';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Calendar, Home, Menu, Search, Ticket, User2, UserLockIcon, Users, X } from 'lucide-react';
import { useAppDispatch, useAppSelector, type RootState } from '@/store';
import { logout } from '@/store/actions/auth/logout';
import { useNavigate } from 'react-router-dom';

export const NavBar = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const logOut = () => {
        dispatch(logout())
    }

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-lg bg-opacity-95 shadow-sm">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                EventHub
                            </span>
                        </div>

                        <div className="hidden lg:flex -mt-3">
                            <NavigationMenu>
                                <NavigationMenuList className="flex items-center space-x-1">
                                    <NavigationMenuItem>
                                        <NavigationMenuLink 
                                            onClick={() => navigate("/")}
                                            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
                                            <Home className="w-4 h-4 mr-2" />
                                            Home
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem className='mt-3.5'>
                                        <NavigationMenuTrigger className="h-10">Events</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                                                <li className="row-span-3">
                                                    <NavigationMenuLink asChild>
                                                        <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500 to-purple-600 p-6 no-underline outline-none focus:shadow-md" href="/events">
                                                            <Calendar className="h-6 w-6 text-white" />
                                                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                                                                Discover Events
                                                            </div>
                                                            <p className="text-sm leading-tight text-blue-100">
                                                                Browse thousands of events in your area
                                                            </p>
                                                        </a>
                                                    </NavigationMenuLink>
                                                </li>
                                                <li>
                                                    <NavigationMenuLink asChild>
                                                        <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900" href="/events">
                                                            <div className="text-sm font-medium leading-none">Concerts</div>
                                                            <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                                                                Live music and performances
                                                            </p>
                                                        </a>
                                                    </NavigationMenuLink>
                                                </li>
                                                <li>
                                                    <NavigationMenuLink asChild>
                                                        <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900" href="/events">
                                                            <div className="text-sm font-medium leading-none">Conferences</div>
                                                            <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                                                                Professional networking events
                                                            </p>
                                                        </a>
                                                    </NavigationMenuLink>
                                                </li>
                                                <li>
                                                    <NavigationMenuLink asChild>
                                                        <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900" href="/events">
                                                            <div className="text-sm font-medium leading-none">Sports</div>
                                                            <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                                                                Games and athletic events
                                                            </p>
                                                        </a>
                                                    </NavigationMenuLink>
                                                </li>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem>
                                        <NavigationMenuLink
                                            className="group inline-flex h-10 w-max cursor-pointer items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                                            onClick={() => navigate("/bookings")}
                                        >
                                            <Ticket className="w-4 h-4 mr-2" />
                                            My Bookings
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => navigate("/events")}>
                            <Search className="w-5 h-5 text-slate-600" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex flex-col items-start p-4 cursor-pointer">
                                    <div className="font-medium">Event Reminder</div>
                                    <div className="text-sm text-slate-500">Tech Conference 2025 is tomorrow</div>
                                    <div className="text-xs text-slate-400 mt-1">2 hours ago</div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start p-4 cursor-pointer">
                                    <div className="font-medium">Booking Confirmed</div>
                                    <div className="text-sm text-slate-500">Your ticket for Music Festival is ready</div>
                                    <div className="text-xs text-slate-400 mt-1">5 hours ago</div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start p-4 cursor-pointer">
                                    <div className="font-medium">New Event Alert</div>
                                    <div className="text-sm text-slate-500">Jazz Night added near you</div>
                                    <div className="text-xs text-slate-400 mt-1">1 day ago</div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="hidden md:flex items-center space-x-2 h-10">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                        <User2 />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate("/profile")}>
                                    <Users className="w-4 h-4 mr-2" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/bookings")}>
                                    <Ticket className="w-4 h-4 mr-2" />
                                    My Bookings
                                </DropdownMenuItem>
                                {user?.roles.includes("organizer") && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate("/organizer/events")}>
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Events
                                        </DropdownMenuItem>
                                    </>

                                )}

                                {user?.roles.includes("admin") && (
                                    <>
                                        <DropdownMenuItem onClick={() => navigate("/admin/applications")}>
                                            <UserLockIcon className="w-4 h-4 mr-2" />
                                            Admin Dashboard
                                        </DropdownMenuItem>
                                    </>

                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={logOut}
                                >
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </Button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-slate-200 z-50">
                        <div className="flex flex-col space-y-1">
                            <Button variant="ghost" className="w-full justify-start h-12" onClick={() => navigate("/")}>
                                <Home className="w-4 h-4 mr-3" />
                                Home
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-12" onClick={() => navigate("/events")}>
                                <Calendar className="w-4 h-4 mr-3" />
                                Discover Events
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-12" onClick={() => navigate("/bookings")}>
                                <Ticket className="w-4 h-4 mr-3" />
                                My Bookings
                            </Button>
                            <div className="border-t border-slate-200 my-2"></div>
                            <Button variant="ghost" className="w-full justify-start h-12" onClick={() => navigate("/profile")}>
                                <Users className="w-4 h-4 mr-3" />
                                Profile
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}