import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useUIStore, useAuthStore } from '../../store'
import { Button } from './Button'
import { Input } from './Input'
import api from '../../services/api'

export function MpesaModal() {
  const { mpesaModalOpen, closeMpesaModal, addToast } = useUIStore()
  const { user, setTier } = useAuthStore()

  const [phone, setPhone] = useState(user?.phone || '')
  const [checkoutId, setCheckoutId] = useState(null)
  const [polling, setPolling] = useState(false)

  const stkMutation = useMutation({
    mutationFn: (payload) =>
      api.post('/api/v1/payments/stk-push', payload).then((r) => r.data),
    onSuccess: (data) => {
      setCheckoutId(data.checkout_request_id)
      setPolling(true)
      addToast({ type: 'info', message: data.message })
    },
    onError: (e) => {
      addToast({
        type: 'error',
        message: e.response?.data?.detail?.message || 'Payment initiation failed.',
      })
    },
  })

  const { data: statusData } = useQuery({
    queryKey: ['payment-status', checkoutId],
    queryFn: () =>
      api.get(`/api/v1/payments/status/${checkoutId}`).then((r) => r.data),
    enabled: polling && !!checkoutId,
    refetchInterval: 3000,
  })

  useEffect(() => {
    if (!statusData?.data) return
    if (statusData.data.status === 'completed') {
      setPolling(false)
      setTier('pro')
      closeMpesaModal()
      addToast({ type: 'success', message: 'Pro tier activated. Unlimited generations unlocked.' })
    } else if (statusData.data.status === 'failed') {
      setPolling(false)
      addToast({ type: 'error', message: 'Payment failed. Please try again.' })
    }
  }, [statusData])

  const handleClose = () => {
    setPolling(false)
    setCheckoutId(null)
    closeMpesaModal()
  }

  if (!mpesaModalOpen) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative glass-card max-w-md w-full mx-4 p-8 shadow-modal fade-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#F0F0F0]">Upgrade to Pro</h2>
            <p className="text-sm text-[#9A9A9A] mt-1">KES 1 · Unlimited generations · Forever</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-[#4A4A4A] hover:text-[#9A9A9A] transition-colors text-xl leading-none mt-0.5"
          >
            ×
          </button>
        </div>

        {!checkoutId ? (
          <>
            <div className="bg-surface rounded-lg p-4 mb-6 border border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
                <span className="text-sm font-medium text-[#F0F0F0]">Pro includes</span>
              </div>
              <ul className="space-y-1.5 text-sm text-[#9A9A9A]">
                <li>· Unlimited script generations daily</li>
                <li>· All 8 intents + 6 tones</li>
                <li>· Unlimited Vault storage</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Input
                label="Safaricom M-Pesa Number"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-[#4A4A4A]">
                Safaricom numbers only. An STK push prompt will appear on your phone.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => stkMutation.mutate({ phone_number: phone, amount: 1 })}
                disabled={!phone.trim() || stkMutation.isPending}
              >
                {stkMutation.isPending ? 'Sending prompt...' : 'Pay KES 1 via M-Pesa'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-green border-t-transparent mx-auto"
              style={{ animation: 'spin 1s linear infinite' }} />
            <p className="text-[#F0F0F0] font-medium">Waiting for payment</p>
            <p className="text-sm text-[#9A9A9A]">Enter your M-Pesa PIN when prompted</p>
            <button
              onClick={handleClose}
              className="text-xs text-[#4A4A4A] hover:text-[#9A9A9A] transition-colors mt-4 block mx-auto"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
