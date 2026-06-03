import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Extract } from './pages/Extract'
import { Merge } from './pages/Merge'
import { Compress } from './pages/Compress'
import { Notes } from './pages/Notes'
import { Convert } from './pages/Convert'
import { Split } from './pages/Split'
import { ToastProvider } from './context/ToastContext'
import { useStore } from './store/useStore'

function AppInner() {
  const darkMode = useStore((s) => s.darkMode)
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <BrowserRouter basename="/pdf-helper">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="extract" element={<Extract />} />
          <Route path="merge" element={<Merge />} />
          <Route path="compress" element={<Compress />} />
          <Route path="notes" element={<Notes />} />
          <Route path="convert" element={<Convert />} />
          <Route path="split" element={<Split />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}
