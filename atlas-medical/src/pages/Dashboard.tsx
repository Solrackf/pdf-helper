import { useNavigate } from 'react-router-dom'
import { Scissors, Layers, Shield, Minimize2, ImageDown, ScissorsLineDashed, StickyNote } from 'lucide-react'
import { motion } from 'framer-motion'

const actions = [
  {
    to: '/extract',
    icon: Scissors,
    title: 'Extraer páginas',
    description: 'Selecciona visualmente las páginas que necesitas y descárgalas al instante.',
    gradientStyle: 'linear-gradient(135deg, #43e583, #1bcc61)',
    glowStyle: '0 8px 24px rgba(27,204,97,0.25)',
    iconBg: 'linear-gradient(135deg, #43e583, #0fa34a)',
    heart: '💚',
  },
  {
    to: '/merge',
    icon: Layers,
    title: 'Unir documentos',
    description: 'Combina múltiples PDFs en un único expediente médico consolidado.',
    gradientStyle: 'linear-gradient(135deg, #81f4ae, #1bcc61)',
    glowStyle: '0 8px 24px rgba(27,204,97,0.2)',
    iconBg: 'linear-gradient(135deg, #1bcc61, #10853f)',
    heart: '🩵',
  },
  {
    to: '/compress',
    icon: Minimize2,
    title: 'Comprimir PDF',
    description: 'Reduce el tamaño de tus archivos manteniendo la calidad del documento.',
    gradientStyle: 'linear-gradient(135deg, #b8fad1, #0fa34a)',
    glowStyle: '0 8px 24px rgba(16,133,63,0.2)',
    iconBg: 'linear-gradient(135deg, #1bcc61, #126936)',
    heart: '💚',
  },
  {
    to: '/split',
    icon: ScissorsLineDashed,
    title: 'Dividir PDF',
    description: 'Parte un PDF en secciones definiendo rangos de páginas personalizados.',
    gradientStyle: 'linear-gradient(135deg, #43e583, #0fa34a)',
    glowStyle: '0 8px 24px rgba(27,204,97,0.2)',
    iconBg: 'linear-gradient(135deg, #43e583, #10853f)',
    heart: '✂️',
  },
  {
    to: '/convert',
    icon: ImageDown,
    title: 'PDF a imágenes',
    description: 'Convierte cada página del PDF en una imagen PNG o JPG de alta resolución.',
    gradientStyle: 'linear-gradient(135deg, #81f4ae, #1bcc61)',
    glowStyle: '0 8px 24px rgba(27,204,97,0.18)',
    iconBg: 'linear-gradient(135deg, #1bcc61, #126936)',
    heart: '🖼️',
  },
  {
    to: '/notes',
    icon: StickyNote,
    title: 'Notas',
    description: 'Bloc de apuntes con etiquetas y colores. Todo guardado en tu dispositivo.',
    gradientStyle: 'linear-gradient(135deg, #b8fad1, #43e583)',
    glowStyle: '0 8px 24px rgba(27,204,97,0.15)',
    iconBg: 'linear-gradient(135deg, #43e583, #0fa34a)',
    heart: '📝',
  },
]

const tips = [
  { text: 'Todos tus documentos se procesan localmente — nunca salen de tu dispositivo.', emoji: '🔒' },
  { text: 'Las notas se guardan en tu navegador y persisten entre sesiones.', emoji: '📝' },
  { text: 'Convierte PDFs a imágenes para usarlas en presentaciones o diapositivas.', emoji: '�️' },
]

const floatingHearts = [
  { x: '10%', delay: 0,   size: 18, duration: 3.2 },
  { x: '80%', delay: 0.8, size: 14, duration: 4.0 },
  { x: '55%', delay: 1.5, size: 20, duration: 3.6 },
  { x: '30%', delay: 2.1, size: 12, duration: 4.4 },
  { x: '92%', delay: 0.4, size: 16, duration: 3.8 },
]

export function Dashboard() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-8">

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: 'linear-gradient(135deg, #43e583, #1bcc61, #0fa34a)', boxShadow: '0 20px 48px rgba(27,204,97,0.35)' }}
        className="relative overflow-hidden rounded-3xl p-8 gradient-animated"
      >
        {/* Floating hearts */}
        {floatingHearts.map((h, i) => (
          <motion.span
            key={i}
            className="absolute top-4 select-none pointer-events-none"
            style={{ left: h.x, fontSize: h.size }}
            animate={{ y: [0, -22, 0], rotate: [-8, 8, -8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            🤍
          </motion.span>
        ))}

        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-white/80 text-sm font-medium mb-1"
          >
            {greeting} 👋
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            ¿Qué deseas hacer hoy?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-white/70 mt-2 text-sm"
          >
            Atlas Medical Toolkit · Procesamiento 100% local ❤️
          </motion.p>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </motion.div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map(({ to, icon: Icon, title, description, gradientStyle, glowStyle, iconBg, heart }, i) => (
          <motion.button
            key={to}
            onClick={() => navigate(to)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.45 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            style={{ boxShadow: glowStyle }}
            className="relative overflow-hidden flex flex-col gap-5 p-6 rounded-2xl text-left glass-card transition-all"
          >
            {/* Heart decoration */}
            <motion.span
              className="absolute top-3 right-4 text-2xl opacity-20 select-none"
              animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {heart}
            </motion.span>

            <div style={{ background: iconBg }} className="flex items-center justify-center w-12 h-12 rounded-2xl shadow-md">
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</p>
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            </div>

            {/* Bottom gradient line */}
            <div style={{ background: gradientStyle }} className="absolute bottom-0 left-0 right-0 h-0.5 opacity-70" />
          </motion.button>
        ))}
      </div>

      {/* Privacy card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="rounded-2xl glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield size={15} style={{ color: 'var(--cg-500)' }} />
          </motion.div>
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Privacidad & Datos
          </h2>
        </div>
        <ul className="space-y-3">
          {tips.map(({ text, emoji }, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.08, duration: 0.3 }}
              style={{ color: 'var(--text-secondary)' }}
              className="flex items-start gap-3 text-sm"
            >
              <span className="shrink-0 mt-0.5">{emoji}</span>
              {text}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
