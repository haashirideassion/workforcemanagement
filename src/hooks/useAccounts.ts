import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Account } from '@/types';

// Helper to transform DB result to Account type
const transformAccount = (data: any): Account => {
    // Calculate metrics from projects/allocations if available
    // Note: This matches the schema structure we expect
    const projects = data.projects || [];
    const activeProjects = projects.filter((p: any) => p.status === 'active').length;
    
    // Calculate utilization and utilized resources
    // This is valid if we fetch projects -> allocations
    let utilizedCount = 0;
    let totalUtilization = 0;
    // utilizationCount removed as it was unused
    // The mock data had "utilization" as a single number (Avg? Total?). 
    // Usually it's resource utilization.
    // Let's approximate based on allocations. 
    
    const allocations = projects.flatMap((p: any) => p.allocations || []);
    const uniqueEmployees = new Set(allocations.map((a: any) => a.employee_id)).size;
    utilizedCount = uniqueEmployees;

    // Average utilization of the account's projects?
    // Or average utilization of allocated resources?
    // Let's use average of allocations for now.
    if (allocations.length > 0) {
        const sumUtils = allocations.reduce((sum: number, a: any) => sum + (a.allocation_percent || 0), 0);
        totalUtilization = Math.round(sumUtils / allocations.length); // Average utilization per allocation
    }

    return {
        id: data.id,
        name: data.name,
        email: data.email || '',
        entity: data.entity?.name as 'ITS' | 'IBCC' | 'IITT', // Assuming valid names in DB
        activeProjects,
        utilizedResources: utilizedCount,
        utilization: totalUtilization, // Placeholder logic
        billingType: data.billing_type as 'T&M' | 'Fixed' | 'Retainer',
        status: data.status as 'healthy' | 'at-risk' | 'critical' | 'on-hold',
        zone: data.zone as 'USA' | 'Asia' | 'EMEA' | 'LatAm' | 'APAC' | 'Europe',
        startDate: data.start_date,
        description: data.description,
        website: data.website,
        domain: data.domain
    };
};

export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('accounts')
                .select(`
                    *,
                    entity:entities(name),
                    projects(
                        status,
                        allocations(employee_id, allocation_percent)
                    )
                `)
                .order('name');

            if (error) throw error;
            return (data || []).map(transformAccount);
        },
    });
}

export function useAccount(id: string) {
    return useQuery({
        queryKey: ['account', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('accounts')
                .select(`
                    *,
                    entity:entities(name),
                    projects(
                        status,
                        allocations(employee_id, allocation_percent)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return transformAccount(data);
        },
        enabled: !!id,
    });
}

export function useCreateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (account: Omit<Account, 'id' | 'activeProjects' | 'utilizedResources' | 'utilization'>) => {
             // We need to resolve entity name to ID
            const { data: entityData, error: entityError } = await supabase
                .from('entities')
                .select('id')
                .eq('name', account.entity)
                .single();
            
            if (entityError) throw entityError;
            
            const dbPayload = {
                name: account.name,
                email: account.email,
                entity_id: entityData.id,
                billing_type: account.billingType,
                status: account.status,
                zone: account.zone,
                start_date: account.startDate,
                description: account.description,
                website: account.website,
                domain: account.domain
            };

            const { data, error } = await supabase
                .from('accounts')
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useUpdateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
            const dbPayload: any = {};
            if (updates.name) dbPayload.name = updates.name;
            if (updates.email) dbPayload.email = updates.email;
            if (updates.billingType) dbPayload.billing_type = updates.billingType;
            if (updates.status) dbPayload.status = updates.status;
            if (updates.zone) dbPayload.zone = updates.zone;
            if (updates.startDate) dbPayload.start_date = updates.startDate;
            if (updates.description) dbPayload.description = updates.description;
            if (updates.website) dbPayload.website = updates.website;
            if (updates.domain) dbPayload.domain = updates.domain;
            
            if (updates.entity) {
                 const { data: entityData, error: entityError } = await supabase
                .from('entities')
                .select('id')
                .eq('name', updates.entity)
                .single();
                 if (entityError) throw entityError;
                 dbPayload.entity_id = entityData.id;
            }

            const { data, error } = await supabase
                .from('accounts')
                .update(dbPayload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (updatedAccount) => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['account', updatedAccount.id] });
        },
    });
}

