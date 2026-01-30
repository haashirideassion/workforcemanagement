import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MagnifyingGlass,
    Plus,
    Funnel,
    DotsThree,
    Briefcase,
    User,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccounts } from '@/hooks/useAccounts';
import type { Account } from '@/types';
import { AccountFormDialog } from '@/components/accounts/AccountFormDialog';

// Status badge component
function getStatusBadge(status: Account['status']) {
    switch (status) {
        case 'healthy':
            return <Badge variant="green">Healthy</Badge>;
        case 'at-risk':
            return <Badge variant="yellow">At Risk</Badge>;
        case 'critical':
            return <Badge variant="destructive">Critical</Badge>;
        case 'on-hold':
            return <Badge variant="outline">On Hold</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}



export function Accounts() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [entityFilter, setEntityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [zoneFilter, setZoneFilter] = useState("all");
    const [formOpen, setFormOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const { data: accounts = [], isLoading } = useAccounts();

    if (isLoading) {
        return <div className="p-8 text-center">Loading accounts...</div>;
    }

    // Form state for new account is handled inside the dialog now

    const filteredAccounts = accounts.filter((account) => {
        const matchesSearch =
            account.name.toLowerCase().includes(search.toLowerCase()) ||
            account.email.toLowerCase().includes(search.toLowerCase());
        const matchesEntity = entityFilter === "all" || account.entity === entityFilter;
        const matchesStatus = statusFilter === "all" || account.status === statusFilter;
        const matchesZone = zoneFilter === "all" || account.zone === zoneFilter;
        return matchesSearch && matchesEntity && matchesStatus && matchesZone;
    });

    const handleFormSubmit = (data: Partial<Account>) => {
        if (editingAccount) {
            console.log('Updating account:', { ...editingAccount, ...data });
        } else {
            console.log('Adding account:', data);
        }
        setFormOpen(false);
        setEditingAccount(null);
    };

    const handleEditClick = (account: Account) => {
        setEditingAccount(account);
        setFormOpen(true);
    };

    const handleAddClick = () => {
        setEditingAccount(null);
        setFormOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Accounts</h1>
                    <p className="text-muted-foreground">
                        Manage client accounts and their projects
                    </p>
                </div>
                <Button
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                    onClick={handleAddClick}
                >
                    <Plus size={16} className="mr-2" />
                    Add Account
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlass
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                size={16}
                            />
                            <Input
                                placeholder="Search accounts, contacts..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={entityFilter} onValueChange={setEntityFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Entities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All Entities</SelectItem>
                                    <SelectItem value="ITS">ITS</SelectItem>
                                    <SelectItem value="IBCC">IBCC</SelectItem>
                                    <SelectItem value="IITT">IITT</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="healthy">Healthy</SelectItem>
                                    <SelectItem value="at-risk">At Risk</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="on-hold">On Hold</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select value={zoneFilter} onValueChange={setZoneFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Zones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All Zones</SelectItem>
                                    <SelectItem value="USA">USA</SelectItem>
                                    <SelectItem value="Asia">Asia</SelectItem>
                                    <SelectItem value="EMEA">EMEA</SelectItem>
                                    <SelectItem value="LatAm">LatAm</SelectItem>
                                    <SelectItem value="APAC">APAC</SelectItem>
                                    <SelectItem value="Europe">Europe</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon">
                            <Funnel size={16} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Accounts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Accounts ({filteredAccounts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account Name</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Active Projects</TableHead>
                                <TableHead>Utilized Resources</TableHead>
                                <TableHead>Average Utilization</TableHead>
                                <TableHead>Zone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.map((account) => (
                                <TableRow
                                    key={account.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => navigate(`/accounts/${account.id}`)}
                                >
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{account.name}</p>
                                            <p className="text-sm text-muted-foreground">{account.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{account.entity}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={14} className="text-muted-foreground" />
                                            <span>{account.activeProjects}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-muted-foreground" />
                                            <span>{account.utilizedResources}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <SegmentedProgress value={account.utilization} size="sm" className="w-24" />
                                            <span className="text-sm">{account.utilization}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{account.zone}</Badge>
                                    </TableCell>

                                    <TableCell>
                                        {getStatusBadge(account.status)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <DotsThree size={16} weight="bold" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/accounts/${account.id}`);
                                                }}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    View Projects
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(account);
                                                    }}
                                                >
                                                    Edit Account
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-red-600"
                                                >
                                                    Archive
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Account Form Dialog */}
            <AccountFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                account={editingAccount}
                onSubmit={handleFormSubmit}
            />
        </div >
    );
}
