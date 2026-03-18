import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useNews(filters = {}) {
  return useQuery({
    queryKey: ['news', filters],
    queryFn: async () => {
      const { data } = await api.get('/api/news', { params: filters });
      return data;
    },
  });
}
