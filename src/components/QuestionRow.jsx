import { useState } from 'react'
import CodeBlock from './CodeBlock'

function timeAgo(dateStr) {
  const now = new Date()
  const d = new Date(dateStr)
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  const days = Math.floor(diff / 86400)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

const DIFF_CLASS = { Easy: 'badge--easy', Medium: 'badge--medium', Hard: 'badge--hard' }
const STATUS_CLASS = {
  'Not Started': 'badge--not-started',
  'In Progress': 'badge--in-progress',
  'Solved': 'badge--solved',
}

export default function QuestionRow({ question, selected, highlighted, onToggleSelect, onCycleStatus, onEdit, onDelete, onToggleRevision }) {
  const [expanded, setExpanded] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const q = question

  const hasDetails = q.description || q.example || q.notes || q.timeComplexity || q.spaceComplexity || q.solutionCode || q.perceivedDifficulty

  function handleRowClick(e) {
    if (e.target.closest('button, a, input, .badge--clickable')) return
    if (hasDetails) setExpanded(v => { if (v) setShowCode(false); return !v })
  }

  return (
    <>
      <tr id={`row-${q.id}`}
        className={`question-row ${q.needsRevision ? 'question-row--revision' : ''} ${selected ? 'question-row--selected' : ''} ${expanded ? 'question-row--expanded' : ''} ${highlighted ? 'question-row--highlighted' : ''}`}
        onClick={handleRowClick} style={{ cursor: hasDetails ? 'pointer' : 'default' }}>

        <td className="td-checkbox">
          <input type="checkbox" checked={selected} onChange={onToggleSelect} />
        </td>

        <td className="td-serial">{q.serial}</td>

        <td className="td-title">
          <div className="td-title__main">
            {q.needsRevision && <span className="revision-dot">🔄</span>}
            {q.link ? (
              <a href={q.link} target="_blank" rel="noopener noreferrer" className="td-title__link" onClick={e => e.stopPropagation()}>{q.title}</a>
            ) : (
              <span className="td-title__text">{q.title}</span>
            )}
            {q.attempts > 1 && <span className="attempt-badge">×{q.attempts}</span>}
            {hasDetails && <span className="expand-hint">{expanded ? '▾' : '▸'}</span>}
          </div>
          {((q.topics && q.topics.length > 0) || (q.companies && q.companies.length > 0)) && (
            <div className="td-title__tags">
              {q.topics && q.topics.slice(0, 3).map(t => <span key={t} className="mini-tag mini-tag--topic">{t}</span>)}
              {q.companies && q.companies.slice(0, 2).map(c => <span key={c} className="mini-tag mini-tag--company">{c}</span>)}
              {((q.topics?.length || 0) + (q.companies?.length || 0)) > 5 && (
                <span className="mini-tag mini-tag--more">+{(q.topics?.length || 0) + (q.companies?.length || 0) - 5}</span>
              )}
            </div>
          )}
        </td>

        <td><span className={`badge ${DIFF_CLASS[q.difficulty]}`}>{q.difficulty}</span></td>

        <td>
          <span className={`badge badge--clickable ${STATUS_CLASS[q.status]}`}
            onClick={() => onCycleStatus(q.id)}>{q.status}</span>
        </td>

        <td className="td-source">{q.source}</td>

        <td className="td-actions">
          <button className="action-btn action-btn--revision" onClick={() => onToggleRevision(q.id)} aria-label="Toggle revision">
            {q.needsRevision ? '🔄' : '📌'}
          </button>
          <button className="action-btn action-btn--edit" onClick={() => onEdit(q)} aria-label="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="action-btn action-btn--delete" onClick={() => onDelete(q.id)} aria-label="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="detail-row">
          <td colSpan={7}>
            <div className="detail-panel">
              <div className="detail-grid">
                {q.description && (
                  <div className="detail-block">
                    <div className="detail-block__label">Description</div>
                    <div className="detail-block__text">{q.description}</div>
                  </div>
                )}
                {q.example && (
                  <div className="detail-block">
                    <div className="detail-block__label">Example</div>
                    <div className="detail-block__text detail-block__text--mono">{q.example}</div>
                  </div>
                )}
              </div>
              {q.notes && (
                <div className="detail-block">
                  <div className="detail-block__label">Notes</div>
                  <div className="detail-block__text">{q.notes}</div>
                </div>
              )}
              {(q.timeComplexity || q.spaceComplexity || q.perceivedDifficulty || q.attempts > 1) && (
                <div className="detail-block detail-block--row">
                  {q.timeComplexity && <div className="detail-chip">⏱ Time: <strong>{q.timeComplexity}</strong></div>}
                  {q.spaceComplexity && <div className="detail-chip">💾 Space: <strong>{q.spaceComplexity}</strong></div>}
                  {q.perceivedDifficulty && <div className="detail-chip">🎯 Perceived: <strong>{q.perceivedDifficulty}</strong></div>}
                  {q.attempts > 1 && <div className="detail-chip">🔢 Attempts: <strong>{q.attempts}</strong></div>}
                </div>
              )}
              {(q.createdAt || q.lastSolvedAt) && (
                <div className="detail-block detail-block--row detail-block--meta">
                  {q.createdAt && <span className="detail-meta">Added {timeAgo(q.createdAt)}</span>}
                  {q.lastSolvedAt && <span className="detail-meta">Last solved {timeAgo(q.lastSolvedAt)}</span>}
                </div>
              )}
              {q.solutionCode && (
                <div className="detail-block">
                  {showCode ? (
                    <>
                      <div className="detail-block__label-row">
                        <div className="detail-block__label">Solution Code</div>
                        <button className="detail-block__toggle" onClick={() => setShowCode(false)}>Hide Code</button>
                      </div>
                      <CodeBlock code={q.solutionCode} />
                    </>
                  ) : (
                    <button className="detail-block__show-btn" onClick={() => setShowCode(true)}>
                      💻 Show Solution Code
                    </button>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
