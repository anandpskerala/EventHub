import { useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
}

export function AdminSideBar({name}: {name: string}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', active: name == "dashboard" },
        { icon: FileText, label: 'Applications', href: '/admin/applications', active: name == "applications" },
    ];

    const handleNavigation = (href: string) => {
        console.log('Navigate to:', href);
        setIsMobileOpen(false);
    };

    const SidebarContent = () => (
        <>
            <div className={`flex items-center justify-between p-4 border-b ${isCollapsed ? 'justify-center' : ''}`}>
                {!isCollapsed && <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.href}
                        onClick={() => handleNavigation(item.href)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.active
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={() => console.log('Logout')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''
                        }`}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-18 left-4 z-40"
            >
                <Menu className="w-5 h-5" />
            </Button>

            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent />
            </aside>

            <aside
                className={`hidden lg:flex flex-col h-screen bg-white border-r shadow-sm transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <SidebarContent />
            </aside>
        </>
    );
}