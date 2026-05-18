import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useVault } from '../../hooks/useVault'
import { useTrackUsage } from '../../hooks/useTrackUsage'
import { useUIStore } from '../../store'
import { Button } from '../shared/Button'
import api from '../../services/api'

const INTENT_LABELS = {
  cold_email:          'Cold Email',
  social_rizz:         'Social Rizz',
  conflict_resolution: 'Conflict Fix',
  networking_dm:       'Networking DM',
  apology:             'Apology',
  salary_negotiation:  'Salary Negotiation',
  follow_up:           'Follow Up',
  introduction:        'Introduction',
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          className={`text-sm leading-none transition-colors ${
            (hover || value) >= star ? 'text-[#FFD60A]' : 'text-[#4A4A4A] hover:text-[#9A9A9A]'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ScriptCard({ script }) {
  const qc = useQueryClient()
  const trackUsage = useTrackUsage()
  const addToast = useUIStore((s) => s.addToast)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/v1/scripts/${script.id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault'] })
      addToast({ type: 'success', message: 'Script deleted.' })
    },
    onError: () => {
      setConfirmDelete(false)
      addToast({ type: 'error', message: 'Delete failed.' })
    },
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(script.body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackUsage.mutate({ id: script.id, event: 'copy' })
      addToast({ type: 'success', message: 'Copied to clipboard.' })
    })
  }

  const handleRate = (rating) => {
    trackUsage.mutate({ id: script.id, rating })
  }

  const PREVIEW_LEN = 180
  const truncated = script.body.length > PREVIEW_LEN

  return (
    <div className="glass-card p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full border border-green/30 text-green">
            {INTENT_LABELS[script.intent] || script.intent}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.10)] text-[#9A9A9A] capitalize">
            {script.tone}
          </span>
        </div>
        <span className="text-xs text-[#4A4A4A] flex-shrink-0 tabular-nums">
          {new Date(script.created_at).toLocaleDateString('en-KE', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>

      {/* Body */}
      <pre className="script-preview text-sm leading-relaxed">
        {expanded ? script.body : script.body.slice(0, PREVIEW_LEN)}
        {truncated && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[#9A9A9A] hover:text-green ml-1 font-sans not-italic text-xs"
          >
            …more
          </button>
        )}
      </pre>

      {/* Context hint */}
      {script.context && (
        <p className="text-xs text-[#4A4A4A] truncate" title={script.context}>
          {script.context}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <Button variant="primary" size="sm" onClick={handleCopy}>
          {copied ? '✓' : 'Copy'}
        </Button>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9A9A9A]">Delete?</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '...' : 'Yes'}
            </Button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-[#4A4A4A] hover:text-[#9A9A9A] transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        )}
        <div className="ml-auto">
          <StarRating value={script.success_rating || 0} onChange={handleRate} />
        </div>
      </div>

      {/* Usage */}
      {(script.usage?.copy_count > 0 || script.usage?.send_count > 0) && (
        <div className="flex gap-3 text-xs text-[#4A4A4A]">
          {script.usage.copy_count > 0 && <span>{script.usage.copy_count}× copied</span>}
          {script.usage.send_count > 0 && <span>{script.usage.send_count}× sent</span>}
        </div>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3 animate-pulse">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-[rgba(255,255,255,0.06)]" />
        <div className="h-5 w-16 rounded-full bg-[rgba(255,255,255,0.06)]" />
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-[rgba(255,255,255,0.04)]" />
        <div className="h-3 rounded bg-[rgba(255,255,255,0.04)] w-5/6" />
        <div className="h-3 rounded bg-[rgba(255,255,255,0.04)] w-4/6" />
        <div className="h-3 rounded bg-[rgba(255,255,255,0.04)] w-3/4" />
      </div>
      <div className="h-8 rounded-md bg-[rgba(255,255,255,0.04)]" />
    </div>
  )
}

export function TheVault() {
  const { data: scripts, isLoading, isError } = useVault()
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-[#FF453A] text-sm">
        Failed to load vault. Please refresh.
      </div>
    )
  }

  if (!scripts?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#4A4A4A]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="m3.3 7 8.7 5 8.7-5"/>
            <path d="M12 22V12"/>
          </svg>
        </div>
        <div>
          <p className="text-[#9A9A9A] text-sm">Your vault is empty.</p>
          <p className="text-[#4A4A4A] text-xs mt-1">Save generated scripts to see them here.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setActiveTab('forge')}>
          Go to The Forge
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#F0F0F0] tracking-tight">The Vault</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">
          {scripts.length} saved script{scripts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scripts.map((s) => (
          <ScriptCard key={s.id} script={s} />
        ))}
      </div>
    </div>
  )
}
