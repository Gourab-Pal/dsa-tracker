import './ShortcutsModal.css'

const SHORTCUTS = [
  { keys: ['N'], desc: 'Add new question' },
  { keys: ['⌘', 'K'], desc: 'Focus search bar' },
  { keys: ['⌘', 'P'], desc: 'Print view' },
  { keys: ['?'], desc: 'Show this help' },
  { keys: ['Esc'], desc: 'Close modal / exit focus' },
  { keys: ['Click row'], desc: 'Expand question details' },
  { keys: ['Click status'], desc: 'Cycle status' },
  { keys: ['🎲'], desc: 'Random unsolved problem' },
  { keys: ['🎯'], desc: 'Focus mode on random problem' },
]

export default function ShortcutsModal({ onClose }) {
  return (
    <div className="shortcuts-backdrop" onClick={onClose}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-modal__header">
          <h2>Keyboard Shortcuts</h2>
          <button className="shortcuts-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="shortcuts-modal__list">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="shortcut-row">
              <div className="shortcut-row__keys">
                {s.keys.map((k, j) => (
                  <span key={j}>
                    {j > 0 && <span className="shortcut-row__plus">+</span>}
                    <kbd className="shortcut-kbd">{k}</kbd>
                  </span>
                ))}
              </div>
              <span className="shortcut-row__desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
