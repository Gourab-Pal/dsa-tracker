import './Pagination.css'

export default function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  function changePage(p) {
    onPageChange(p)
    document.querySelector('.table-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pagination">
      <div className="pagination__info">
        {total > 0 ? `${start}–${end} of ${total}` : 'No results'}
      </div>
      <div className="pagination__controls">
        <select className="pagination__size" value={pageSize} onChange={e => { onPageSizeChange(Number(e.target.value)); document.querySelector('.table-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button className="pagination__btn" disabled={page <= 1} onClick={() => changePage(1)}>«</button>
        <button className="pagination__btn" disabled={page <= 1} onClick={() => changePage(page - 1)}>‹</button>
        <span className="pagination__page">{page} / {totalPages}</span>
        <button className="pagination__btn" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>›</button>
        <button className="pagination__btn" disabled={page >= totalPages} onClick={() => changePage(totalPages)}>»</button>
      </div>
    </div>
  )
}
