import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { useUIStore } from '../store'

export function useSaveScript() {
  const qc = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: (payload) =>
      api.post('/api/v1/scripts/save', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault'] })
      addToast({ type: 'success', message: 'Script saved to Vault.' })
    },
    onError: () => {
      addToast({ type: 'error', message: 'Failed to save script.' })
    },
  })
}
