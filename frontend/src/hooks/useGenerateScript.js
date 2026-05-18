import { useMutation } from '@tanstack/react-query'
import api from '../services/api'
import { useUIStore } from '../store'

export function useGenerateScript() {
  const { addToast, openMpesaModal } = useUIStore()

  return useMutation({
    mutationFn: (payload) =>
      api.post('/api/v1/scripts/generate', payload).then((r) => r.data),
    onError: (error) => {
      const code = error.response?.data?.detail?.code
      if (code === 'FREE_LIMIT_REACHED') {
        openMpesaModal()
      } else {
        addToast({
          type: 'error',
          message: error.response?.data?.detail?.message || 'Generation failed. Try again.',
        })
      }
    },
  })
}
