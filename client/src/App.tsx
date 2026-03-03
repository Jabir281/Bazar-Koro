import { useEffect, useState } from 'react'

function App() {
  const [health, setHealth] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/health')
        const data = await res.json()
        if (!cancelled) setHealth(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Bazar Koro</h1>
        <p className="mt-1 text-sm text-slate-600">
          Client is up. Checking backend API…
        </p>

        {error ? (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Backend error: {error}
          </div>
        ) : (
          <pre className="mt-4 overflow-auto rounded border bg-slate-50 p-4 text-sm">
            {health ? JSON.stringify(health, null, 2) : 'Loading…'}
          </pre>
        )}
      </div>
    </div>
  )
}

export default App
