import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Scissors, Layers, Moon, Sun, Heart, Minimize2, ImageDown, ScissorsLineDashed, StickyNote, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

/* ── shared nav item ── */
function NavItem({ to, icon: Icon, label, collapsed, onClick }: {
  to: string; icon: typeof Home; label: string; collapsed?: boolean; onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      style={({ isActive }) => isActive
        ? { background: 'rgba(27,204,97,0.14)', color: 'var(--text-primary)' }
        : { color: 'var(--text-secondary)' }
      }
      className={({ isActive }) => clsx(
        'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5',
        collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
        isActive ? 'font-semibold shadow-sm' : 'opacity-75 hover:opacity-100'
      )}
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon size={16} style={{ color: isActive ? 'var(--cg-600)' : 'var(--text-secondary)' }} className="shrink-0 transition-colors" />
          {!collapsed && <span className="truncate">{label}</span>}
          {!collapsed && isActive && (
            <motion.div layoutId="nav-pill"
              className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--cg-500)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  )
}

/* ── Desktop sidebar (≥ 1024px full, 768-1024 icon-only) ── */
function DesktopSidebar({ collapsed, darkMode, toggleDark }: {
  collapsed: boolean; darkMode: boolean; toggleDark: () => void
}) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={clsx('fixed left-0 top-0 h-screen flex flex-col glass-sidebar z-40 transition-all duration-300', collapsed ? 'w-16' : 'w-64')}
    >
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 py-5', collapsed ? 'justify-center px-2' : 'px-5')}
        style={{ borderBottom: '1px solid rgba(129,244,174,0.22)' }}>
        <motion.div whileHover={{ scale: 1.1, rotate: 8 }} whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{ background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 4px 14px rgba(27,204,97,0.35)' }}
          className="flex items-center justify-center w-9 h-9 rounded-2xl pulse-glow shrink-0">
          <Heart size={16} className="text-white heartbeat" fill="white" />
        </motion.div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>Atlas</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--cg-500)' }}>Medical Toolkit</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={clsx('flex-1 py-3 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
        {nav.map(({ to, icon, label, group }, i) => {
          const prevGroup = i > 0 ? nav[i - 1].group : undefined
          const showSep = !collapsed && group !== null && group !== prevGroup
          return (
            <div key={to}>
              {showSep && (
                <p className="text-[10px] font-bold uppercase tracking-widest px-3 pt-3 pb-1"
                  style={{ color: 'var(--text-secondary)', opacity: 0.45 }}>{group}</p>
              )}
              {collapsed && group !== null && group !== prevGroup && (
                <div className="my-2 mx-2" style={{ borderTop: '1px solid rgba(129,244,174,0.2)' }} />
              )}
              <NavItem to={to} icon={icon} label={label} collapsed={collapsed} />
            </div>
          )
        })}
      </nav>

      {/* Dark toggle */}
      <div className={clsx('py-3', collapsed ? 'px-2' : 'px-3')} style={{ borderTop: '1px solid rgba(129,244,174,0.22)' }}>
        <motion.button onClick={toggleDark} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className={clsx('flex items-center gap-3 w-full rounded-xl text-sm font-medium transition-colors opacity-75 hover:opacity-100',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5')}
          style={{ color: 'var(--text-secondary)' }}
          title={collapsed ? (darkMode ? 'Modo claro' : 'Modo oscuro') : undefined}>
          <motion.div key={darkMode ? 'sun' : 'moon'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </motion.div>
          {!collapsed && (darkMode ? 'Modo claro' : 'Modo oscuro')}
        </motion.button>
      </div>
    </motion.aside>
  )
}

/* ── Mobile bottom bar + drawer ── */
function MobileNav({ darkMode, toggleDark }: { darkMode: boolean; toggleDark: () => void }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const bottomItems = nav.slice(0, 4)

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-1 safe-bottom"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => clsx('flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0', isActive ? 'opacity-100' : 'opacity-55')}
            style={({ isActive }) => ({ color: isActive ? 'var(--cg-600)' : 'var(--text-secondary)' })}>
            {({ isActive }) => (
              <>
                <Icon size={20} style={{ color: isActive ? 'var(--cg-500)' : 'var(--text-secondary)' }} />
                <span className="text-[10px] font-medium truncate max-w-[56px]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        {/* More button */}
        <button onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all opacity-55"
          style={{ color: 'var(--text-secondary)' }}>
          <Menu size={20} />
          <span className="text-[10px] font-medium">Más</span>
        </button>
      </nav>

      {/* Drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl pb-safe"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
              </div>

              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ background: 'linear-gradient(135deg,#43e583,#0fa34a)', boxShadow: '0 3px 10px rgba(27,204,97,0.35)' }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center">
                    <Heart size={14} className="text-white" fill="white" />
                  </div>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Atlas Medical Toolkit</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="px-4 py-3 grid grid-cols-2 gap-2 max-h-[65vh] overflow-y-auto">
                {nav.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} end={to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                      isActive ? 'font-semibold' : 'opacity-75'
                    )}
                    style={({ isActive }) => ({
                      background: isActive ? 'rgba(27,204,97,0.14)' : 'var(--surface-muted)',
                      border: `1px solid ${isActive ? 'rgba(27,204,97,0.3)' : 'var(--border)'}`,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    })}>
                    {({ isActive }) => (
                      <>
                        <Icon size={16} style={{ color: isActive ? 'var(--cg-600)' : 'var(--text-secondary)' }} />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={() => { toggleDark(); setOpen(false) }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium"
                  style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  {darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Main export ── */
export function Sidebar() {
  const { darkMode, toggleDark } = useStore()
  return (
    <>
      {/* Desktop: show sidebar (full on lg+, icon-only on md) */}
      <div className="hidden md:block">
        <DesktopSidebar collapsed={false} darkMode={darkMode} toggleDark={toggleDark} />
      </div>
      {/* Mobile: bottom nav + drawer */}
      <div className="md:hidden">
        <MobileNav darkMode={darkMode} toggleDark={toggleDark} />
      </div>
    </>
  )
}
