import { useState } from 'react'
import { useGenerateScript } from '../../hooks/useGenerateScript'
import { useSaveScript } from '../../hooks/useSaveScript'
import { useUIStore, useAuthStore } from '../../store'
import { Button } from '../shared/Button'
import { Textarea } from '../shared/Input'

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const IconChat = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconHeart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
)
const IconWallet = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <path d="M2 10h20"/>
  </svg>
)
const IconReply = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 17 4 12 9 7"/>
    <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
  </svg>
)
const IconUserPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" x2="19" y1="8" y2="14"/>
    <line x1="22" x2="16" y1="11" y2="11"/>
  </svg>
)

const INTENTS = [
  { value: 'cold_email',          label: 'Cold Email',         Icon: IconMail },
  { value: 'social_rizz',         label: 'Social Rizz',        Icon: IconChat },
  { value: 'conflict_resolution', label: 'Conflict Fix',       Icon: IconShield },
  { value: 'networking_dm',       label: 'Networking DM',      Icon: IconUsers },
  { value: 'apology',             label: 'Apology',            Icon: IconHeart },
  { value: 'salary_negotiation',  label: 'Salary Negotiation', Icon: IconWallet },
  { value: 'follow_up',           label: 'Follow Up',          Icon: IconReply },
  { value: 'introduction',        label: 'Introduction',       Icon: IconUserPlus },
]

const TONES = [
  { value: 'formal',       label: 'Formal' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual',       label: 'Casual' },
  { value: 'playful',      label: 'Playful' },
  { value: 'assertive',    label: 'Assertive' },
  { value: 'empathetic',   label: 'Empathetic' },
]

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="w-4 h-4 border-2 border-[#050505] border-t-transparent rounded-full inline-block"
      style={{ animation: 'spin 0.75s linear infinite' }}
    />
  )
}

function VariationCard({ variation, intent, tone, context, index }) {
  const saveScript = useSaveScript()
  const addToast = useUIStore((s) => s.addToast)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(variation.body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      addToast({ type: 'success', message: 'Copied to clipboard.' })
    })
  }

  const handleSave = () => {
    saveScript.mutate({ intent, tone, context, body: variation.body })
  }

  return (
    <div className="glass-card p-5 flex flex-col gap-4 fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wider uppercase text-[#9A9A9A]">
          Variation {index + 1}
        </span>
        <span className="text-xs text-[#4A4A4A]">{variation.word_count}w</span>
      </div>

      <pre className="script-preview text-sm leading-relaxed flex-1">
        {variation.body}
      </pre>

      <div className="flex gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
        <Button variant="primary" size="sm" onClick={handleCopy} className="flex-1">
          {copied ? '✓ Copied' : 'Copy'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={saveScript.isPending}
          className="flex-1"
        >
          {saveScript.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

export function TheForge() {
  const [intent, setIntent] = useState('')
  const [tone, setTone] = useState('')
  const [context, setContext] = useState('')
  const tier = useAuthStore((s) => s.tier)
  const generate = useGenerateScript()

  const canGenerate = intent && tone && context.trim().length >= 10 && !generate.isPending

  const handleGenerate = () => {
    if (canGenerate) generate.mutate({ intent, tone, context })
  }

  const variations = generate.data?.data?.variations || []
  const dailyRemaining = generate.data?.data?.daily_remaining

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#F0F0F0] tracking-tight">The Forge</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">
          Select intent and tone, describe the situation, generate 3 variations.
        </p>
      </div>

      {/* Intent selector */}
      <div className="space-y-3">
        <label className="text-xs font-medium tracking-wider uppercase text-[#9A9A9A]">
          Intent
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Select intent">
          {INTENTS.map((i) => (
            <button
              key={i.value}
              type="button"
              onClick={() => setIntent(i.value)}
              aria-pressed={intent === i.value}
              className={`
                flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium
                transition-all duration-150 text-left
                ${intent === i.value
                  ? 'border-green text-green bg-[rgba(0,255,65,0.05)]'
                  : 'border-[rgba(255,255,255,0.06)] text-[#9A9A9A] hover:border-[rgba(255,255,255,0.15)] hover:text-[#F0F0F0]'
                }
              `}
            >
              <i.Icon />
              <span>{i.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tone selector */}
      <div className="space-y-3">
        <label className="text-xs font-medium tracking-wider uppercase text-[#9A9A9A]">
          Tone
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select tone">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              aria-pressed={tone === t.value}
              className={`
                px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150
                ${tone === t.value
                  ? 'border-blue text-blue bg-[rgba(0,122,255,0.05)]'
                  : 'border-[rgba(255,255,255,0.06)] text-[#9A9A9A] hover:border-[rgba(255,255,255,0.15)] hover:text-[#F0F0F0]'
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Context */}
      <div className="space-y-2">
        <Textarea
          label="Context"
          placeholder="Who are you reaching out to? What do you want? Include any relevant details — the more specific, the better the scripts."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={4}
          maxLength={800}
        />
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs text-[#4A4A4A]">{context.length} / 800</span>
          {tier === 'free' && dailyRemaining != null && (
            <span className="text-xs text-[#9A9A9A]">
              {dailyRemaining} free generation{dailyRemaining !== 1 ? 's' : ''} left today
            </span>
          )}
        </div>
      </div>

      {/* Generate */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleGenerate}
        disabled={!canGenerate}
        aria-busy={generate.isPending}
        className="w-full"
      >
        {generate.isPending ? (
          <span className="flex items-center gap-2">
            <Spinner />
            <span>Generating...</span>
          </span>
        ) : (
          'Generate Scripts'
        )}
      </Button>

      {/* Results */}
      {variations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.06)]" aria-hidden="true" />
            <span className="text-xs text-[#4A4A4A] uppercase tracking-widest">Results</span>
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.06)]" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variations.map((v, i) => (
              <VariationCard
                key={i}
                variation={v}
                intent={intent}
                tone={tone}
                context={context}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
