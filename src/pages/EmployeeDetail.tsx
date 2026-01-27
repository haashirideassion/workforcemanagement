import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, EnvelopeSimple, Buildings, Briefcase, Star, Certificate, Upload, Plus, X, File as FileIcon, Image as ImageIcon, Trash, Eye, Info, Phone, CalendarBlank, MapPin, User, PencilSimple } from '@phosphor-icons/react';
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
import { useEmployee } from '@/hooks/useEmployees';
import { useEntities } from '@/hooks/useEntities';

function getUtilizationCategory(utilization: number) {
    if (utilization >= 80) return { label: 'Fully Utilized', variant: 'green' as const };
    if (utilization >= 50) return { label: 'Partially Utilized', variant: 'yellow' as const };
    return { label: 'Available', variant: 'blue' as const };
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
    file: File | null;
}

interface StoredCertification {
    id: string;
    name: string;
    description: string;
    fileName: string | null;
    fileType: string | null;
    fileData: string | null;
    addedAt: string;
}

const CERT_STORAGE_KEY = 'employee_certifications';
const EMPLOYEE_INFO_KEY = 'employee_extended_info';

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

export function EmployeeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: employee, isLoading, error } = useEmployee(id || '');
    const { data: entities = [] } = useEntities();

    // Modal state for adding certification
    const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
    const [certFormData, setCertFormData] = useState<CertificationFormData>({
        name: '',
        description: '',
        file: null,
    });
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local certifications stored in localStorage
    const [localCertifications, setLocalCertifications] = useState<StoredCertification[]>([]);

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
        project: { name: string };
        utilization_percent: number | string;
        start_date: string;
        end_date: string | null;
        status: string;
    }
    const [localUtilization, setLocalUtilization] = useState<LocalUtilization[]>([]);
    const [isManageUtilizationOpen, setIsManageUtilizationOpen] = useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        if (id) {
            // Load certifications
            const storedCerts = localStorage.getItem(`${CERT_STORAGE_KEY}_${id}`);
            if (storedCerts) {
                try {
                    setLocalCertifications(JSON.parse(storedCerts));
                } catch (e) {
                    console.error('Failed to parse stored certifications:', e);
                }
            }

            // Load extended employee info
            const storedInfo = localStorage.getItem(`${EMPLOYEE_INFO_KEY}_${id}`);
            if (storedInfo) {
                try {
                    setExtendedInfo({ ...defaultEmployeeInfo, ...JSON.parse(storedInfo) });
                } catch (e) {
                    console.error('Failed to parse stored employee info:', e);
                }
            } else if (employee && employee.name.toLowerCase().includes('adeeb')) {
                // Demo data for Adeeb
                const demoData: ExtendedEmployeeInfo = {
                    dateOfJoining: '2023-01-15',
                    pastExperience: '5 years',
                    phoneNumber: '+1 (555) 123-4567',
                    personalEmail: 'adeeb@example.com',
                    designation: 'Senior Software Engineer',
                    currentRole: 'Tech Lead',
                    currentProject: 'Workforce Management System',
                    pastCompanies: [
                        { name: 'Tech Corp', role: 'Software Engineer', duration: '2020-2023' },
                        { name: 'Startup Inc', role: 'Junior Dev', duration: '2018-2020' }
                    ]
                };
                setExtendedInfo(demoData);
                localStorage.setItem(`${EMPLOYEE_INFO_KEY}_${id}`, JSON.stringify(demoData));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, employee]);

    // Save certifications to localStorage whenever they change
    useEffect(() => {
        if (id && localCertifications.length > 0) {
            localStorage.setItem(`${CERT_STORAGE_KEY}_${id}`, JSON.stringify(localCertifications));
        }
    }, [id, localCertifications]);

    // Initialize localUtilization from employee data or dummy data
    useEffect(() => {
        if (employee) {
            const today = new Date().toISOString().split('T')[0];
            const active = employee.utilization_data?.filter(
                (a) => a.start_date <= today && (!a.end_date || a.end_date >= today)
            ) || [];

            if (active.length > 0) {
                setLocalUtilization(active.map(a => ({
                    ...a,
                    status: 'Active', // Default status if missing
                    utilization_percent: a.utilization_percent
                })) as any);
            } else {
                // Dummy Data Logic
                setLocalUtilization([
                    { id: 'mock1', project: { name: 'ITS' }, utilization_percent: 45, start_date: today, end_date: null, status: 'Active' },
                    { id: 'mock2', project: { name: 'IITT' }, utilization_percent: 30, start_date: today, end_date: null, status: 'Active' },
                    { id: 'mock3', project: { name: 'IBCC' }, utilization_percent: 15, start_date: today, end_date: null, status: 'Active' },
                ]);
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

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleAddCertification = async () => {
        let fileData: string | null = null;

        if (certFormData.file) {
            try {
                fileData = await fileToBase64(certFormData.file);
            } catch (e) {
                console.error('Failed to convert file to base64:', e);
            }
        }

        const newCert: StoredCertification = {
            id: crypto.randomUUID(),
            name: certFormData.name.trim(),
            description: certFormData.description.trim(),
            fileName: certFormData.file?.name || null,
            fileType: certFormData.file?.type || null,
            fileData,
            addedAt: new Date().toISOString(),
        };

        setLocalCertifications(prev => [...prev, newCert]);

        // Reset form and close modal
        setCertFormData({ name: '', description: '', file: null });
        setIsAddCertModalOpen(false);
    };

    const handleDeleteCertification = (certId: string) => {
        setLocalCertifications(prev => {
            const updated = prev.filter(c => c.id !== certId);
            if (id) {
                if (updated.length === 0) {
                    localStorage.removeItem(`${CERT_STORAGE_KEY}_${id}`);
                } else {
                    localStorage.setItem(`${CERT_STORAGE_KEY}_${id}`, JSON.stringify(updated));
                }
            }
            return updated;
        });
    };

    const handleViewCertificate = (cert: StoredCertification) => {
        if (cert.fileData) {
            const newWindow = window.open();
            if (newWindow) {
                if (cert.fileType === 'application/pdf') {
                    newWindow.document.write(`<iframe src="${cert.fileData}" style="width:100%;height:100%;border:none;"></iframe>`);
                } else {
                    newWindow.document.write(`<img src="${cert.fileData}" style="max-width:100%;height:auto;" />`);
                }
            }
        }
    };

    const isFormValid = certFormData.name.trim() !== '';

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

    // Prepare segments for multi-utilization bar
    const utilizationSegments = localUtilization.map(alloc => ({
        id: alloc.id,
        label: alloc.project?.name || 'Unknown Project',
        value: Number(alloc.utilization_percent) || 0,
        // Assign colors based on index or ID for consistency in demo
        color: alloc.id === 'mock1' ? 'bg-blue-500' :
            alloc.id === 'mock2' ? 'bg-indigo-500' :
                alloc.id === 'mock3' ? 'bg-emerald-500' : undefined
    }));



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
                status: 'Active'
            }
        ]);
    };

    const handleUpdateUtilization = (id: string, field: keyof LocalUtilization | 'projectName', value: any) => {
        setLocalUtilization(prev => prev.map(a => {
            if (a.id !== id) return a;
            if (field === 'projectName') {
                return { ...a, project: { ...a.project, name: value } };
            }
            return { ...a, [field]: value };
        }));
    };

    const handleRemoveUtilization = (id: string) => {
        setLocalUtilization(prev => prev.filter(a => a.id !== id));
    };

    const handleSaveUtilization = () => {
        // In a real app, this would save to backend
        setIsManageUtilizationOpen(false);
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
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <EnvelopeSimple size={14} />
                            {employee.email}
                        </span>
                        <span className="flex items-center gap-1">
                            <Buildings size={14} />
                            {employee.entity?.name || 'N/A'}
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
                        isMultiUtilization={true}
                        multiSegments={utilizationSegments}
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
                    <TabsTrigger value="skills">
                        <Star size={16} className="mr-2" />
                        Skills
                    </TabsTrigger>
                    <TabsTrigger value="performance">
                        <Star size={16} className="mr-2" />
                        Performance
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
                                                        {alloc.project?.name || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell>{alloc.utilization_percent}%</TableCell>
                                                    <TableCell>{alloc.start_date}</TableCell>
                                                    <TableCell>{alloc.end_date || 'Ongoing'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={isActive ? 'default' : 'secondary'}>
                                                            {isActive ? 'Active' : 'Ended'}
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

                {/* Tab 3: Performance - Score out of 5 */}
                <TabsContent value="performance" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star size={20} className="text-brand-600" weight="fill" />
                                Performance Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="text-5xl font-bold text-brand-600">
                                    {employee.performance_score ? (employee.performance_score / 2).toFixed(1) : 'N/A'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg text-muted-foreground mb-2">out of 5</p>
                                    <SegmentedProgress
                                        value={employee.performance_score ? (employee.performance_score / 2) * 20 : 0}
                                        size="md"
                                        className="w-48"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-muted-foreground w-48">
                                        <span>Poor</span>
                                        <span>Average</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                            {/* Combined certifications from API and localStorage */}
                            {(employee.certifications && employee.certifications.length > 0) || localCertifications.length > 0 ? (
                                <div className="space-y-3">
                                    {/* API Certifications */}
                                    {employee.certifications?.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="flex items-center gap-4 rounded-lg border p-4"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
                                                <Certificate size={24} className="text-brand-600" weight="duotone" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{cert.name}</p>
                                                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                                            </div>
                                            {cert.valid_until && (
                                                <Badge variant="outline" className="shrink-0">
                                                    Valid until {cert.valid_until}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}

                                    {/* Local Certifications from localStorage */}
                                    {localCertifications.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="flex items-center gap-4 rounded-lg border p-4 group"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
                                                {cert.fileType === 'application/pdf' ? (
                                                    <FileIcon size={24} className="text-brand-600" weight="duotone" />
                                                ) : cert.fileData ? (
                                                    <ImageIcon size={24} className="text-brand-600" weight="duotone" />
                                                ) : (
                                                    <Certificate size={24} className="text-brand-600" weight="duotone" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium">{cert.name}</p>
                                                {cert.description && (
                                                    <p className="text-sm text-muted-foreground truncate">{cert.description}</p>
                                                )}
                                                {cert.fileName && (
                                                    <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                                                        📎 {cert.fileName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="secondary" className="text-xs">
                                                    Added {new Date(cert.addedAt).toLocaleDateString()}
                                                </Badge>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {cert.fileData && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleViewCertificate(cert)}
                                                            title="View certificate"
                                                        >
                                                            <Eye size={16} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteCertification(cert.id)}
                                                        title="Delete certification"
                                                    >
                                                        <Trash size={16} />
                                                    </Button>
                                                </div>
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
                                    rows={3}
                                    value={certFormData.description}
                                    onChange={(e) => handleCertFormChange('description', e.target.value)}
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
                                    setCertFormData({ name: '', description: '', file: null });
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
                                            <TableHead className="w-[100px]">Utilization %</TableHead>
                                            <TableHead className="w-[120px]">Status</TableHead>
                                            <TableHead className="w-[40px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {localUtilization.length > 0 ? (
                                            localUtilization.map((alloc) => (
                                                <TableRow key={alloc.id}>
                                                    <TableCell>
                                                        <Select
                                                            value={alloc.project?.name}
                                                            onValueChange={(val) => handleUpdateUtilization(alloc.id, 'projectName', val)}
                                                        >
                                                            <SelectTrigger className="h-9 w-full">
                                                                <SelectValue placeholder="Select Project" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {entities.map(entity => (
                                                                    <SelectItem key={entity.id} value={entity.name}>
                                                                        {entity.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={alloc.utilization_percent}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    handleUpdateUtilization(alloc.id, 'utilization_percent', val === '' ? '' : parseInt(val))
                                                                }}
                                                                className="pr-6"
                                                            />
                                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={alloc.status}
                                                            onValueChange={(val) => handleUpdateUtilization(alloc.id, 'status', val)}
                                                        >
                                                            <SelectTrigger className="h-9">
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
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveUtilization(alloc.id)}>
                                                            <Trash size={16} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
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

                            <Button variant="outline" onClick={handleAddUtilizationRow} className="w-full border-dashed">
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
                            <Button onClick={handleSaveUtilization}>Save Changes</Button>
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

                            {/* Empty state message for localStorage data */}
                            {/* {!extendedInfo.phoneNumber && !extendedInfo.dateOfJoining && !extendedInfo.pastExperience && (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                    <p>Extended profile information can be added by editing localStorage</p>
                                    <p className="text-xs mt-1">Key: {EMPLOYEE_INFO_KEY}_{id}</p>
                                </div>
                            )} */}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInfoPopupOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Tabs>
        </div>
    );
}
