import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const { data } = await api.get('/api/recommendations');
      return data.data;
    },
  });
}
