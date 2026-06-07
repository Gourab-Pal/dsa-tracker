import { useState, useEffect, useRef } from 'react'
import './FocusMode.css'

export default function FocusMode({ question, onClose, onSolve }) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return (
    <div className="focus-backdrop">
      <div className="focus-panel">
        <div className="focus__header">
          <div>
            <h2 className="focus__title">{question.title}</h2>
            <div className="focus__badges">
              <span className={`badge badge--${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
              <span className={`badge badge--${question.status.toLowerCase().replace(/\s/g, '-')}`}>{question.status}</span>
              {question.source && <span className="focus__source">{question.source}</span>}
            </div>
          </div>
          <button className="focus__close" onClick={onClose}>✕</button>
        </div>

        <div className="focus__timer">
          <div className="focus__timer-display">{timeStr}</div>
          <div className="focus__timer-controls">
            <button className="focus__timer-btn" onClick={() => setRunning(r => !r)}>
              {running ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button className="focus__timer-btn" onClick={() => { setElapsed(0); setRunning(true) }}>↺ Reset</button>
          </div>
        </div>

        <div className="focus__content">
          {question.description && (
            <div className="focus__section">
              <div className="focus__label">Description</div>
              <div className="focus__text">{question.description}</div>
            </div>
          )}
          {question.example && (
            <div className="focus__section">
              <div className="focus__label">Example</div>
              <div className="focus__text focus__text--mono">{question.example}</div>
            </div>
          )}
          {question.link && (
            <div className="focus__section">
              <a href={question.link} target="_blank" rel="noopener noreferrer" className="focus__link">
                🔗 Open Problem
              </a>
            </div>
          )}
          {question.notes && (
            <div className="focus__section">
              <div className="focus__label">Your Notes</div>
              <div className="focus__text">{question.notes}</div>
            </div>
          )}
          {(question.timeComplexity || question.spaceComplexity) && (
            <div className="focus__section focus__section--row">
              {question.timeComplexity && <div className="focus__chip">⏱ {question.timeComplexity}</div>}
              {question.spaceComplexity && <div className="focus__chip">💾 {question.spaceComplexity}</div>}
            </div>
          )}
        </div>

        <div className="focus__actions">
          <button className="btn btn--secondary" onClick={onClose}>Exit Focus</button>
          <button className="btn btn--primary" onClick={() => onSolve(question.id, elapsed)}>
            ✅ Mark Solved ({timeStr})
          </button>
        </div>
      </div>
    </div>
  )
}
