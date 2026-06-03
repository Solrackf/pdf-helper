import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'

const HEARTS = [
  { left: '8%',  bottom: '12%', dur: 5.2, delay: 0,    size: 14, opacity: 0.18 },
  { left: '22%', bottom: '5%',  dur: 6.8, delay: 1.4,  size: 11, opacity: 0.14 },
  { left: '38%', bottom: '18%', dur: 4.9, delay: 2.7,  size: 16, opacity: 0.20 },
  { left: '55%', bottom: '8%',  dur: 7.1, delay: 0.8,  size: 12, opacity: 0.15 },
  { left: '70%', bottom: '15%', dur: 5.6, delay: 3.2,  size: 18, opacity: 0.16 },
  { left: '85%', bottom: '6%',  dur: 6.2, delay: 1.9,  size: 13, opacity: 0.18 },
  { left: '92%', bottom: '22%', dur: 4.4, delay: 4.1,  size: 10, opacity: 0.12 },
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* ── Background orbs (intensidad controlada por --orb-opacity) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb absolute w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, #43e583, transparent)', top: '-180px', left: '3%', filter: 'blur(100px)', opacity: 'var(--orb-opacity)' }} />
        <div className="orb2 absolute w-[550px] h-[550px] rounded-full"
          style={{ background: 'radial-gradient(circle, #1bcc61, transparent)', bottom: '-120px', right: '2%', filter: 'blur(90px)', opacity: 'var(--orb-opacity)' }} />
        <div className="orb absolute w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #81f4ae, transparent)', top: '40%', right: '15%', filter: 'blur(80px)', opacity: 'calc(var(--orb-opacity) * 0.7)', animationDelay: '5s' }} />
      </div>

      {/* ── Global floating hearts — hecho para ella 💚 ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {HEARTS.map((h, i) => (
          <div key={i} className="heart-rise absolute select-none text-[--cg-400]"
            style={{
              left: h.left, bottom: h.bottom,
              fontSize: h.size,
              opacity: h.opacity,
              '--dur': `${h.dur}s`,
              '--delay': `${h.delay}s`,
            } as React.CSSProperties}>
            💚
          </div>
        ))}
      </div>

      <Sidebar />

      <main className="flex-1 md:ml-64 min-h-screen relative z-10 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
