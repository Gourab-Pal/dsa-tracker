import './Header.css'
import AnimatedNumber from './AnimatedNumber'

export default function Header({ questions, streak, weeklySolved, weeklyGoal, userEmail, userName, onLogout, onProfile }) {
  const total = questions.length
  const solved = questions.filter(q => q.status === 'Solved').length
  const inProgress = questions.filter(q => q.status === 'In Progress').length
  const revision = questions.filter(q => q.needsRevision).length
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__left">
          <div className="header__brand">
            <div className="header__icon">📊</div>
            <div>
              <h1 className="header__title">DSA Tracker</h1>
              <p className="header__subtitle">{pct}% solved · {streak > 0 ? `🔥 ${streak} day streak` : 'Start your streak today'}</p>
            </div>
          </div>
        </div>
        <div className="header__right">
          <div className="header__metrics">
            <div className="metric">
              <span className="metric__value metric__value--total"><AnimatedNumber value={total} /></span>
              <span className="metric__label">Total</span>
            </div>
            <div className="metric__divider" />
            <div className="metric">
              <span className="metric__value metric__value--solved"><AnimatedNumber value={solved} /></span>
              <span className="metric__label">Solved</span>
            </div>
            <div className="metric__divider" />
            <div className="metric">
              <span className="metric__value metric__value--progress"><AnimatedNumber value={inProgress} /></span>
              <span className="metric__label">Active</span>
            </div>
            <div className="metric__divider" />
            <div className="metric">
              <span className="metric__value metric__value--weekly"><AnimatedNumber value={weeklySolved} /><span className="metric__goal">/{weeklyGoal}</span></span>
              <span className="metric__label">This Week</span>
            </div>
            {revision > 0 && (
              <>
                <div className="metric__divider" />
                <div className="metric">
                  <span className="metric__value metric__value--revision"><AnimatedNumber value={revision} /></span>
                  <span className="metric__label">Revision</span>
                </div>
              </>
            )}
          </div>
          {userEmail && (
            <div className="header__user">
              <button className="header__user-btn" onClick={onProfile}>
                <span className="header__user-avatar">{(userName || userEmail)[0].toUpperCase()}</span>
                <span className="header__user-name">{userName || userEmail}</span>
              </button>
              <button className="header__logout" onClick={onLogout}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
