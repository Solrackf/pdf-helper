import { NavLink } from 'react-router-dom'
import { Home, Scissors, Layers, Moon, Sun, Heart, Minimize2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useStore } from '../store/useStore'

const nav = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/extract', icon: Scissors, label: 'Extraer páginas' },
  { to: '/merge', icon: Layers, label: 'Unir documentos' },
  { to: '/compress', icon: Minimize2, label: 'Comprimir PDF' },
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
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }, i) => (
          <motion.div
            key={to}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'shadow-sm font-semibold'
                    : 'hover:opacity-100 opacity-80'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -5 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <Icon
                      size={17}
                      style={{ color: isActive ? 'var(--cg-600)' : 'var(--text-secondary)' }}
                      className="transition-colors"
                    />
                  </motion.div>
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--cg-500)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
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
