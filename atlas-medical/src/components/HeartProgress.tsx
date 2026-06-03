import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  progress: number      // 0–100
  label?: string
  sublabel?: string
  showHeart?: boolean
}

export function HeartProgress({ progress, label = 'Procesando...', sublabel, showHeart = true }: Props) {
  const done = progress >= 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.span key="done"
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="text-base">💚</motion.span>
            ) : showHeart ? (
              <motion.span key="beat"
                animate={{ scale: [1, 1.4, 1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.4 }}
                className="text-sm">🩷</motion.span>
            ) : null}
          </AnimatePresence>
          <span>{done ? '¡Listo! 💚' : label}</span>
        </div>
        <motion.span
          key={progress}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold tabular-nums"
          style={{ color: 'var(--cg-500)' }}>
          {progress}%
        </motion.span>
      </div>

      {/* Track */}
      <div className="relative w-full h-3 rounded-full overflow-hidden"
        style={{ background: 'rgba(27,204,97,0.12)', border: '1px solid rgba(27,204,97,0.2)' }}>

        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 progress-bar"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ minWidth: progress > 0 ? 12 : 0 }}
        />

        {/* Travelling heart */}
        {!done && progress > 0 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-[10px] select-none pointer-events-none"
            animate={{ left: `calc(${progress}% - 8px)` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
            💚
          </motion.div>
        )}

        {/* Completion burst */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-1 text-[9px]">
              💚💚💚
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {sublabel && (
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{sublabel}</p>
      )}
    </div>
  )
}
