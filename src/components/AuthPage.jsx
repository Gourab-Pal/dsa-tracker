import { useState } from 'react'
import './AuthPage.css'
import { supabase } from '../utils/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email for a confirmation link!')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__icon">📊</div>
          <h1 className="auth-card__title">DSA Tracker</h1>
          <p className="auth-card__subtitle">Track your coding progress</p>
        </div>

        <div className="auth-card__tabs">
          <button className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`} onClick={() => { setMode('login'); setError('') }}>Log In</button>
          <button className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`} onClick={() => { setMode('signup'); setError('') }}>Sign Up</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-field__label">Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoFocus />
          </label>
          <label className="auth-field">
            <span className="auth-field__label">Password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'} required minLength={6} />
          </label>

          {error && <div className="auth-error">⚠️ {error}</div>}
          {message && <div className="auth-message">✅ {message}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="auth-link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
