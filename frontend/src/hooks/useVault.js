import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { useAuthStore } from '../store'

export function useVault() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['vault'],
    queryFn: () => api.get('/api/v1/scripts/').then((r) => r.data.data),
    enabled: !!token,
    staleTime: 30_000,
  })
}
