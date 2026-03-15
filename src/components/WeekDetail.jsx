import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { curriculum } from '../data/curriculum'

function relativeTime(isoString) {
  if (!isoString) return null
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function ResourceRow({ resource, progressItem, userId, isOffline }) {
  const [isRead, setIsRead] = useState(progressItem?.is_read ?? false)
  const [notes, setNotes] = useState(progressItem?.notes ?? '')
  const [notesOpen, setNotesOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saving' | 'saved' | null
  const [lastSaved, setLastSaved] = useState(progressItem?.updated_at ?? null)

  async function toggleRead() {
    const newVal = !isRead
    setIsRead(newVal)

    const { error } = await supabase.from('progress').upsert(
      {
        user_id: userId,
        resource_id: resource.id,
        is_read: newVal,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,resource_id' }
    )

    if (error) {
      setIsRead(!newVal) // revert on error
    } else {
      setLastSaved(new Date().toISOString())
    }
  }

  async function saveNotes() {
    if (notes === (progressItem?.notes ?? '')) return
    setSaveStatus('saving')

    const { error } = await supabase.from('progress').upsert(
      {
        user_id: userId,
        resource_id: resource.id,
        is_read: isRead,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,resource_id' }
    )

    if (!error) {
      const now = new Date().toISOString()
      setLastSaved(now)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    } else {
      setSaveStatus(null)
    }
  }

  return (
    <div
      className="rounded-xl p-4 transition-opacity"
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        opacity: isRead ? 0.6 : 1,
      }}
    >
      {/* Title row */}
      <div className="flex items-start gap-3 min-h-[48px]">
        <button
          onClick={toggleRead}
          className="flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isRead ? '#6366f1' : 'transparent',
            borderColor: isRead ? '#6366f1' : '#475569',
          }}
          aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {isRead && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">{resource.title}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{resource.source}</p>
        </div>

        <a
          href={isOffline ? undefined : resource.url}
          target="_blank"
          rel="noopener noreferrer"
          title={isOffline ? "You're offline — link will open when connected" : undefined}
          onClick={isOffline ? (e) => e.preventDefault() : undefined}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={{
            color: isOffline ? '#475569' : '#6366f1',
            border: `1px solid ${isOffline ? '#334155' : '#6366f1'}`,
            cursor: isOffline ? 'not-allowed' : 'pointer',
          }}
        >
          Open
        </a>
      </div>

      {/* Notes toggle */}
      <div className="mt-3 pl-8">
        <button
          onClick={() => setNotesOpen((o) => !o)}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: notesOpen ? '#6366f1' : '#64748b' }}
        >
          <svg
            className="w-3 h-3 transition-transform"
            style={{ transform: notesOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {notes ? 'Notes' : 'Add notes'}
        </button>

        {notesOpen && (
          <div className="mt-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Your notes…"
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none resize-none"
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
            />
            <div className="flex items-center gap-2 mt-1">
              {saveStatus === 'saving' && (
                <span className="text-xs" style={{ color: '#64748b' }}>Saving…</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs" style={{ color: '#4ade80' }}>Saved</span>
              )}
              {!saveStatus && lastSaved && (
                <span className="text-xs" style={{ color: '#475569' }}>
                  Last saved: {relativeTime(lastSaved)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WeekDetail({ session, progress, isOffline }) {
  const { weekNum } = useParams()
  const navigate = useNavigate()

  const week = curriculum.find((w) => w.week === Number(weekNum))

  if (!week) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
        <p style={{ color: '#64748b' }}>Week not found.</p>
      </div>
    )
  }

  const readCount = week.resources.filter((r) => progress[r.id]?.is_read).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div className="max-w-lg mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm mb-3 transition-colors"
            style={{ color: '#94a3b8' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: '#6366f1' }}>Week {week.week}</p>
              <h1 className="text-base font-bold text-white leading-tight">{week.title}</h1>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>{week.goal}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-semibold text-white">{readCount}/{week.resources.length}</p>
              <p className="text-xs" style={{ color: '#64748b' }}>read</p>
            </div>
          </div>
        </div>
      </header>

      {/* Offline banner */}
      {isOffline && (
        <div
          className="max-w-lg mx-auto mt-3 mx-4 rounded-lg px-4 py-2 text-xs text-center"
          style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', margin: '12px 16px' }}
        >
          You're offline — links will open when connected
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-5 space-y-3">
        {week.resources.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            progressItem={progress[resource.id]}
            userId={session.user.id}
            isOffline={isOffline}
          />
        ))}
      </main>
    </div>
  )
}
