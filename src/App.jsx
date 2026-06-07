import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import './App.css'
import { loadQuestions, saveQuestions } from './utils/storage'
import { supabase } from './utils/supabase'
import { STATUS_CYCLE } from './utils/constants'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import QuestionTable from './components/QuestionTable'
import QuestionModal from './components/QuestionModal'
import Dashboard from './components/Dashboard'
import Toast from './components/Toast'
import Confetti from './components/Confetti'
import DailyPlan from './components/DailyPlan'
import FocusMode from './components/FocusMode'
import ShortcutsModal from './components/ShortcutsModal'
import AuthPage from './components/AuthPage'
import ProfilePage from './components/ProfilePage'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading, null = not logged in
  const [questions, setQuestions] = useState([])
  const [search, setSearch] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterSource, setFilterSource] = useState('All')
  const [filterCompany, setFilterCompany] = useState('All')
  const [filterTopic, setFilterTopic] = useState('All')
  const [filterRevision, setFilterRevision] = useState(false)
  const [sortKey, setSortKey] = useState('serial')
  const [sortDir, setSortDir] = useState('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('dsa-tab') || 'table')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [highlightId, setHighlightId] = useState(null)
  const [focusQuestion, setFocusQuestion] = useState(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Clear highlight after a few seconds
  useEffect(() => {
    if (!highlightId) return
    const timer = setTimeout(() => setHighlightId(null), 3000)
    return () => clearTimeout(timer)
  }, [highlightId])

  const prevWeeklySolved = useRef(0)

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('dsa-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [weeklyGoal, setWeeklyGoal] = useState(() => parseInt(localStorage.getItem('dsa-weekly-goal') || '7', 10))

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('dsa-theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('dsa-weekly-goal', String(weeklyGoal)) }, [weeklyGoal])
  function handleToggleTheme() { setTheme(t => t === 'light' ? 'dark' : 'light') }

  function handleSetTab(tab) { setActiveTab(tab); localStorage.setItem('dsa-tab', tab) }

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  // Load questions when logged in
  useEffect(() => {
    if (!session) return
    loadQuestions().then(data => { setQuestions(data); setLoaded(true) })
  }, [session])

  useEffect(() => { if (loaded) saveQuestions(questions) }, [questions, loaded])

  // Auto-backup every 10 minutes
  useEffect(() => {
    if (!loaded) return
    const interval = setInterval(() => {
      localStorage.setItem('dsa-backup-' + new Date().toISOString().slice(0, 10), JSON.stringify(questions))
    }, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [questions, loaded])

  // Warn before closing if data exists
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (questions.length > 0) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [questions])

  // Auto-reindex serials to fix gaps
  useEffect(() => {
    if (!loaded || questions.length === 0) return
    const needsReindex = questions.some((q, i) => q.serial !== i + 1)
    if (needsReindex) {
      setQuestions(prev => prev.map((q, i) => q.serial === i + 1 ? q : { ...q, serial: i + 1 }))
    }
  }, [questions, loaded])

  const streak = useMemo(() => {
    const solvedDates = questions.filter(q => q.status === 'Solved' && q.lastSolvedAt).map(q => new Date(q.lastSolvedAt).toDateString())
    const unique = [...new Set(solvedDates)].sort((a, b) => new Date(b) - new Date(a))
    if (!unique.length) return 0
    let count = 0
    const today = new Date(); today.setHours(0, 0, 0, 0)
    for (let i = 0; i < unique.length; i++) {
      const d = new Date(unique[i]); d.setHours(0, 0, 0, 0)
      const expected = new Date(today); expected.setDate(expected.getDate() - i)
      if (d.getTime() === expected.getTime()) count++; else break
    }
    return count
  }, [questions])

  const weeklySolved = useMemo(() => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    return questions.filter(q => q.status === 'Solved' && q.lastSolvedAt && new Date(q.lastSolvedAt) >= weekAgo).length
  }, [questions])

  // Confetti on weekly goal hit
  useEffect(() => {
    if (prevWeeklySolved.current < weeklyGoal && weeklySolved >= weeklyGoal && loaded) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    prevWeeklySolved.current = weeklySolved
  }, [weeklySolved, weeklyGoal, loaded])

  function handleAddQuestion(formData) {
    const title = formData.title.trim()
    const duplicate = questions.find(q => q.title.toLowerCase() === title.toLowerCase())
    if (duplicate && !window.confirm(`A question titled "${duplicate.title}" already exists. Add anyway?`)) return

    const newQ = {
      id: crypto.randomUUID(), serial: questions.length + 1,
      title: formData.title.trim(), description: formData.description.trim(),
      example: formData.example.trim(), link: formData.link.trim(),
      notes: formData.notes.trim(), difficulty: formData.difficulty,
      status: formData.status, source: formData.source,
      companies: formData.companies || [], topics: formData.topics || [],
      needsRevision: formData.needsRevision || false,
      timeComplexity: formData.timeComplexity?.trim() || '',
      spaceComplexity: formData.spaceComplexity?.trim() || '',
      attempts: formData.attempts || 1,
      solutionCode: formData.solutionCode?.trim() || '',
      perceivedDifficulty: formData.perceivedDifficulty?.trim() || '',
      createdAt: new Date().toISOString(),
      lastSolvedAt: formData.status === 'Solved' ? new Date().toISOString() : null,
    }
    setQuestions(prev => [...prev, newQ])
    setModalOpen(false)
  }

  function handleEditQuestion(formData) {
    const title = formData.title.trim()
    const duplicate = questions.find(q => q.id !== editingQuestion.id && q.title.toLowerCase() === title.toLowerCase())
    if (duplicate && !window.confirm(`A question titled "${duplicate.title}" already exists. Save anyway?`)) return

    setQuestions(prev => prev.map(q => {
      if (q.id !== editingQuestion.id) return q
      const wasSolved = q.status === 'Solved'
      const nowSolved = formData.status === 'Solved'
      return { ...q,
        title: formData.title.trim(), description: formData.description.trim(),
        example: formData.example.trim(), link: formData.link.trim(),
        notes: formData.notes.trim(), difficulty: formData.difficulty,
        status: formData.status, source: formData.source,
        companies: formData.companies || [], topics: formData.topics || [],
        needsRevision: formData.needsRevision || false,
        timeComplexity: formData.timeComplexity?.trim() || '',
        spaceComplexity: formData.spaceComplexity?.trim() || '',
        attempts: formData.attempts || 1,
        solutionCode: formData.solutionCode?.trim() || '',
        perceivedDifficulty: formData.perceivedDifficulty?.trim() || '',
        lastSolvedAt: (!wasSolved && nowSolved) ? new Date().toISOString() : q.lastSolvedAt,
      }
    }))
    setEditingQuestion(null); setModalOpen(false)
  }

  // Undo delete
  function handleDeleteQuestion(id) {
    const deleted = questions.find(q => q.id === id)
    if (!deleted) return
    setQuestions(prev => prev.filter(q => q.id !== id))
    setToast({ message: `Deleted "${deleted.title}"`, action: 'Undo', onAction: () => { setQuestions(prev => [...prev, deleted]); setToast(null) } })
  }

  function handleCycleStatus(id) {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q
      const newStatus = STATUS_CYCLE[q.status]
      return { ...q, status: newStatus, lastSolvedAt: newStatus === 'Solved' ? new Date().toISOString() : q.lastSolvedAt,
        attempts: newStatus === 'Solved' ? (q.attempts || 1) : q.attempts }
    }))
  }

  function handleToggleRevision(id) { setQuestions(prev => prev.map(q => q.id === id ? { ...q, needsRevision: !q.needsRevision } : q)) }
  function handleOpenEdit(question) { setEditingQuestion(question); setModalOpen(true) }
  function handleOpenAdd() { setEditingQuestion(null); setModalOpen(true) }
  function handleCloseModal() { setEditingQuestion(null); setModalOpen(false) }
  function handleSort(key) { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }

  // Selection
  function handleToggleSelect(id) {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  function handleSelectAll(ids) { setSelectedIds(new Set(ids)) }

  // Bulk actions
  function handleBulkAction(action) {
    if (action === 'delete') {
      const deleted = questions.filter(q => selectedIds.has(q.id))
      setQuestions(prev => prev.filter(q => !selectedIds.has(q.id)))
      setToast({ message: `Deleted ${deleted.length} items`, action: 'Undo', onAction: () => { setQuestions(prev => [...prev, ...deleted]); setToast(null) } })
    } else if (action === 'solve') {
      setQuestions(prev => prev.map(q => selectedIds.has(q.id) ? { ...q, status: 'Solved', lastSolvedAt: new Date().toISOString() } : q))
    } else if (action === 'revision') {
      setQuestions(prev => prev.map(q => selectedIds.has(q.id) ? { ...q, needsRevision: !q.needsRevision } : q))
    }
    setSelectedIds(new Set())
  }

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `track-dsa-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url)
  }, [questions])

  const handleImport = useCallback(() => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,.csv'
    input.onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return
      const text = await file.text()
      try {
        if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter(l => l.trim()); if (lines.length < 2) return
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
          const titleIdx = headers.indexOf('title')
          if (titleIdx === -1) { alert('CSV must have a "title" column'); return }
          const diffIdx = headers.indexOf('difficulty'), statusIdx = headers.indexOf('status'), sourceIdx = headers.indexOf('source'), linkIdx = headers.indexOf('link')
          const imported = lines.slice(1).map((line, i) => {
            const cols = line.split(',').map(c => c.trim())
            return { id: crypto.randomUUID(), serial: questions.length + i + 1, title: cols[titleIdx] || '', description: '', example: '', notes: '', link: linkIdx >= 0 ? cols[linkIdx] : '', difficulty: diffIdx >= 0 ? cols[diffIdx] : 'Easy', status: statusIdx >= 0 ? cols[statusIdx] : 'Not Started', source: sourceIdx >= 0 ? cols[sourceIdx] : 'LeetCode', companies: [], topics: [], needsRevision: false, timeComplexity: '', spaceComplexity: '', attempts: 1, solutionCode: '', perceivedDifficulty: '', createdAt: new Date().toISOString(), lastSolvedAt: null }
          }).filter(q => q.title)
          setQuestions(prev => [...prev, ...imported])
        } else {
          const data = JSON.parse(text); const arr = Array.isArray(data) ? data : []
          const imported = arr.map((q, i) => ({ ...q, id: q.id || crypto.randomUUID(), serial: questions.length + i + 1, companies: q.companies || [], topics: q.topics || [], needsRevision: q.needsRevision || false, notes: q.notes || '', timeComplexity: q.timeComplexity || '', spaceComplexity: q.spaceComplexity || '', attempts: q.attempts || 1, solutionCode: q.solutionCode || '', perceivedDifficulty: q.perceivedDifficulty || '', lastSolvedAt: q.lastSolvedAt || null }))
          setQuestions(prev => [...prev, ...imported])
        }
      } catch { alert('Invalid file format') }
    }
    input.click()
  }, [questions])

  // Share link
  const handleShare = useCallback(() => {
    const data = btoa(encodeURIComponent(JSON.stringify(questions)))
    const url = `${window.location.origin}${window.location.pathname}#shared=${data}`
    navigator.clipboard.writeText(url).then(() => setToast({ message: 'Share link copied to clipboard!' }))
  }, [questions])

  // Random pick
  function handleRandomPick() {
    const unsolved = questions.filter(q => q.status !== 'Solved')
    if (unsolved.length === 0) { setToast({ message: 'All problems solved! Add more.' }); return }
    const pick = unsolved[Math.floor(Math.random() * unsolved.length)]
    setEditingQuestion(pick); setModalOpen(true)
  }

  // Focus mode on random unsolved
  function handleFocusRandom() {
    const unsolved = questions.filter(q => q.status !== 'Solved')
    if (unsolved.length === 0) { setToast({ message: 'All problems solved!' }); return }
    setFocusQuestion(unsolved[Math.floor(Math.random() * unsolved.length)])
  }

  // Focus mode on specific question
  function handleFocusQuestion(q) { setFocusQuestion(q) }

  // Solve from focus mode (with time tracking)
  function handleFocusSolve(id, elapsedSeconds) {
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, status: 'Solved', lastSolvedAt: new Date().toISOString(), solveTimeSeconds: elapsedSeconds } : q
    ))
    setFocusQuestion(null)
    setToast({ message: 'Marked as solved!' })
  }

  // Load shared data from URL
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#shared=')) {
      try {
        const data = JSON.parse(decodeURIComponent(atob(hash.slice(8))))
        if (Array.isArray(data) && data.length > 0) {
          if (window.confirm(`Load ${data.length} shared questions?`)) {
            setQuestions(data); setLoaded(true)
          }
          window.location.hash = ''
        }
      } catch { /* ignore invalid share links */ }
    }
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); document.querySelector('.toolbar__search')?.focus() }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !modalOpen) handleOpenAdd()
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); window.print() }
      if (e.key === '?' && !modalOpen) setShowShortcuts(v => !v)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [modalOpen])

  const filtered = useMemo(() => {
    const DIFF_ORDER = { Easy: 1, Medium: 2, Hard: 3 }
    const STATUS_ORDER = { 'Not Started': 1, 'In Progress': 2, 'Solved': 3 }
    let result = questions.filter(q => {
      const s = search.toLowerCase()
      const matchSearch = q.title.toLowerCase().includes(s) || (q.notes && q.notes.toLowerCase().includes(s)) || (q.description && q.description.toLowerCase().includes(s))
      return matchSearch && (filterDifficulty === 'All' || q.difficulty === filterDifficulty) && (filterStatus === 'All' || q.status === filterStatus) && (filterSource === 'All' || q.source === filterSource) && (filterCompany === 'All' || (q.companies && q.companies.includes(filterCompany))) && (filterTopic === 'All' || (q.topics && q.topics.includes(filterTopic))) && (!filterRevision || q.needsRevision)
    })
    result = [...result].sort((a, b) => {
      let aVal, bVal
      if (sortKey === 'serial') { aVal = a.serial; bVal = b.serial }
      else if (sortKey === 'title') { aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase() }
      else if (sortKey === 'difficulty') { aVal = DIFF_ORDER[a.difficulty]; bVal = DIFF_ORDER[b.difficulty] }
      else if (sortKey === 'status') { aVal = STATUS_ORDER[a.status]; bVal = STATUS_ORDER[b.status] }
      else { aVal = a[sortKey]; bVal = b[sortKey] }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [questions, search, filterDifficulty, filterStatus, filterSource, filterCompany, filterTopic, filterRevision, sortKey, sortDir])

  // Auth loading state
  if (session === undefined) {
    return (
      <div className="app">
        <div className="skeleton-header" />
        <main className="main">
          <div className="skeleton-tabs"><div className="skeleton-pill" /><div className="skeleton-pill" /><div className="skeleton-pill" /></div>
        </main>
      </div>
    )
  }

  // Not logged in
  if (!session) return <AuthPage />

  if (!loaded) {
    return (
      <div className="app">
        <div className="skeleton-header" />
        <main className="main">
          <div className="skeleton-tabs">
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
          </div>
          <div className="skeleton-toolbar">
            <div className="skeleton-bar skeleton-bar--wide" />
            <div className="skeleton-bar" />
            <div className="skeleton-bar" />
            <div className="skeleton-bar skeleton-bar--btn" />
          </div>
          <div className="skeleton-table">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-row">
                <div className="skeleton-cell skeleton-cell--sm" />
                <div className="skeleton-cell skeleton-cell--lg" />
                <div className="skeleton-cell skeleton-cell--badge" />
                <div className="skeleton-cell skeleton-cell--badge" />
                <div className="skeleton-cell skeleton-cell--md" />
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Confetti active={showConfetti} />
      <Header questions={questions} streak={streak} weeklySolved={weeklySolved} weeklyGoal={weeklyGoal}
        userEmail={session?.user?.email}
        userName={session?.user?.user_metadata?.display_name}
        onLogout={() => supabase.auth.signOut()}
        onProfile={() => handleSetTab('profile')} />
      <main className="main">
        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'table' ? 'tab-btn--active' : ''}`} onClick={() => handleSetTab('table')}>📋 Questions</button>
          <button className={`tab-btn ${activeTab === 'plan' ? 'tab-btn--active' : ''}`} onClick={() => handleSetTab('plan')}>🎯 Today's Plan</button>
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'tab-btn--active' : ''}`} onClick={() => handleSetTab('dashboard')}>📊 Dashboard</button>
          <button className={`tab-btn ${activeTab === 'profile' ? 'tab-btn--active' : ''}`} onClick={() => handleSetTab('profile')}>👤 Profile</button>
        </div>
        {activeTab === 'table' && (
          <>
            <Toolbar search={search} onSearch={setSearch}
              filterDifficulty={filterDifficulty} onFilterDifficulty={setFilterDifficulty}
              filterStatus={filterStatus} onFilterStatus={setFilterStatus}
              filterSource={filterSource} onFilterSource={setFilterSource}
              filterCompany={filterCompany} onFilterCompany={setFilterCompany}
              filterTopic={filterTopic} onFilterTopic={setFilterTopic}
              filterRevision={filterRevision} onFilterRevision={setFilterRevision}
              questions={questions} onAdd={handleOpenAdd} onExport={handleExport} onImport={handleImport} onShare={handleShare}
              theme={theme} onToggleTheme={handleToggleTheme} onRandomPick={handleRandomPick} onFocusRandom={handleFocusRandom} />
            <QuestionTable questions={filtered} sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
              onCycleStatus={handleCycleStatus} onEdit={handleOpenEdit} onDelete={handleDeleteQuestion}
              onToggleRevision={handleToggleRevision} selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect} onSelectAll={handleSelectAll} onBulkAction={handleBulkAction}
              highlightId={highlightId} />
          </>
        )}
        {activeTab === 'plan' && (
          <DailyPlan questions={questions} onFocus={handleFocusQuestion} onEdit={handleOpenEdit} />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard questions={questions} weeklyGoal={weeklyGoal} onSetWeeklyGoal={setWeeklyGoal} weeklySolved={weeklySolved}
            onOpenQuestion={(q) => {
              setActiveTab('table')
              setHighlightId(q.id)
              setTimeout(() => {
                document.getElementById(`row-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }, 100)
            }} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage session={session} />
        )}
      </main>
      {modalOpen && (
        <QuestionModal question={editingQuestion}
          onSave={editingQuestion ? handleEditQuestion : handleAddQuestion} onClose={handleCloseModal} />
      )}
      {toast && <Toast message={toast.message} action={toast.action} onAction={toast.onAction} onClose={() => setToast(null)} />}
      {focusQuestion && <FocusMode question={focusQuestion} onClose={() => setFocusQuestion(null)} onSolve={handleFocusSolve} />}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}
