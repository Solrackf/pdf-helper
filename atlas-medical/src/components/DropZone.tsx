import { useRef, useState } from 'react'
import { Upload, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

interface Props {
  onFiles: (files: File[]) => void
  label?: string
  sublabel?: string
}

export function DropZone({ onFiles, label = 'Arrastra documentos PDF aquí', sublabel = 'o haz clic para seleccionar' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handle = (files: FileList | null) => {
    if (!files) return
    onFiles(Array.from(files).filter((f) => f.type === 'application/pdf'))
  }

  return (
    <motion.div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files) }}
      animate={{ scale: dragging ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={clsx(
        'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors duration-200 select-none overflow-hidden',
        dragging
          ? 'border-[#1bcc61] bg-[#effef4] dark:bg-[#033017]/30'
          : 'border-slate-200 dark:border-slate-700 hover:border-[#81f4ae] hover:bg-[#effef4]/60 dark:hover:bg-[#033017]/10'
      )}
    >
      {/* Animated background blobs on drag */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            key="blob"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.12 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: '#43e583' }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={dragging ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={clsx(
          'relative flex items-center justify-center w-16 h-16 rounded-2xl transition-colors',
          dragging
            ? 'bg-[#dbfde8] dark:bg-[#033017]/60'
            : 'bg-slate-100 dark:bg-slate-800'
        )}
      >
        <AnimatePresence mode="wait">
          {dragging ? (
            <motion.div
              key="heart"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Heart size={26} className="heartbeat" style={{ color: '#1bcc61' }} fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Upload size={24} style={{ color: 'var(--text-secondary)', opacity: 0.6 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="relative z-10 text-center">
        <p style={{ color: dragging ? 'var(--cg-700)' : 'var(--text-primary)' }} className="font-semibold transition-colors">
          {dragging ? '¡Suelta para agregar! 💚' : label}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{sublabel}</p>
      </div>

      <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden" onChange={(e) => handle(e.target.files)} />
    </motion.div>
  )
}
