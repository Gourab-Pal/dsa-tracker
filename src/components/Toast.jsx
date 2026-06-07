import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, action, onAction, onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  if (!message) return null

  return (
    <div className="toast">
      <span className="toast__message">{message}</span>
      {action && (
        <button className="toast__action" onClick={onAction}>{action}</button>
      )}
      <button className="toast__close" onClick={onClose}>✕</button>
    </div>
  )
}
