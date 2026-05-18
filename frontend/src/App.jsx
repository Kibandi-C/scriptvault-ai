import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore, useUIStore } from './store'
import { TheForge } from './components/forge/TheForge'
import { TheVault } from './components/vault/TheVault'
import { ToastContainer } from './components/shared/Toast'
import { MpesaModal } from './components/shared/MpesaModal'
import { AuthModal } from './components/shared/AuthModal'

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

function Header() {
  const { token, user, tier, logout } = useAuthStore()
  const { activeTab, setActiveTab, openAuthModal } = useUIStore()

  return (
    <header className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,5,0.85)] backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-green font-bold font-mono text-lg leading-none">SV</span>
          <span className="text-[#F0F0F0] font-semibold tracking-tight hidden sm:block">
            ScriptVault
          </span>
          {tier === 'pro' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,122,255,0.10)] border border-[rgba(0,122,255,0.25)] text-blue">
              PRO
            </span>
          )}
        </div>

        {token ? (
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Tab nav */}
            <nav className="flex gap-0.5">
              {['forge', 'vault'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium capitalize
                    transition-all duration-100
                    ${activeTab === tab
                      ? 'bg-[rgba(0,255,65,0.08)] text-green'
                      : 'text-[#9A9A9A] hover:text-[#F0F0F0]'
                    }
                  `}
                >
                  <span className="hidden sm:inline">The </span>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* User + sign out */}
            <div className="flex items-center gap-3 pl-2 sm:pl-0 border-l border-[rgba(255,255,255,0.06)] sm:border-none">
              {user?.username && (
                <span className="text-xs text-[#4A4A4A] hidden sm:block">{user.username}</span>
              )}
              <button
                onClick={logout}
                className="text-xs text-[#4A4A4A] hover:text-[#9A9A9A] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="text-sm text-[#9A9A9A] hover:text-[#F0F0F0] px-3 py-1.5 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="text-sm bg-green text-[#050505] font-semibold px-4 py-1.5 rounded-md hover:bg-green-dim transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function LandingHero() {
  const { openAuthModal } = useUIStore()
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-[#F0F0F0] tracking-tight leading-tight">
          Scripts that{' '}
          <span className="text-green">actually work.</span>
        </h1>
        <p className="text-[#9A9A9A] text-lg leading-relaxed max-w-md mx-auto">
          AI-generated messages for cold outreach, networking, salary talks, apologies, and more.
          3 variations per request. Human-sounding. Kenyan-aware.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => openAuthModal('register')}
          className="bg-green text-[#050505] font-semibold px-8 py-3 rounded-md hover:bg-green-dim transition-colors text-base"
        >
          Start for free
        </button>
        <button
          onClick={() => openAuthModal('login')}
          className="border border-[rgba(255,255,255,0.10)] text-[#F0F0F0] font-medium px-8 py-3 rounded-md hover:border-[rgba(255,255,255,0.20)] transition-colors text-base"
        >
          Sign in
        </button>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center text-xs text-[#4A4A4A]">
        <span>5 free generations/day</span>
        <span>·</span>
        <span>Pro: KES 1/month via M-Pesa</span>
        <span>·</span>
        <span>8 intents · 6 tones</span>
      </div>
    </div>
  )
}

function AppContent() {
  const { token } = useAuthStore()
  const { activeTab, openAuthModal } = useUIStore()

  useEffect(() => {
    if (!token) openAuthModal('login')
  }, []) // run once on mount

  if (!token) return <LandingHero />

  return activeTab === 'forge' ? <TheForge /> : <TheVault />
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-dvh bg-void font-sans">
        <Header />
        <main>
          <AppContent />
        </main>
        <ToastContainer />
        <MpesaModal />
        <AuthModal />
      </div>
    </QueryClientProvider>
  )
}
