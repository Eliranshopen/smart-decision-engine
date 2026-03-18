import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useAffiliates(filters = {}) {
  return useQuery({
    queryKey: ['affiliates', filters],
    queryFn: async () => {
      const { data } = await api.get('/api/affiliates', { params: filters });
      return data;
    },
  });
}
