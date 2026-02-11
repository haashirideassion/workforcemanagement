import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Account } from "@/types";

interface AccountFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    account?: Account | null;
    onSubmit: (data: Partial<Account>) => void;
}

export function AccountFormDialog({
    open,
    onOpenChange,
    account,
    onSubmit,
}: AccountFormDialogProps) {
    const isEditing = !!account;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        entity: 'ITS' as string,
        zone: 'USA' as string,
        description: '',
        website: '',
        domain: '',
        billingType: 'Retainer' as 'Retainer' | 'T&M' | 'Fixed',
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: account?.name || '',
                email: account?.email || '',
                entity: account?.entity || 'ITS',
                zone: account?.zone || 'USA',
                description: account?.description || '',
                website: account?.website || '',
                domain: account?.domain || '',
                billingType: account?.billingType || 'Retainer',
            });
        }
    }, [open, account]);

    const handleSubmit = () => {
        onSubmit(formData as unknown as Partial<Account>);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update account details and profile information.' : 'Create a new client account to manage projects and resources.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Account Name</Label>
                        <Input
                            id="name"
                            data-testid="account-name-input"
                            placeholder="e.g., Acme Corporation"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Client Email</Label>
                        <Input
                            id="email"
                            data-testid="account-email-input"
                            type="email"
                            placeholder="contact@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="entity">Entity</Label>
                        <Select
                            value={formData.entity}
                            onValueChange={(value) => setFormData({ ...formData, entity: value })}
                        >
                            <SelectTrigger data-testid="account-entity-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="ITS">ITS</SelectItem>
                                    <SelectItem value="IBCC">IBCC</SelectItem>
                                    <SelectItem value="IITT">IITT</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="zone">Zone</Label>
                        <Select
                            value={formData.zone}
                            onValueChange={(value) => setFormData({ ...formData, zone: value })}
                        >
                            <SelectTrigger data-testid="account-zone-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="USA">USA</SelectItem>
                                    <SelectItem value="Asia">Asia</SelectItem>
                                    <SelectItem value="EMEA">EMEA</SelectItem>
                                    <SelectItem value="LatAm">LatAm</SelectItem>
                                    <SelectItem value="APAC">APAC</SelectItem>
                                    <SelectItem value="Europe">Europe</SelectItem>
                                </SelectGroup>
                            </SelectContent>

                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                data-testid="account-website-input"
                                placeholder="https://acme.org"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                data-testid="account-domain-input"
                                placeholder="Technology"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="billingType">Account Type (Billing)</Label>
                        <Select
                            value={formData.billingType}
                            onValueChange={(value) => setFormData({ ...formData, billingType: value as any })}
                        >
                            <SelectTrigger data-testid="account-billing-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Retainer">Retainer</SelectItem>
                                    <SelectItem value="T&M">T&M</SelectItem>
                                    <SelectItem value="Fixed">Fixed</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            data-testid="account-description-input"
                            placeholder="Brief account description..."
                            value={(formData as any).description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value } as any)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-brand-600 hover:bg-brand-700 text-white"
                        onClick={handleSubmit}
                        data-testid="account-submit-button"
                    >
                        {isEditing ? 'Save Changes' : 'Add Account'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
