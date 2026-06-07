import { useState } from 'react'
import './QuestionTable.css'
import QuestionRow from './QuestionRow'
import Pagination from './Pagination'

const COLUMNS = [
  { key: 'serial', label: '#', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'difficulty', label: 'Difficulty', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'source', label: 'Source', sortable: false },
]

function SortIcon({ active, dir }) {
  if (!active) return <span className="sort-icon">↕</span>
  return <span className="sort-icon">{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function QuestionTable({ questions, sortKey, sortDir, onSort, onCycleStatus, onEdit, onDelete, onToggleRevision, selectedIds, onToggleSelect, onSelectAll, onBulkAction, highlightId }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = questions.slice((safePage - 1) * pageSize, safePage * pageSize)
  const allSelected = paged.length > 0 && paged.every(q => selectedIds.has(q.id))

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-bar__count">{selectedIds.size} selected</span>
          <button className="bulk-bar__btn" onClick={() => onBulkAction('solve')}>✅ Solve</button>
          <button className="bulk-bar__btn" onClick={() => onBulkAction('revision')}>🔄 Revision</button>
          <button className="bulk-bar__btn bulk-bar__btn--danger" onClick={() => onBulkAction('delete')}>🗑️ Delete</button>
          <button className="bulk-bar__btn" onClick={() => onSelectAll([])}>Clear</button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="question-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <input type="checkbox" checked={allSelected} onChange={() => {
                  if (allSelected) onSelectAll([])
                  else onSelectAll(paged.map(q => q.id))
                }} />
              </th>
              {COLUMNS.map(col => (
                <th key={col.key} className={col.sortable ? 'sortable' : ''}
                  onClick={col.sortable ? () => onSort(col.key) : undefined}>
                  {col.label}
                  {col.sortable && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                </th>
              ))}
              <th className="th-actions" />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="table-empty">
                  <div className="empty-state">
                    <div className="empty-state__icon">📝</div>
                    <h3 className="empty-state__title">No questions yet</h3>
                    <p className="empty-state__text">Add your first DSA problem to start tracking.</p>
                    <p className="empty-state__hint">Press <kbd>N</kbd> to quickly add one</p>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map(q => (
                <QuestionRow key={q.id} question={q}
                  selected={selectedIds.has(q.id)}
                  highlighted={q.id === highlightId}
                  onToggleSelect={() => onToggleSelect(q.id)}
                  onCycleStatus={onCycleStatus} onEdit={onEdit}
                  onDelete={onDelete} onToggleRevision={onToggleRevision} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {questions.length > 10 && (
        <Pagination total={questions.length} page={safePage} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1) }} />
      )}
    </>
  )
}
