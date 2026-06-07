import { useState, useEffect } from 'react'
import './ProfilePage.css'
import { supabase } from '../utils/supabase'

export default function ProfilePage({ session }) {
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '')
      setPhone(session.user.phone || session.user.user_metadata?.phone || '')
    }
  }, [session])

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName.trim(),
          phone: phone.trim(),
        }
      })
      if (error) throw error
      setMessage('Profile updated successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const user = session?.user
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-avatar">
            {(displayName || user?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="profile-card__name">{displayName || 'Set your name'}</h2>
            <p className="profile-card__email">{user?.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-section-label">Personal Info</div>

          <label className="profile-field">
            <span className="profile-field__label">Display Name</span>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name" />
          </label>

          <label className="profile-field">
            <span className="profile-field__label">Email</span>
            <input type="email" value={user?.email || ''} disabled className="profile-field--disabled" />
            <span className="profile-field__hint">Email cannot be changed</span>
          </label>

          <label className="profile-field">
            <span className="profile-field__label">Phone</span>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+91 9876543210" />
          </label>

          <div className="profile-section-label">Account Info</div>

          <div className="profile-info-row">
            <span className="profile-info-row__label">Member since</span>
            <span className="profile-info-row__value">{createdAt}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-row__label">Auth provider</span>
            <span className="profile-info-row__value">{user?.app_metadata?.provider || 'email'}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-row__label">User ID</span>
            <span className="profile-info-row__value profile-info-row__value--mono">{user?.id?.slice(0, 12)}...</span>
          </div>

          {error && <div className="profile-error">⚠️ {error}</div>}
          {message && <div className="profile-message">✅ {message}</div>}

          <button className="profile-save" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
