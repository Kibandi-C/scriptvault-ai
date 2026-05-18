import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      tier: 'free',
      setAuth: (token, user) =>
        set({ token, user, tier: user?.tier || 'free' }),
      setTier: (tier) => set((s) => ({ tier, user: s.user ? { ...s.user, tier } : s.user })),
      logout: () => set({ token: null, user: null, tier: 'free' }),
    }),
    { name: 'sv-auth', partialize: (s) => ({ token: s.token, user: s.user, tier: s.tier }) }
  )
)

export const useUIStore = create((set) => ({
  activeTab: 'forge',
  toasts: [],
  mpesaModalOpen: false,
  authModalOpen: false,
  authModalMode: 'login',

  setActiveTab: (tab) => set({ activeTab: tab }),

  addToast: (toast) =>
    set((s) => ({ toasts: [...s.toasts, { id: Date.now() + Math.random(), ...toast }] })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  openMpesaModal: () => set({ mpesaModalOpen: true }),
  closeMpesaModal: () => set({ mpesaModalOpen: false }),

  openAuthModal: (mode = 'login') => set({ authModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ authModalOpen: false }),
}))
