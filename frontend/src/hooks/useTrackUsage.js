import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useTrackUsage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, event, rating }) =>
      api.patch(`/api/v1/scripts/${id}/usage`, { event, rating }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault'] })
    },
  })
}
