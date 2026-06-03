import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  icon: LucideIcon
  title: string
  subtitle?: string
}

export function PageHeader({ icon: Icon, title, subtitle }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-3 mb-2">
        <div
          style={{ background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 4px 12px rgba(27,204,97,0.3)' }}
          className="flex items-center justify-center w-9 h-9 rounded-2xl shrink-0"
        >
          <Icon size={17} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      </div>
      {subtitle && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
      )}
    </motion.div>
  )
}
