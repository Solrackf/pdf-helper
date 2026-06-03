import { useState, useEffect, useRef } from 'react'
import { StickyNote, Plus, Trash2, Search, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

interface Note {
  id: string
  title: string
  body: string
  tag: string
  color: string
  createdAt: number
  updatedAt: number
}

const COLORS = [
  { id: 'green',  bg: 'rgba(27,204,97,0.12)',  border: 'rgba(27,204,97,0.35)',  dot: '#1bcc61' },
  { id: 'teal',   bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.35)', dot: '#14b8a6' },
  { id: 'blue',   bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', dot: '#3b82f6' },
  { id: 'purple', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', dot: '#a855f7' },
  { id: 'rose',   bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.35)',  dot: '#f43f5e' },
  { id: 'amber',  bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', dot: '#f59e0b' },
]

const TAGS = ['General', 'Anatomía', 'Farmacología', 'Clínica', 'Examen', 'Tarea']

const STORAGE_KEY = 'atlas-notes'

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}
function newId() { return Math.random().toString(36).slice(2, 10) }
function colorById(id: string) { return COLORS.find(c => c.id === id) ?? COLORS[0] }

export function Notes() {
  const [notes, setNotes]         = useState<Note[]>(loadNotes)
  const [activeId, setActiveId]   = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const bodyRef                   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { saveNotes(notes) }, [notes])

  const active = notes.find(n => n.id === activeId) ?? null

  const filtered = notes.filter(n => {
    const q = search.toLowerCase()
    const matchQ = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    const matchT = !filterTag || n.tag === filterTag
    return matchQ && matchT
  }).sort((a, b) => b.updatedAt - a.updatedAt)

  function createNote() {
    const note: Note = {
      id: newId(), title: 'Nueva nota', body: '',
      tag: 'General', color: 'green',
      createdAt: Date.now(), updatedAt: Date.now(),
    }
    setNotes(prev => [note, ...prev])
    setActiveId(note.id)
    setTimeout(() => bodyRef.current?.focus(), 100)
  }

  function updateNote(patch: Partial<Note>) {
    if (!activeId) return
    setNotes(prev => prev.map(n =>
      n.id === activeId ? { ...n, ...patch, updatedAt: Date.now() } : n
    ))
  }

  function deleteNote(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (activeId === id) setActiveId(null)
  }

  function fmt(ts: number) {
    return new Date(ts).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 4px 12px rgba(27,204,97,0.3)' }}
              className="flex items-center justify-center w-9 h-9 rounded-2xl">
              <StickyNote size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notas</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{notes.length} nota{notes.length !== 1 ? 's' : ''} guardada{notes.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <motion.button
            onClick={createNote}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 4px 14px rgba(27,204,97,0.35)' }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          >
            <Plus size={15} /> Nueva nota
          </motion.button>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-5 md:h-[calc(100vh-220px)] min-h-[400px]">
        {/* ── Lista ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="w-full md:w-72 shrink-0 flex flex-col gap-3"
        >
          {/* Búsqueda */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar notas..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Tags filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterTag(null)}
              className={clsx('text-xs px-2.5 py-1 rounded-full transition-all font-medium border',
                !filterTag ? 'text-white border-[#1bcc61]' : 'border-transparent')}
              style={!filterTag ? { background: 'linear-gradient(135deg,#43e583,#0fa34a)' } : { color: 'var(--text-secondary)', background: 'var(--surface)' }}
            >Todas</button>
            {TAGS.map(tag => (
              <button key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={clsx('text-xs px-2.5 py-1 rounded-full transition-all font-medium border',
                  filterTag === tag ? 'text-white border-[#1bcc61]' : 'border-transparent')}
                style={filterTag === tag ? { background: 'linear-gradient(135deg,#43e583,#0fa34a)' } : { color: 'var(--text-secondary)', background: 'var(--surface)' }}
              >{tag}</button>
            ))}
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-64 md:max-h-none">
            <AnimatePresence>
              {filtered.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {notes.length === 0 ? 'Crea tu primera nota 📝' : 'Sin resultados'}
                </motion.div>
              )}
              {filtered.map((note, i) => {
                const col = colorById(note.color)
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveId(note.id)}
                    className="relative p-3 rounded-xl cursor-pointer transition-all group"
                    style={{
                      background: activeId === note.id ? col.bg : 'var(--surface)',
                      border: `1px solid ${activeId === note.id ? col.border : 'var(--border)'}`,
                      boxShadow: activeId === note.id ? `0 4px 16px ${col.border}` : 'none',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col.dot }} />
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{note.title}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:text-red-500 transition-all shrink-0"
                        style={{ color: 'var(--text-secondary)' }}
                      ><Trash2 size={12} /></button>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2 pl-4" style={{ color: 'var(--text-secondary)' }}>
                      {note.body || 'Sin contenido'}
                    </p>
                    <div className="flex items-center justify-between mt-2 pl-4">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background: col.bg, color: col.dot, border: `1px solid ${col.border}` }}>
                        {note.tag}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                        {fmt(note.updatedAt)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Editor ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="flex-1 rounded-2xl glass-card flex flex-col overflow-hidden"
        >
          {active ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <input
                  value={active.title}
                  onChange={e => updateNote({ title: e.target.value })}
                  className="flex-1 font-bold text-lg bg-transparent focus:outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Título..."
                />
                {/* Tag */}
                <div className="relative group">
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    style={{ background: 'var(--surface-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    <Tag size={11} /> {active.tag}
                  </button>
                  <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col gap-0.5 rounded-xl p-1.5 z-20 min-w-[130px]"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    {TAGS.map(t => (
                      <button key={t} onClick={() => updateNote({ tag: t })}
                        className="text-xs px-3 py-1.5 rounded-lg text-left hover:opacity-80 font-medium transition-colors"
                        style={{ color: active.tag === t ? 'var(--cg-500)' : 'var(--text-secondary)', background: active.tag === t ? 'rgba(27,204,97,0.1)' : 'transparent' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Color */}
                <div className="flex items-center gap-1.5">
                  {COLORS.map(c => (
                    <button key={c.id} onClick={() => updateNote({ color: c.id })}
                      className="w-4 h-4 rounded-full transition-all"
                      style={{ background: c.dot, boxShadow: active.color === c.id ? `0 0 0 2px white, 0 0 0 3px ${c.dot}` : 'none', transform: active.color === c.id ? 'scale(1.25)' : 'scale(1)' }}
                    />
                  ))}
                </div>
                <button onClick={() => deleteNote(active.id)}
                  className="p-1.5 rounded-lg hover:text-red-500 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Body */}
              <textarea
                ref={bodyRef}
                value={active.body}
                onChange={e => updateNote({ body: e.target.value })}
                placeholder="Escribe aquí tus apuntes, conceptos, resúmenes..."
                className="flex-1 resize-none p-5 bg-transparent focus:outline-none text-sm leading-relaxed"
                style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />

              {/* Footer */}
              <div className="px-5 py-2 text-[11px] flex justify-between" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', opacity: 0.6 }}>
                <span>{active.body.split(/\s+/).filter(Boolean).length} palabras · {active.body.length} caracteres</span>
                <span>Guardado {fmt(active.updatedAt)}</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <StickyNote size={48} style={{ color: 'var(--cg-300)' }} />
              </motion.div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Selecciona una nota o crea una nueva</p>
              <motion.button
                onClick={createNote}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ background: 'linear-gradient(135deg,#43e583,#0fa34a)', boxShadow: '0 4px 14px rgba(27,204,97,0.3)' }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
              >
                <Plus size={14} /> Nueva nota
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
