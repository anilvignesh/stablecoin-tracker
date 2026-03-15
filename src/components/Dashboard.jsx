import { useNavigate } from 'react-router-dom'
import { curriculum, totalResources } from '../data/curriculum'

const STATUS_COLORS = {
  'Not Started': { bg: '#1e293b', text: '#64748b', border: '#334155' },
  'In Progress': { bg: '#1e3a5f', text: '#60a5fa', border: '#1d4ed8' },
  'Done': { bg: '#14532d', text: '#4ade80', border: '#166534' },
}

function getWeekStatus(week, progress) {
  const readCount = week.resources.filter((r) => progress[r.id]?.is_read).length
  if (readCount === 0) return 'Not Started'
  if (readCount === week.resources.length) return 'Done'
  return 'In Progress'
}

export default function Dashboard({ session, progress, onLogout }) {
  const navigate = useNavigate()

  const readCount = Object.values(progress).filter((p) => p.is_read).length

  const progressPct = totalResources > 0 ? Math.round((readCount / totalResources) * 100) : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Stablecoin Tracker</h1>
            <p className="text-xs mt-0.5 truncate max-w-48" style={{ color: '#64748b' }}>
              {session.user.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: '#94a3b8', backgroundColor: '#0f172a', border: '1px solid #334155' }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Overall progress */}
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: '#cbd5e1' }}>Overall Progress</span>
            <span className="text-sm font-semibold" style={{ color: '#6366f1' }}>
              {readCount} / {totalResources} read
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#334155' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: '#6366f1' }}
            />
          </div>
          <p className="mt-2 text-xs" style={{ color: '#64748b' }}>{progressPct}% complete</p>
        </div>

        {/* Week cards */}
        <div className="space-y-3">
          {curriculum.map((week) => {
            const weekRead = week.resources.filter((r) => progress[r.id]?.is_read).length
            const status = getWeekStatus(week, progress)
            const colors = STATUS_COLORS[status]

            return (
              <button
                key={week.week}
                onClick={() => navigate(`/week/${week.week}`)}
                className="w-full text-left rounded-xl p-4 transition-all active:scale-98"
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: '#6366f1' }}>
                        Week {week.week}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {status}
                      </span>
                    </div>
                    <h2 className="text-sm font-semibold text-white truncate">{week.title}</h2>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>
                      {week.goal}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-white">
                      {weekRead}/{week.resources.length}
                    </p>
                    <p className="text-xs" style={{ color: '#64748b' }}>read</p>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#334155' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(weekRead / week.resources.length) * 100}%`,
                      backgroundColor: status === 'Done' ? '#4ade80' : '#6366f1',
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
