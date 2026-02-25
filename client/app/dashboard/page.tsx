'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────
interface Task {
  _id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
}

interface TasksResponse {
  success: boolean
  data: Task[]
  total: number
  page: number
  totalPages: number
  count: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

type ModalMode = 'create' | 'edit' | null

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)', dot: '●' },
  'in-progress': { label: 'In Progress', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)', dot: '◉' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', dot: '✓' },
}

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ─── Task Modal ───────────────────────────────────────────────
function TaskModal({
  mode, task, onClose, onSave
}: {
  mode: ModalMode
  task: Task | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending' as Task['status'],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true)
    try {
      let data
      if (mode === 'create') {
        data = await api.post('/tasks', form)
      } else {
        data = await api.put(`/tasks/${task!._id}`, form)
      }
      if (data.success) {
        onSave()
        onClose()
      } else {
        setError(data.message || 'Failed to save task')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              {mode === 'create' ? 'New Task' : 'Edit Task'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Space Mono, monospace', marginTop: '2px' }}>
              {mode === 'create' ? '// add to your workspace' : '// modify task details'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >✕</button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              maxLength={100}
              autoFocus
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              placeholder="Add more details... (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={500}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', textAlign: 'right', fontFamily: 'Space Mono, monospace' }}>
              {form.description.length}/500
            </p>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as Task['status'] })}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading
                ? <><span className="spinner" /> Saving...</>
                : mode === 'create' ? 'Create Task' : 'Save Changes'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────
function DeleteModal({ task, onClose, onDelete }: {
  task: Task
  onClose: () => void
  onDelete: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/tasks/${task._id}`)
      onDelete()
      onClose()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'var(--danger-dim)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '22px',
          }}>⚠</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Delete Task</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{task.title}&rdquo;</strong>? This action cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
            {loading ? <><span className="spinner" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete }: {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
}) {
  const s = STATUS_CONFIG[task.status]
  return (
    <div className="card" style={{
      padding: '20px',
      transition: 'border-color 0.2s, transform 0.15s',
      cursor: 'default',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{task.title}</h3>
          {task.description && (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>{task.description}</p>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'Space Mono, monospace',
            background: s.bg,
            color: s.color,
            border: `1px solid ${s.border}`,
          }}>
            {s.dot} {s.label}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'Space Mono, monospace' }}>
            {formatDate(task.createdAt)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            ✎ Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(task)}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ hasFilters, onCreate }: { hasFilters: boolean, onCreate: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 20px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px', height: '64px',
        background: 'var(--bg-hover)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '26px',
        marginBottom: '20px',
      }}>
        {hasFilters ? '🔍' : '📋'}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
        {hasFilters ? 'No tasks found' : 'No tasks yet'}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', maxWidth: '280px' }}>
        {hasFilters
          ? 'Try adjusting your filters or search query'
          : 'Create your first task to get started with TaskFlow'
        }
      </p>
      {!hasFilters && (
        <button className="btn btn-primary" onClick={onCreate}>
          + New Task
        </button>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [toast, setToast] = useState('')
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedSearch = useDebounce(search, 400)
  const LIMIT = 9

  // ── Load user (auth check) ────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem('tf_user')
    if (stored) {
      setUser(JSON.parse(stored))
      return
    }
    // Verify by hitting a protected endpoint
    api.get('/tasks?limit=1').then(data => {
      if (!data.success) router.push('/login')
    }).catch(() => router.push('/login'))
  }, [router])

  // ── Fetch tasks ───────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
      })
      const data: TasksResponse = await api.get(`/tasks?${params}`)
      if (!data.success) {
        router.push('/login')
        return
      }
      setTasks(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, statusFilter, router])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter])

  // ── Toast helper ──────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToast(''), 3000)
  }

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = async () => {
    await api.post('/auth/logout', {})
    sessionStorage.removeItem('tf_user')
    router.push('/login')
  }

  // ── Handlers ──────────────────────────────────────────────
  const handleCreate = () => { setEditTask(null); setModalMode('create') }
  const handleEdit = (t: Task) => { setEditTask(t); setModalMode('edit') }
  const handleSaved = () => { fetchTasks(); showToast(modalMode === 'create' ? '✓ Task created' : '✓ Task updated') }
  const handleDeleted = () => { fetchTasks(); showToast('✓ Task deleted') }

  const hasFilters = !!debouncedSearch || !!statusFilter

  // ── Stats ─────────────────────────────────────────────────
  const stats = {
    total: total,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--success)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius)',
          fontFamily: 'Space Mono, monospace',
          fontSize: '13px',
          fontWeight: 700,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
          animation: 'slideUp 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      {/* Navbar */}
      <header style={{
        background: 'rgba(13,13,15,0.9)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px',
              background: 'var(--accent)',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700,
              fontSize: '14px',
              color: '#0d0d0f',
            }}>T</div>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>TaskFlow</span>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}>
                <div style={{
                  width: '22px', height: '22px',
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</span>
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>

        {/* Page header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Space Mono, monospace', marginBottom: '4px' }}>
              // your workspace
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Task Dashboard
            </h1>
          </div>
          <button className="btn btn-primary" onClick={handleCreate} style={{ fontSize: '14px' }}>
            + New Task
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'Total Tasks', value: total, color: 'var(--text-primary)' },
            { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' },
            { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#818cf8' },
            { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '16px 20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '26px', fontWeight: 800, color: stat.color, fontFamily: 'Space Mono, monospace', lineHeight: 1 }}>
                {loading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              pointerEvents: 'none',
            }}>⌕</span>
            <input
              className="input"
              type="text"
              placeholder="Search tasks by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
          </div>

          {/* Status filter */}
          <select
            className="input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(''); setStatusFilter('') }}
            >
              ✕ Clear
            </button>
          )}

          {/* Result count */}
          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Space Mono, monospace', marginLeft: 'auto' }}>
            {loading ? '...' : `${total} task${total !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Task grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: '20px', height: '120px', opacity: 0.4 }}>
                <div style={{ background: 'var(--bg-hover)', height: '14px', borderRadius: '4px', marginBottom: '10px', width: '60%', animation: 'pulse 1.5s infinite' }} />
                <div style={{ background: 'var(--bg-hover)', height: '10px', borderRadius: '4px', marginBottom: '8px', width: '90%', animation: 'pulse 1.5s infinite' }} />
                <div style={{ background: 'var(--bg-hover)', height: '10px', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s infinite' }} />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onCreate={handleCreate} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={setDeleteTask}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '40px',
          }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | string)[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) => (
                typeof p === 'string' ? (
                  <span key={`dot-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={p === page ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                    onClick={() => setPage(p)}
                    style={{ minWidth: '36px', justifyContent: 'center' }}
                  >
                    {p}
                  </button>
                )
              ))}

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}

        {/* Page info */}
        {totalPages > 1 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'Space Mono, monospace', marginTop: '12px' }}>
            Page {page} of {totalPages} · {total} total tasks
          </p>
        )}
      </main>

      {/* Modals */}
      {modalMode && (
        <TaskModal
          mode={modalMode}
          task={editTask}
          onClose={() => { setModalMode(null); setEditTask(null) }}
          onSave={handleSaved}
        />
      )}
      {deleteTask && (
        <DeleteModal
          task={deleteTask}
          onClose={() => setDeleteTask(null)}
          onDelete={handleDeleted}
        />
      )}
    </div>
  )
}