import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import WeekDetail from './components/WeekDetail'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({}) // { resource_id: { is_read, notes, updated_at } }
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Track online/offline
  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch progress when session is available
  useEffect(() => {
    if (!session) {
      setProgress({})
      return
    }

    async function fetchProgress() {
      const { data, error } = await supabase
        .from('progress')
        .select('resource_id, is_read, notes, updated_at')
        .eq('user_id', session.user.id)

      if (!error && data) {
        const map = {}
        for (const row of data) {
          map[row.resource_id] = row
        }
        setProgress(map)
      }
    }

    fetchProgress()
  }, [session])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0f172a' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            session={session}
            progress={progress}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/week/:weekNum"
        element={
          <WeekDetail
            session={session}
            progress={progress}
            isOffline={isOffline}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
