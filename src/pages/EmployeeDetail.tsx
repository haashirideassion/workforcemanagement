import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, EnvelopeSimple, Buildings, Briefcase, Star, Certificate, Upload, Plus, X, File as FileIcon, Image as ImageIcon, Trash, Info, Phone, CalendarBlank, MapPin, User, PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEmployee, useUpdateEmployeeAllocations } from '@/hooks/useEmployees';
import { useProjectHistory } from '@/hooks/useProjectTransitions';
import { useProjects } from '@/hooks/useProjects';
import { useCreateCertification, useDeleteCertification } from '@/hooks/useCertifications';
import { ProjectHistory } from '@/components/ProjectHistory';

function getUtilizationCategory(utilization: number) {
    if (utilization >= 80) return { label: 'Fully Utilized', variant: 'green' as const };
    if (utilization >= 50) return { label: 'Partially Utilized', variant: 'orange' as const };
    return { label: 'Available', variant: 'destructive' as const };
}

function getProficiencyColor(proficiency: string) {
    switch (proficiency) {
        case 'expert': return 'bg-purple-100 text-purple-700';
        case 'advanced': return 'bg-blue-100 text-blue-700';
        case 'intermediate': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

interface CertificationFormData {
    name: string;
    description: string;
    expiryDate: string;
    file: File | null;
}




interface PastCompany {
    name: string;
    role: string;
    duration: string;
}

interface ExtendedEmployeeInfo {
    dateOfJoining: string;
    pastExperience: string;
    phoneNumber: string;
    personalEmail: string;
    pastCompanies: PastCompany[];
    designation: string;
    currentRole: string;
    currentProject: string;
}

// Project History Tab Component
function ProjectHistoryTab({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
    const { data: projectHistory = [], isLoading } = useProjectHistory(employeeId);

    if (isLoading) {
        return <div className="p-8 text-center">Loading project history...</div>;
    }

    return <ProjectHistory transitions={projectHistory} employeeId={employeeId} employeeName={employeeName} />;
}

export function EmployeeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: employee, isLoading, error } = useEmployee(id || '');
    const { data: projects = [] } = useProjects();
    const updateAllocations = useUpdateEmployeeAllocations();

    // Modal state for adding certification
    const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
    const [certFormData, setCertFormData] = useState<CertificationFormData>({
        name: '',
        description: '',
        expiryDate: '',
        file: null,
    });
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: createCertification } = useCreateCertification();
    const { mutate: deleteCertification } = useDeleteCertification();

    // Extended employee info popup state
    const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);
    const defaultEmployeeInfo: ExtendedEmployeeInfo = {
        dateOfJoining: '',
        pastExperience: '',
        phoneNumber: '',
        personalEmail: '',
        pastCompanies: [],
        designation: '',
        currentRole: '',
        currentProject: '',
    };
    const [extendedInfo, setExtendedInfo] = useState<ExtendedEmployeeInfo>(defaultEmployeeInfo);

    // Local Utilization State for Editing
    interface LocalUtilization {
        id: string;
        project: { name: string; id?: string };
        project_id?: string;
        utilization_percent: number | string;
        start_date: string;
        end_date: string | null;
        status: string;
        role?: string;
        originalStatus?: string;
    }
    const [localUtilization, setLocalUtilization] = useState<LocalUtilization[]>([]);
    const [isManageUtilizationOpen, setIsManageUtilizationOpen] = useState(false);

    // Load extended info from employee DB record
    useEffect(() => {
        if (employee) {
            const metadata = (employee as any).metadata || {};
            setExtendedInfo({
                ...defaultEmployeeInfo,
                dateOfJoining: (employee as any).date_of_joining || '',
                phoneNumber: (employee as any).phone_number || '',
                personalEmail: (employee as any).personal_email || '',
                designation: (employee as any).designation || '',
                currentRole: employee.role || '',
                pastExperience: metadata.pastExperience || '',
                pastCompanies: metadata.pastCompanies || [],
                currentProject: metadata.currentProject || '',
            });
        }
    }, [employee]);

    // Initialize localUtilization from employee data
    useEffect(() => {
        if (employee) {
            const active = employee.utilization_data || [];

            if (active.length > 0) {
                setLocalUtilization(active.map(a => ({
                    ...a,
                    status: a.status || 'Active',
                    originalStatus: a.status || 'Active',
                    utilization_percent: a.utilization_percent
                })) as any);
            } else {
                setLocalUtilization([]);
            }
        }
    }, [employee]);

    const handleCertFormChange = (field: keyof CertificationFormData, value: string | File | null) => {
        setCertFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (file: File | null) => {
        if (file) {
            const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
            if (allowedTypes.includes(file.type)) {
                setCertFormData(prev => ({ ...prev, file }));
            } else {
                alert('Please upload a PDF, PNG, or JPG file.');
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    // Note: File storage is not fully implemented in Supabase Storage yet.
    // For now we will just store metadata or skip file upload if no bucket.
    // Assuming we just store the certification details.

    const handleAddCertification = async () => {
        if (!id) return;

        // Skip file base64 for now as it's too large for simple DB text fields usually
        // and we haven't set up Storage.
        
        const newCert = {
            employee_id: id,
            name: certFormData.name.trim(),
            issuer: 'Self-Reported', // or add field to form
            valid_until: certFormData.expiryDate || null,
        };

        createCertification(newCert, {
            onSuccess: () => {
                setCertFormData({ name: '', description: '', expiryDate: '', file: null });
                setIsAddCertModalOpen(false);
            }
        });
    };

    const handleDeleteCertification = (certId: string) => {
        if(confirm('Are you sure you want to delete this certification?')) {
            deleteCertification(certId);
        }
    };



    const isFormValid = certFormData.name.trim() !== '' && certFormData.expiryDate !== '';

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Employee not found</p>
                <Button variant="link" onClick={() => navigate('/employees')}>
                    Back to Employees
                </Button>
            </div>
        );
    }



    const utilization = Math.min(
        100,
        localUtilization.reduce((sum, a) => sum + (Number(a.utilization_percent) || 0), 0)
    );

    const today = new Date().toISOString().split('T')[0];
    const utilizationToDisplay = utilization;

    const category = getUtilizationCategory(utilizationToDisplay);

    // Prepare utilization for table (using localUtilization)
    const utilizationForTable = localUtilization;

    // Handlers for Utilization Editing
    const handleAddUtilizationRow = () => {
        const newId = `new-${Date.now()}`;
        setLocalUtilization([
            ...localUtilization,
            {
                id: newId,
                project: { name: 'New Project' },
                utilization_percent: 0,
                start_date: new Date().toISOString().split('T')[0],
                end_date: null,
                status: 'Active',
                originalStatus: 'Active'
            }
        ]);
    };

    const handleUpdateUtilization = (id: string, field: keyof LocalUtilization | 'projectId' | 'projectName', value: any) => {
        setLocalUtilization(prev => prev.map(a => {
            if (a.id !== id) return a;
            if (field === 'projectId') {
                const selectedProject = projects.find(p => p.id === value);
                return { 
                    ...a, 
                    project: selectedProject ? { name: selectedProject.name, id: selectedProject.id } : { name: 'Unknown' },
                    project_id: value // Maintain project_id if needed
                };
            }
            if (field === 'projectName') {
                // Legacy fallback or if we just want to set name
                return { ...a, project: { ...a.project, name: value } };
            }
            if (field === 'utilization_percent') {
                // Ensure value is handled as a number and strip leading zeros
                const valStr = value.toString().replace(/^0+(?=\d)/, '');
                const numVal = valStr === "" ? 0 : parseInt(valStr, 10);
                const finalValue = isNaN(numVal) ? 0 : Math.min(100, Math.max(0, numVal));
                return { ...a, utilization_percent: finalValue };
            }
            if (field === 'status') {
                // If status is not "Active", set utilization to 0
                if (value !== 'Active') {
                    return { ...a, [field]: value, utilization_percent: 0 };
                }
                return { ...a, [field]: value };
            }
            return { ...a, [field]: value };
        }));
    };

    const handleRemoveUtilization = (id: string) => {
        setLocalUtilization(prev => prev.filter(a => a.id !== id));
    };

    const handleSaveUtilization = async () => {
        if (!id) return;
        
        // Include allocations that have a project selected (even with 0%)
        const validAllocations = localUtilization
            .filter(a => a.project_id || (a as any).projectId)
            .map(a => {
                // Include all fields from the allocation
                return {
                    ...a,
                    status: a.status || 'Active'
                };
            });
        
        // Basic validation: Total utilization shouldn't exceed 100%
        const total = validAllocations.reduce((sum, a) => sum + (Number(a.utilization_percent) || 0), 0);
        if (total > 100) {
            toast.error("Total utilization cannot exceed 100%");
            return;
        }

        if (validAllocations.length === 0 && localUtilization.length > 0) {
            toast.error("Please select a project for the utilization record");
            return;
        }

        updateAllocations.mutate(
            { employeeId: id, allocations: validAllocations },
            {
                onSuccess: () => {
                    toast.success("Utilization updated successfully");
                    // Refetch employee data to show updated status
                    queryClient.invalidateQueries({ queryKey: ['employee', id] });
                    setIsManageUtilizationOpen(false);
                },
                onError: (error: any) => {
                    toast.error(`Failed to update utilization: ${error.message}`);
                }
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{employee.name}</h1>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-brand-600 border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-brand-800 dark:hover:bg-brand-900/50"
                            onClick={() => setIsInfoPopupOpen(true)}
                        >
                            <Info size={16} weight="fill" />
                            More Info
                        </Button>
                        <Badge variant="outline" className="text-muted-foreground bg-muted/20">
                            {employee.employee_code || 'No ID'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <EnvelopeSimple size={14} />
                            {employee.email}
                        </span>
                        <span className="flex items-center gap-2">
                            <Briefcase size={14} className="shrink-0" />
                            <div className="flex flex-wrap gap-1">
                                {(() => {
                                    const activeProjects = employee.utilization_data?.filter(u =>
                                        (!u.end_date || u.end_date >= new Date().toISOString().split('T')[0]) &&
                                        u.start_date <= new Date().toISOString().split('T')[0]
                                    ) || [];

                                    if (activeProjects.length > 0) {
                                        return activeProjects.map(u => (
                                            <Badge
                                                key={u.id}
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors font-normal text-xs px-2 py-0.5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (u.project?.id) navigate(`/projects/${u.project.id}`);
                                                }}
                                            >
                                                {u.project?.name}
                                            </Badge>
                                        ));
                                    }
                                    return <span className="text-sm text-muted-foreground">Bench</span>;
                                })()}
                            </div>
                        </span>
                    </div>
                </div>
                <Badge variant={category.variant}>{category.label}</Badge>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{employee.employment_type}</Badge>
                </div>
            </div>

            {/* Utilization Overview */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">Current Utilization</span>
                        <span className="text-2xl font-bold">{utilizationToDisplay}%</span>
                    </div>
                    <SegmentedProgress
                        value={utilizationToDisplay}
                        size="md"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                        {localUtilization.length} active utilization(s)
                    </p>
                </CardContent>
            </Card>

            {/* Tabs - 4 Priority Sections */}
            <Tabs defaultValue="utilization">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="utilization">
                        <Briefcase size={16} className="mr-2" />
                        Utilization
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <Briefcase size={16} className="mr-2" />
                        History
                    </TabsTrigger>
                    <TabsTrigger value="skills">
                        <Star size={16} className="mr-2" />
                        Skills
                    </TabsTrigger>
                    <TabsTrigger value="certifications">
                        <Certificate size={16} className="mr-2" />
                        Certifications
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Projects & Utilization */}
                <TabsContent value="utilization" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Project Utilization</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2"
                                onClick={() => setIsManageUtilizationOpen(true)}
                                disabled={employee.status !== 'active'}
                            >
                                <PencilSimple size={14} />
                                Edit
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {utilizationForTable.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Specialization</TableHead>
                                            <TableHead>Utilization</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {utilizationForTable.map((alloc) => {
                                            const isActive = alloc.start_date <= today &&
                                                (!alloc.end_date || alloc.end_date >= today);
                                            return (
                                                <TableRow key={alloc.id}>
                                                    <TableCell className="font-medium">
                                                        {alloc.project ? (
                                                            <span
                                                                className="cursor-pointer hover:underline text-brand-600 dark:text-brand-400"
                                                                onClick={() => {
                                                                    // Since alloc.project in localUtilization might lack ID in some mock cases, check it
                                                                    // But for now assume consistency or fallback
                                                                    // Actually localUtilization comes from employee.utilization_data which has full project info usually
                                                                    // But dummy data 'mock1' has project object.
                                                                    // Check if project has ID, otherwise just show name
                                                                    if ((alloc as any).project_id || (alloc.project as any).id) {
                                                                        navigate(`/projects/${(alloc as any).project_id || (alloc.project as any).id}`);
                                                                    }
                                                                }}
                                                            >
                                                                {alloc.project.name}
                                                            </span>
                                                        ) : 'Unknown'}
                                                    </TableCell>
                                                    <TableCell className="text-sm">{alloc.role || '-'}</TableCell>
                                                    <TableCell className="text-sm">{employee.specialization || '-'}</TableCell>
                                                    <TableCell>{alloc.utilization_percent}%</TableCell>
                                                    <TableCell>{alloc.start_date}</TableCell>
                                                    <TableCell>{alloc.end_date}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={alloc.status === 'Active' || alloc.status === 'Planned' ? 'default' : 'secondary'}>
                                                            {alloc.status || (isActive ? 'Active' : 'Ended')}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    No utilization records found
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Project History */}
                <TabsContent value="history" className="mt-4">
                    <ProjectHistoryTab employeeId={id || ''} employeeName={employee.name} />
                </TabsContent>

                {/* Tab 2: Skills - Primary & Secondary */}
                <TabsContent value="skills" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Primary Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star size={20} className="text-brand-600" weight="fill" />
                                    Primary Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {employee.skills && employee.skills.filter(s => s.is_primary).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {employee.skills.filter(s => s.is_primary).map((es) => (
                                            <Badge
                                                key={es.skill_id}
                                                className={`${getProficiencyColor(es.proficiency)} ring-2 ring-brand-500`}
                                            >
                                                {es.skill?.name} • {es.proficiency}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        No primary skills assigned
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Secondary Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star size={20} className="text-muted-foreground" />
                                    Secondary Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {employee.skills && employee.skills.filter(s => !s.is_primary).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {employee.skills.filter(s => !s.is_primary).map((es) => (
                                            <Badge
                                                key={es.skill_id}
                                                className={getProficiencyColor(es.proficiency)}
                                            >
                                                {es.skill?.name} • {es.proficiency}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        No secondary skills assigned
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>



                {/* Tab 4: Certifications - with icons */}
                <TabsContent value="certifications" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Certificate size={20} className="text-brand-600" weight="fill" />
                                    Certifications
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setIsAddCertModalOpen(true)}
                                >
                                    <Plus size={16} weight="bold" />
                                    Add Certification
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Combined certifications from API */}
                            {employee.certifications && employee.certifications.length > 0 ? (
                                <div className="space-y-3">
                                    {/* API Certifications */}
                                    {employee.certifications?.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="flex items-center gap-4 rounded-lg border p-4 group"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
                                                <Certificate size={24} className="text-brand-600" weight="duotone" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{cert.name}</p>
                                                <p className="text-sm text-muted-foreground">{cert.issuer || 'Self-Reported'}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {cert.valid_until && (
                                                    <Badge variant="outline" className="shrink-0">
                                                        Valid until {cert.valid_until}
                                                    </Badge>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteCertification(cert.id)}
                                                    title="Delete certification"
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900 mb-4">
                                        <Certificate size={32} className="text-brand-600" weight="duotone" />
                                    </div>
                                    <h3 className="font-medium mb-1">No certifications yet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Add certifications to showcase professional credentials
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => setIsAddCertModalOpen(true)}
                                    >
                                        <Plus size={16} weight="bold" />
                                        Add Certification
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Add Certification Modal */}
                <Dialog open={isAddCertModalOpen} onOpenChange={setIsAddCertModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Certificate size={20} className="text-brand-600" weight="fill" />
                                Add Certification
                            </DialogTitle>
                            <DialogDescription>
                                Add a new certification with details and supporting document.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Certification Name */}
                            <div className="space-y-2">
                                <Label htmlFor="cert-name">Certification Name *</Label>
                                <Input
                                    id="cert-name"
                                    placeholder="e.g., AWS Certified Solutions Architect"
                                    value={certFormData.name}
                                    onChange={(e) => handleCertFormChange('name', e.target.value)}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="cert-description">Description</Label>
                                <Textarea
                                    id="cert-description"
                                    placeholder="Brief description of the certification..."
                                    rows={2}
                                    value={certFormData.description}
                                    onChange={(e) => handleCertFormChange('description', e.target.value)}
                                />
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-2">
                                <Label htmlFor="cert-expiry">Expiry Date</Label>
                                <Input
                                    id="cert-expiry"
                                    type="date"
                                    value={certFormData.expiryDate}
                                    onChange={(e) => handleCertFormChange('expiryDate', e.target.value)}
                                />
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label>Certificate Document</Label>
                                <div
                                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                                        }`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                                    />

                                    {certFormData.file ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
                                                {certFormData.file.type === 'application/pdf' ? (
                                                    <FileIcon size={20} className="text-brand-600" weight="duotone" />
                                                ) : (
                                                    <ImageIcon size={20} className="text-brand-600" weight="duotone" />
                                                )}
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-medium text-sm truncate max-w-[200px]">
                                                    {certFormData.file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(certFormData.file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setCertFormData(prev => ({ ...prev, file: null }))}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-sm font-medium">
                                                Drop your file here or click to browse
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Supports PDF, PNG, JPEG (max 10MB)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCertFormData({ name: '', description: '', expiryDate: '', file: null });
                                    setIsAddCertModalOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddCertification}
                                disabled={!isFormValid}
                                className="gap-2"
                            >
                                <Plus size={16} weight="bold" />
                                Add Certification
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Manage Utilization Dialog */}
                <Dialog open={isManageUtilizationOpen} onOpenChange={setIsManageUtilizationOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Manage Project Utilization</DialogTitle>
                            <DialogDescription>
                                Add, remove, or modify project utilization for {employee.name}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project</TableHead>
                                            <TableHead className="w-[120px]">Status</TableHead>
                                            <TableHead className="w-[100px]">Utilization %</TableHead>
                                            <TableHead className="w-[40px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {localUtilization.length > 0 ? (
                                            localUtilization.map((alloc) => {
                                                const isNotActive = alloc.status !== 'Active';
                                                const isEmployeeInactive = employee.status !== 'active';

                                                return (
                                                    <TableRow key={alloc.id}>
                                                        <TableCell>
                                                            <Select
                                                                value={(alloc as any).project?.id || ''}
                                                                onValueChange={(val) => handleUpdateUtilization(alloc.id, 'projectId', val)}
                                                                disabled={isEmployeeInactive}
                                                            >
                                                                <SelectTrigger className="h-9 w-full" disabled={isEmployeeInactive}>
                                                                <SelectValue placeholder="Select Project" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {projects.map(project => (
                                                                    <SelectItem key={project.id} value={project.id}>
                                                                        {project.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={alloc.status}
                                                            onValueChange={(val) => handleUpdateUtilization(alloc.id, 'status', val)}
                                                            disabled={isEmployeeInactive}
                                                        >
                                                            <SelectTrigger className="h-9" disabled={isEmployeeInactive}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Active">Active</SelectItem>
                                                                <SelectItem value="Planned">Planned</SelectItem>
                                                                <SelectItem value="On Hold">On Hold</SelectItem>
                                                                <SelectItem value="Ended">Ended</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="relative">
                                                            <Input
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={alloc.utilization_percent}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                                                                    if (val === '') {
                                                                        handleUpdateUtilization(alloc.id, 'utilization_percent', 0);
                                                                        return;
                                                                    }
                                                                    const numVal = parseInt(val, 10);
                                                                    const finalValue = Math.min(100, numVal);
                                                                    handleUpdateUtilization(alloc.id, 'utilization_percent', finalValue);
                                                                }}
                                                                disabled={isEmployeeInactive || isNotActive}
                                                                className="pr-6"
                                                            />
                                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleRemoveUtilization(alloc.id)}
                                                            disabled={isEmployeeInactive}
                                                        >
                                                            <Trash size={16} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                                    No utilization. Click "Add Project" to start.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <Button 
                                variant="outline" 
                                onClick={handleAddUtilizationRow} 
                                className="w-full border-dashed"
                                disabled={employee.status !== 'active'}
                            >
                                <Plus size={16} className="mr-2" />
                                Add Project
                            </Button>

                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
                                <span className="text-sm font-medium">Total Utilization</span>
                                <span className={`text-lg font-bold ${utilization > 100 ? 'text-red-500' : 'text-foreground'}`}>
                                    {utilization}%
                                </span>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsManageUtilizationOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveUtilization} disabled={updateAllocations.isPending}>
                                {updateAllocations.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Employee Info Popup (Existing) */}
                <Dialog open={isInfoPopupOpen} onOpenChange={setIsInfoPopupOpen}>
                    <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <User size={20} className="text-brand-600" weight="fill" />
                                Employee Profile
                            </DialogTitle>
                            <DialogDescription>
                                Identity background information for {employee.name}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Work Info Section */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Current Position
                                </h4>
                                <div className="grid gap-3">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <Briefcase size={18} className="text-brand-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Designation / Role</p>
                                            <p className="font-medium">
                                                {extendedInfo.designation || employee.role || extendedInfo.currentRole || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <MapPin size={18} className="text-brand-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Current Project</p>
                                            <p className="font-medium">
                                                {extendedInfo.currentProject ||
                                                    localUtilization[0]?.project?.name ||
                                                    'No active project'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <Buildings size={18} className="text-brand-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Entity</p>
                                            <p className="font-medium">{employee.entity?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Contact Information
                                </h4>
                                <div className="grid gap-3">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <Phone size={18} className="text-brand-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone Number</p>
                                            <p className="font-medium">
                                                {extendedInfo.phoneNumber || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <EnvelopeSimple size={18} className="text-brand-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Work Email</p>
                                            <p className="font-medium">{employee.email || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <EnvelopeSimple size={18} className="text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Personal Email</p>
                                            <p className="font-medium">
                                                {extendedInfo.personalEmail || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Section */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Background
                                </h4>
                                <div className="grid gap-3">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <CalendarBlank size={18} className="text-brand-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Date of Joining</p>
                                            <p className="font-medium">
                                                {extendedInfo.dateOfJoining
                                                    ? new Date(extendedInfo.dateOfJoining).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <Star size={18} className="text-brand-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Past Experience</p>
                                            <p className="font-medium">
                                                {extendedInfo.pastExperience || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Past Companies Section */}
                            {extendedInfo.pastCompanies && extendedInfo.pastCompanies.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        Past Companies
                                    </h4>
                                    <div className="space-y-2">
                                        {extendedInfo.pastCompanies.map((company, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 rounded-lg border bg-background"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
                                                    <Buildings size={18} className="text-brand-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{company.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {company.role} • {company.duration}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInfoPopupOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Tabs>
        </div >
    );
}
