import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { changeApplicationStatusService, getAllApplicationsService } from '@/services/applicationService';
import { NavBar } from '@/components/partials/NavBar';
import { AdminSideBar } from '@/components/partials/AdminSideBar';
import type { ApplicationStatus, IOrganizerApplication } from '@/interfaces/entities/IOrganizerApplication';

interface ApplicationsResponse {
    message: string;
    statusCode: number;
    applications: IOrganizerApplication[];
    page: number;
    pages: number;
    total: number;
}

const OrganizerApplicationsAdmin = () => {
    const [applications, setApplications] = useState<IOrganizerApplication[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedApplication, setSelectedApplication] = useState<IOrganizerApplication | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchApplications();
    }, [currentPage, debouncedSearch, statusFilter]);

    const fetchApplications = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data: ApplicationsResponse = await getAllApplicationsService(debouncedSearch, currentPage, limit, statusFilter);

            setApplications(data.applications);
            setTotalPages(data.pages);
            setTotalItems(data.total);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: ApplicationStatus) => {
        const variants = {
            ["pending"]: { variant: 'secondary', icon: Clock, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
            ["approved"]: { variant: 'default', icon: CheckCircle, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
            ["rejected"]: { variant: 'destructive', icon: XCircle, className: 'bg-red-100 text-red-800 hover:bg-red-100' },
        };

        const { icon: Icon, className } = variants[status];
        return (
            <Badge className={`flex items-center gap-1 w-fit ${className}`}>
                <Icon className="w-3 h-3" />
                {status}
            </Badge>
        );
    };

    const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
        try {
            await changeApplicationStatusService(applicationId, newStatus);

            setApplications(apps =>
                apps.map(app =>
                    app.id === applicationId
                        ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
                        : app
                )
            );

            if (selectedApplication?.id === applicationId) {
                setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
            }

        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const viewDetails = (application: IOrganizerApplication) => {
        setSelectedApplication(application);
        setIsDetailOpen(true);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const stats = {
        total: totalItems,
        pending: applications.filter(a => a.status === "pending").length,
        approved: applications.filter(a => a.status === "approved").length,
        rejected: applications.filter(a => a.status === "rejected").length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="flex flex-row gap-5 w-full">
                <AdminSideBar name='applications' />
                <div className="w-full space-y-6 mt-10 px-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Organizer Applications</h1>
                            <p className="text-gray-600 mt-1">Manage and review organizer requests</p>
                        </div>
                        <Button onClick={fetchApplications} variant="outline" disabled={isLoading}>
                            {isLoading ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by name, email, or organization..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value) => {
                                    setStatusFilter(value);
                                    setCurrentPage(1);
                                }}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="py-0">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                    Loading applications...
                                                </td>
                                            </tr>
                                        ) : applications.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                    No applications found
                                                </td>
                                            </tr>
                                        ) : (
                                            applications.map((application) => (
                                                <tr key={application.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{application.fullName}</p>
                                                            <p className="text-sm text-gray-500">{application.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {application.organization || <span className="text-gray-400">N/A</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{application.organizationType}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-xs truncate">{application.experience}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(application.status)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(application.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => viewDetails(application)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {!isLoading && applications.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * limit, totalItems)}
                                        </span>{' '}
                                        of <span className="font-medium">{totalItems}</span> results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className="w-10"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Application Details</DialogTitle>
                        <DialogDescription>
                            Review the complete application information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApplication && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Current Status</p>
                                    {getStatusBadge(selectedApplication.status)}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => handleStatusChange(selectedApplication.id, "approved")}
                                        disabled={selectedApplication.status === "approved"}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleStatusChange(selectedApplication.id, "rejected")}
                                        disabled={selectedApplication.status === "rejected"}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Full Name</p>
                                        <p className="font-medium">{selectedApplication.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{selectedApplication.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{selectedApplication.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">City, State</p>
                                        <p className="font-medium">{selectedApplication.city}, {selectedApplication.state}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Address</p>
                                        <p className="font-medium">{selectedApplication.address}, {selectedApplication.zipCode}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3">Organization Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Organization Name</p>
                                        <p className="font-medium">{selectedApplication.organization || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Organization Type</p>
                                        <p className="font-medium">{selectedApplication.organizationType}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3">Experience & Motivation</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Experience</p>
                                        <p className="font-medium">{selectedApplication.experience}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Previous Events</p>
                                        <p className="font-medium">{selectedApplication.previousEvents || 'None listed'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Motivation</p>
                                        <p className="font-medium">{selectedApplication.motivation}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3">Identity Verification</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Proof Type</p>
                                        <p className="font-medium">{selectedApplication.identityProofType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Document Number</p>
                                        <p className="font-medium">{selectedApplication.identityProofNumber}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => window.open(selectedApplication.identityProofPath, '_blank')}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Identity Proof Document
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-gray-600">Submitted On</p>
                                    <p className="text-sm font-medium">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="text-sm font-medium">{new Date(selectedApplication.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default OrganizerApplicationsAdmin;