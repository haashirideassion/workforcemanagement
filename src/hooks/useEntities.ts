import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Entity } from '@/types';

export function useEntities() {
    return useQuery({
        queryKey: ['entities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('entities')
                .select('*')
                .order('name');

            if (error) throw error;
            return data as Entity[];
        },
    });
}
