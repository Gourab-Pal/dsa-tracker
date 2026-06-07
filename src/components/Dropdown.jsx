import { useState, useRef, useEffect } from 'react'
import './Dropdown.css'

export default function Dropdown({ value, options, placeholder, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder

  return (
    <div className={`dropdown ${open ? 'dropdown--open' : ''}`} ref={ref}>
      <button
        type="button"
        className="dropdown__trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={`dropdown__value ${value === 'All' ? 'dropdown__value--placeholder' : ''}`}>
          {selectedLabel}
        </span>
        <svg className="dropdown__chevron" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
      {open && (
        <div className="dropdown__menu" role="listbox">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`dropdown__item ${opt.value === value ? 'dropdown__item--active' : ''}`}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
              {opt.value === value && (
                <svg className="dropdown__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
