import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Plus, X, Info } from '@phosphor-icons/react';
import type { Employee, Entity, EmployeeStatus } from '@/types';

export interface EmployeeFormData {
    name: string;
    employee_code: string;
    email: string;
    role: string;
    experience: number;
    entity_id: string;
    employment_type: 'permanent' | 'retainer' | 'intern' | 'contractor';
    primary_skills: string;
    secondary_skills: string;
    status: EmployeeStatus;
    utilization: number;
}

export interface ExtendedEmployeeInfo {
    dateOfJoining: string;
    pastExperience: string;
    phoneNumber: string;
    personalEmail: string;
    pastCompanies: { name: string; role: string; duration: string }[];
    designation: string;
    currentRole: string;
}

interface EmployeeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee?: Employee | null;
    entities: Entity[];
    onSubmit: (values: EmployeeFormData, extendedInfo?: ExtendedEmployeeInfo) => void;
    isLoading?: boolean;
}


export function EmployeeFormDialog({
    open,
    onOpenChange,
    employee,
    entities,
    onSubmit,
    isLoading,
}: EmployeeFormDialogProps) {
    const isEditing = !!employee;
    const [step, setStep] = useState<1 | 2>(1);
    const [form, setForm] = useState<EmployeeFormData>({
        name: '',
        employee_code: '',
        email: '',
        role: '',
        experience: 0,
        entity_id: '',
        employment_type: 'permanent',
        primary_skills: '',
        secondary_skills: '',
        status: 'active',
        utilization: 0,
    });
    const [extendedInfo, setExtendedInfo] = useState<ExtendedEmployeeInfo>({
        dateOfJoining: '',
        pastExperience: '',
        phoneNumber: '',
        personalEmail: '',
        pastCompanies: [],
        designation: '',
        currentRole: '',
    });
    const [countryCode, setCountryCode] = useState('+91');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newCompany, setNewCompany] = useState({ name: '', role: '', duration: '' });

    useEffect(() => {
        if (open) {
            setStep(1);
            setForm({
                name: employee?.name || '',
                employee_code: employee?.employee_code || '',
                email: employee?.email || '',
                role: employee?.role || '',
                experience: employee?.experience || 0,
                entity_id: employee?.entity_id || '',
                employment_type: employee?.employment_type || 'permanent',
                primary_skills: (employee as any)?.primary_skills || '',
                secondary_skills: (employee as any)?.secondary_skills || '',
                status: employee?.status || 'active',
                utilization: employee?.utilization || 0,
            });
            // Parse phone number to separate country code if possible
            let initialPhone = '';
            
            if (employee && (employee as any).phone_number) {
                 // Simple check for now, can be improved
                 initialPhone = (employee as any).phone_number;
            }

            setExtendedInfo({
                dateOfJoining: '',
                pastExperience: '',
                phoneNumber: initialPhone,
                personalEmail: '',
                pastCompanies: [],
                designation: '',
                currentRole: '',
            });
            setCountryCode('+91');
            setErrors({});
            setNewCompany({ name: '', role: '', duration: '' });
        }
    }, [open, employee]);

    const handleFieldChange = (field: keyof EmployeeFormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleExtendedChange = (field: keyof ExtendedEmployeeInfo, value: any) => {
        setExtendedInfo(prev => ({ ...prev, [field]: value }));
         if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name || form.name.trim().length === 0) {
            newErrors.name = 'Name is required';
        }
        if (!form.email || !form.email.includes('@')) {
            newErrors.email = 'Invalid email address';
        }
        if (!form.entity_id) {
            newErrors.entity_id = 'Please select an entity';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const addPastCompany = () => {
        if (newCompany.name.trim()) {
            setExtendedInfo(prev => ({
                ...prev,
                pastCompanies: [...prev.pastCompanies, { ...newCompany }]
            }));
            setNewCompany({ name: '', role: '', duration: '' });
        }
    };

    const removePastCompany = (index: number) => {
        setExtendedInfo(prev => ({
            ...prev,
            pastCompanies: prev.pastCompanies.filter((_, i) => i !== index)
        }));
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        
        if (extendedInfo.phoneNumber) {
             if (countryCode === '+91') {
                // Regex for 10 digits
                if (!/^\d{10}$/.test(extendedInfo.phoneNumber)) {
                    newErrors.phoneNumber = 'India numbers must be exactly 10 digits';
                }
             }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmitWithExtended = () => {
        if (validateStep2()) {
             // Combine country code and phone number if needed, or send as is
             // For now, assuming backend handles it or we send as is. 
             // If we need to combine:
             // const finalPhone = `${countryCode} ${extendedInfo.phoneNumber}`;
             // But extendedInfo has phoneNumber property. 
             // Let's attach country code or update the string.
             
             const finalData = {
                 ...extendedInfo,
                 phoneNumber: extendedInfo.phoneNumber ? `${countryCode} ${extendedInfo.phoneNumber}` : ''
             };

            onSubmit(form, finalData);
            resetForm();
        }
    };

    const handleSkip = () => {
        onSubmit(form);
        resetForm();
    };

    const resetForm = () => {
        setForm({
            name: '',
            employee_code: '',
            email: '',
            role: '',
            experience: 0,
            entity_id: '',
            employment_type: 'permanent',
            primary_skills: '',
            secondary_skills: '',
            status: 'active',
            utilization: 0,
        });
        setExtendedInfo({
            dateOfJoining: '',
            pastExperience: '',
            phoneNumber: '',
            personalEmail: '',
            pastCompanies: [],
            designation: '',
            currentRole: '',
        });
        setStep(1);
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep1()) {
            onSubmit(form);
            resetForm();
        }
    };

    // If editing, show single-step form
    if (isEditing) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmitEdit} className="space-y-4">
                        {isEditing && form.status !== 'active' && (
                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm border border-amber-200 dark:border-amber-800 mb-4 flex items-start gap-2">
                                <Info size={18} className="shrink-0 mt-0.5" />
                                <p>This employee is currently <strong>{form.status}</strong>. To edit their details, first change their status back to <strong>Active</strong>.</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                disabled={isEditing && form.status !== 'active'}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="employee_code" className="text-sm font-medium">
                                Employee ID
                            </label>
                            <Input
                                id="employee_code"
                                placeholder="EMP001"
                                value={form.employee_code}
                                onChange={(e) => handleFieldChange('employee_code', e.target.value)}
                                disabled={isEditing && form.status !== 'active'}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                placeholder="john@company.com"
                                type="email"
                                value={form.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                disabled={isEditing && form.status !== 'active'}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Designation</label>
                                <Input
                                    placeholder="e.g. Senior Developer"
                                    value={form.role}
                                    onChange={(e) => handleFieldChange('role', e.target.value)}
                                    disabled={isEditing && form.status !== 'active'}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Experience (Years)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    placeholder="e.g. 5"
                                    value={form.experience || ''}
                                    onChange={(e) => {
                                        const valStr = e.target.value.replace(/^0+(?=\d)/, '');
                                        handleFieldChange('experience', parseFloat(valStr) || 0);
                                    }}
                                    disabled={isEditing && form.status !== 'active'}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Entity</label>
                                <Select
                                    value={form.entity_id}
                                    onValueChange={(val) => handleFieldChange('entity_id', val)}
                                    disabled={isEditing && form.status !== 'active'}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select entity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {entities.map((entity) => (
                                            <SelectItem key={entity.id} value={entity.id}>
                                                {entity.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.entity_id && (
                                    <p className="text-sm text-red-500">{errors.entity_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Employment Type</label>
                                <Select
                                    value={form.employment_type}
                                    onValueChange={(val) => setForm({ ...form, employment_type: val as 'permanent' | 'retainer' | 'intern' | 'contractor' })}
                                    disabled={isEditing && form.status !== 'active'}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="permanent">Permanent</SelectItem>
                                        <SelectItem value="retainer">Retainer</SelectItem>
                                        <SelectItem value="intern">Intern</SelectItem>
                                        <SelectItem value="contractor">Contractor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Primary Skills</label>
                                <Input
                                    placeholder="e.g. React, Node.js"
                                    value={form.primary_skills}
                                    onChange={(e) => handleFieldChange('primary_skills', e.target.value)}
                                    disabled={isEditing && form.status !== 'active'}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Secondary Skills</label>
                                <Input
                                    placeholder="e.g. AWS, Figma"
                                    value={form.secondary_skills}
                                    onChange={(e) => handleFieldChange('secondary_skills', e.target.value)}
                                    disabled={isEditing && form.status !== 'active'}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={form.status}
                                    onValueChange={(val) => handleFieldChange('status', val as EmployeeStatus)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="on-hold">On-Hold</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Utilization (%)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.utilization}
                                    onChange={(e) => {
                                        const valStr = e.target.value.replace(/^0+(?=\d)/, '');
                                        handleFieldChange('utilization', parseInt(valStr) || 0);
                                    }}
                                    disabled={form.status !== 'active'}
                                />
                            </div>
                        </div>

                        {form.status === 'on-hold' && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm border border-yellow-200 dark:border-yellow-800">
                                <Info size={18} />
                                <p>If on-hold exceeds 7 days, employee will be moved to Bench</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            {isEditing && form.status !== 'active' && (
                                <p className="text-sm text-amber-600 flex items-center gap-1.5 mr-auto">
                                    <Info size={16} />
                                    Only active employees can be edited
                                </p>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                                <Button
                                    type="submit"
                                    className="bg-brand-600 hover:bg-brand-700 text-white"
                                    disabled={isLoading || (isEditing && form.status !== 'active')}
                                    data-testid="employee-save-button"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        );
    }

    // Two-step flow for adding new employee
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 ? 'Add New Employee' : 'Extended Information'}
                    </DialogTitle>
                    {step === 2 && (
                        <DialogDescription>
                            Add additional details for {form.name} (optional)
                        </DialogDescription>
                    )}
                </DialogHeader>

                {step === 1 ? (
                    // Step 1: Basic Info
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="employee_code" className="text-sm font-medium">
                                Employee ID
                            </label>
                            <Input
                                id="employee_code"
                                placeholder="EMP001"
                                value={form.employee_code}
                                onChange={(e) => handleFieldChange('employee_code', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                placeholder="john@company.com"
                                type="email"
                                value={form.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Designation</label>
                                <Input
                                    placeholder="e.g. Senior Developer"
                                    value={form.role}
                                    onChange={(e) => handleFieldChange('role', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Experience (Years)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    placeholder="e.g. 5"
                                    value={form.experience || ''}
                                    onChange={(e) => {
                                        const valStr = e.target.value.replace(/^0+(?=\d)/, '');
                                        handleFieldChange('experience', parseFloat(valStr) || 0);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Entity</label>
                                <Select
                                    value={form.entity_id}
                                    onValueChange={(val) => handleFieldChange('entity_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select entity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {entities.map((entity) => (
                                            <SelectItem key={entity.id} value={entity.id}>
                                                {entity.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.entity_id && (
                                    <p className="text-sm text-red-500">{errors.entity_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Employment Type</label>
                                <Select
                                    value={form.employment_type}
                                    onValueChange={(val) => setForm({ ...form, employment_type: val as 'permanent' | 'retainer' | 'intern' | 'contractor' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="permanent">Permanent</SelectItem>
                                        <SelectItem value="retainer">Retainer</SelectItem>
                                        <SelectItem value="intern">Intern</SelectItem>
                                        <SelectItem value="contractor">Contractor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Primary Skills</label>
                                <Input
                                    placeholder="e.g. React, Node.js"
                                    value={form.primary_skills}
                                    onChange={(e) => handleFieldChange('primary_skills', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Secondary Skills</label>
                                <Input
                                    placeholder="e.g. AWS, Figma"
                                    value={form.secondary_skills}
                                    onChange={(e) => handleFieldChange('secondary_skills', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={form.status}
                                    onValueChange={(val) => handleFieldChange('status', val as EmployeeStatus)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="on-hold">On-Hold</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Utilization (%)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.utilization}
                                    onChange={(e) => {
                                        const valStr = e.target.value.replace(/^0+(?=\d)/, '');
                                        handleFieldChange('utilization', parseInt(valStr) || 0);
                                    }}
                                    disabled={form.status !== 'active'}
                                />
                            </div>
                        </div>

                        {form.status === 'on-hold' && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm border border-yellow-200 dark:border-yellow-800">
                                <Info size={18} />
                                <p>If on-hold exceeds 7 days, employee will be moved to Bench</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="bg-brand-600 hover:bg-brand-700 text-white gap-2"
                                onClick={handleNext}
                                data-testid="employee-next-button"
                            >
                                Next
                                <ArrowRight size={16} weight="bold" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Step 2: Extended Info
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date of Joining</label>
                                <Input
                                    type="date"
                                    value={extendedInfo.dateOfJoining}
                                    onChange={(e) => handleExtendedChange('dateOfJoining', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <div className="flex gap-2">
                                    <Select
                                        value={countryCode}
                                        onValueChange={setCountryCode}
                                    >
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Code" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="+91">+91 (IN)</SelectItem>
                                            <SelectItem value="+1">+1 (US)</SelectItem>
                                            <SelectItem value="+44">+44 (UK)</SelectItem>
                                            <SelectItem value="+81">+81 (JP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="9876543210"
                                        value={extendedInfo.phoneNumber}
                                        onChange={(e) => {
                                             // Allow only numbers
                                             const val = e.target.value.replace(/\D/g, '');
                                             
                                             // Restrict length for India (+91)
                                             if (countryCode === '+91' && val.length > 10) {
                                                 return;
                                             }
                                             
                                             handleExtendedChange('phoneNumber', val);
                                        }}
                                        className="flex-1"
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Personal Email</label>
                            <Input
                                type="email"
                                placeholder="personal@email.com"
                                value={extendedInfo.personalEmail}
                                onChange={(e) => handleExtendedChange('personalEmail', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Designation</label>
                                <Input
                                    placeholder="Senior Developer"
                                    value={extendedInfo.designation}
                                    onChange={(e) => handleExtendedChange('designation', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Role</label>
                                <Input
                                    placeholder="Tech Lead"
                                    value={extendedInfo.currentRole}
                                    onChange={(e) => handleExtendedChange('currentRole', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Past Experience</label>
                            <Textarea
                                placeholder="Brief summary of past experience..."
                                rows={2}
                                value={extendedInfo.pastExperience}
                                onChange={(e) => handleExtendedChange('pastExperience', e.target.value)}
                            />
                        </div>

                        {/* Past Companies Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Past Companies</label>

                            {extendedInfo.pastCompanies.length > 0 && (
                                <div className="space-y-2">
                                    {extendedInfo.pastCompanies.map((company, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                                            <div className="flex-1 text-sm">
                                                <span className="font-medium">{company.name}</span>
                                                {company.role && <span className="text-muted-foreground"> • {company.role}</span>}
                                                {company.duration && <span className="text-muted-foreground"> • {company.duration}</span>}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => removePastCompany(index)}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                <Input
                                    placeholder="Company"
                                    value={newCompany.name}
                                    onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <Input
                                    placeholder="Role"
                                    value={newCompany.role}
                                    onChange={(e) => setNewCompany(prev => ({ ...prev, role: e.target.value }))}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Duration"
                                        value={newCompany.duration}
                                        onChange={(e) => setNewCompany(prev => ({ ...prev, duration: e.target.value }))}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0"
                                        onClick={addPastCompany}
                                        disabled={!newCompany.name.trim()}
                                    >
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSkip}
                                    disabled={isLoading}
                                >
                                    Skip for now
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-brand-600 hover:bg-brand-700 text-white"
                                    onClick={handleSubmitWithExtended}
                                    disabled={isLoading}
                                    data-testid="employee-submit-button"
                                >
                                    {isLoading ? 'Saving...' : 'Submit'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
