import { NavLink } from 'react-router-dom'
import { Home, Scissors, Layers, Moon, Sun, Heart, Minimize2, ImageDown, ScissorsLineDashed, StickyNote } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useStore } from '../store/useStore'

const nav = [
  { to: '/', icon: Home, label: 'Inicio', group: null },
  { to: '/extract', icon: Scissors, label: 'Extraer páginas', group: 'PDF' },
  { to: '/merge', icon: Layers, label: 'Unir documentos', group: 'PDF' },
  { to: '/split', icon: ScissorsLineDashed, label: 'Dividir PDF', group: 'PDF' },
  { to: '/compress', icon: Minimize2, label: 'Comprimir PDF', group: 'PDF' },
  { to: '/convert', icon: ImageDown, label: 'PDF a imágenes', group: 'PDF' },
  { to: '/notes', icon: StickyNote, label: 'Notas', group: 'Útiles' },
]

export function Sidebar() {
  const { darkMode, toggleDark } = useStore()

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 top-0 h-screen w-64 flex flex-col glass-sidebar z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid rgba(129,244,174,0.25)' }}>
        <motion.div
          whileHover={{ scale: 1.12, rotate: 8 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{ background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 4px 14px rgba(27,204,97,0.35)' }}
          className="flex items-center justify-center w-10 h-10 rounded-2xl pulse-glow"
        >
          <Heart size={18} className="text-white heartbeat" fill="white" />
        </motion.div>
        <div>
          <p className="font-bold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>Atlas</p>
          <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--cg-500)' }}>Medical Toolkit</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, group }, i) => {
          const prevGroup = i > 0 ? nav[i - 1].group : undefined
          const showSeparator = group !== null && group !== prevGroup
          return (
            <div key={to}>
              {showSeparator && (
                <p className="text-[10px] font-bold uppercase tracking-widest px-3 pt-3 pb-1"
                  style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                  {group}
                </p>
              )}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.3 }}
              >
                <NavLink
                  to={to}
                  end={to === '/'}
                  style={({ isActive }) => isActive
                    ? { background: 'rgba(27,204,97,0.12)', color: 'var(--cg-950)' }
                    : { color: 'var(--text-secondary)' }
                  }
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group mb-0.5',
                      isActive ? 'shadow-sm font-semibold' : 'hover:opacity-100 opacity-75'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <motion.div whileHover={{ scale: 1.2, rotate: -5 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                        <Icon size={16} style={{ color: isActive ? 'var(--cg-600)' : 'var(--text-secondary)' }} className="transition-colors" />
                      </motion.div>
                      {label}
                      {isActive && (
                        <motion.div layoutId="nav-indicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--cg-500)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            </div>
          )
        })}
      </nav>

      {/* Dark mode toggle */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(129,244,174,0.25)' }}>
        <motion.button
          onClick={toggleDark}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors opacity-75 hover:opacity-100" style={{ color: 'var(--text-secondary)' }}
        >
          <motion.div
            key={darkMode ? 'sun' : 'moon'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </motion.div>
          {darkMode ? 'Modo claro' : 'Modo oscuro'}
        </motion.button>
      </div>
    </motion.aside>
  )
}
