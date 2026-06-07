import { useMemo, useState, useRef, useEffect } from 'react'
import './Toolbar.css'
import { DIFFICULTIES, STATUSES, SOURCES } from '../utils/constants'
import Dropdown from './Dropdown'

export default function Toolbar({
  search, onSearch,
  filterDifficulty, onFilterDifficulty,
  filterStatus, onFilterStatus,
  filterSource, onFilterSource,
  filterCompany, onFilterCompany,
  filterTopic, onFilterTopic,
  filterRevision, onFilterRevision,
  questions,
  onAdd, onExport, onImport, onShare, theme, onToggleTheme, onRandomPick, onFocusRandom,
}) {
  const [showMore, setShowMore] = useState(false)
  const moreRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const allCompanies = useMemo(() => {
    const set = new Set()
    questions.forEach(q => { if (q.companies) q.companies.forEach(c => set.add(c)) })
    return [...set].sort()
  }, [questions])

  const allTopics = useMemo(() => {
    const set = new Set()
    questions.forEach(q => { if (q.topics) q.topics.forEach(t => set.add(t)) })
    return [...set].sort()
  }, [questions])

  const activeFilterCount = [filterDifficulty, filterStatus, filterSource, filterCompany, filterTopic]
    .filter(v => v !== 'All').length + (filterRevision ? 1 : 0)

  const difficultyOptions = [{ value: 'All', label: 'All Difficulties' }, ...DIFFICULTIES.map(d => ({ value: d, label: d }))]
  const statusOptions = [{ value: 'All', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s }))]
  const sourceOptions = [{ value: 'All', label: 'All Sources' }, ...SOURCES.map(s => ({ value: s, label: s }))]
  const companyOptions = [{ value: 'All', label: 'All Companies' }, ...allCompanies.map(c => ({ value: c, label: c }))]
  const topicOptions = [{ value: 'All', label: 'All Topics' }, ...allTopics.map(t => ({ value: t, label: t }))]

  return (
    <div className="toolbar-card">
      <div className="toolbar__row">
        <input className="toolbar__search" type="text" placeholder="Search questions, notes..."
          value={search} onChange={e => onSearch(e.target.value)} />
        <div className="toolbar__right">
          <button className="btn--icon" onClick={onRandomPick} aria-label="Random unsolved problem">🎲</button>
          <button className="btn--icon" onClick={onFocusRandom} aria-label="Focus mode on random problem">🎯</button>
          <button className="btn btn--primary btn--sm" onClick={onAdd}>+ Add</button>
          <button className="btn--icon" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
          <div className="toolbar__more-wrap" ref={moreRef}>
            <button className="btn--icon" onClick={() => setShowMore(v => !v)} aria-label="More actions">⋯</button>
            {showMore && (
              <div className="toolbar__more-menu">
                <button className="toolbar__more-item" onClick={() => { onShare(); setShowMore(false) }}>🔗 Share Link</button>
                <button className="toolbar__more-item" onClick={() => { onImport(); setShowMore(false) }}>📥 Import</button>
                <button className="toolbar__more-item" onClick={() => { onExport(); setShowMore(false) }}>📤 Export</button>
                <button className="toolbar__more-item" onClick={() => { window.print(); setShowMore(false) }}>🖨️ Print</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="toolbar__divider" />
      <div className="toolbar__row toolbar__row--filters">
        <Dropdown value={filterDifficulty} options={difficultyOptions} placeholder="Difficulty" onChange={onFilterDifficulty} />
        <Dropdown value={filterStatus} options={statusOptions} placeholder="Status" onChange={onFilterStatus} />
        <Dropdown value={filterSource} options={sourceOptions} placeholder="Source" onChange={onFilterSource} />
        {allTopics.length > 0 && (
          <Dropdown value={filterTopic} options={topicOptions} placeholder="Topic" onChange={onFilterTopic} />
        )}
        {allCompanies.length > 0 && (
          <Dropdown value={filterCompany} options={companyOptions} placeholder="Company" onChange={onFilterCompany} />
        )}
        <button className={`filter-chip ${filterRevision ? 'filter-chip--active' : ''}`}
          onClick={() => onFilterRevision(!filterRevision)}>
          🔄 Revision
        </button>
        {activeFilterCount > 0 && (
          <button className="filter-chip filter-chip--clear" onClick={() => {
            onFilterDifficulty('All'); onFilterStatus('All'); onFilterSource('All')
            onFilterCompany('All'); onFilterTopic('All'); onFilterRevision(false)
          }}>
            ✕ Clear ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  )
}
