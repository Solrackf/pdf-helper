import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: 'var(--cg-50, #effef4)' }}>
      {/* Background orbs — light: muy tenues para no afectar contraste / dark: más intensos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb absolute w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #b8fad1, transparent)', top: '-150px', left: '5%', filter: 'blur(90px)', opacity: 0.5 }} />
        <div className="orb2 absolute w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #81f4ae, transparent)', bottom: '-100px', right: '3%', filter: 'blur(80px)', opacity: 0.35 }} />
        <div className="orb absolute w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, #dbfde8, transparent)', top: '45%', right: '18%', filter: 'blur(70px)', opacity: 0.4, animationDelay: '5s' }} />
      </div>

      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto px-8 py-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
