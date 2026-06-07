import { useMemo } from 'react'
import './DailyPlan.css'

const DIFF_CLASS = { Easy: 'badge--easy', Medium: 'badge--medium', Hard: 'badge--hard' }
const STATUS_CLASS = {
  'Not Started': 'badge--not-started',
  'In Progress': 'badge--in-progress',
  'Solved': 'badge--solved',
}

export default function DailyPlan({ questions, onFocus, onEdit }) {
  const plan = useMemo(() => {
    const unsolved = questions.filter(q => q.status !== 'Solved')
    const revision = questions.filter(q => q.needsRevision && q.status === 'Solved')
    const picks = []

    const shuffledRevision = [...revision].sort(() => Math.random() - 0.5)
    picks.push(...shuffledRevision.slice(0, 2))

    const topicStats = {}
    questions.forEach(q => {
      if (q.topics) q.topics.forEach(t => {
        if (!topicStats[t]) topicStats[t] = { total: 0, solved: 0 }
        topicStats[t].total++
        if (q.status === 'Solved') topicStats[t].solved++
      })
    })
    const weakTopics = Object.entries(topicStats)
      .filter(([, v]) => v.total > 0 && v.solved / v.total < 0.5)
      .map(([name]) => name)

    const weakUnsolved = unsolved.filter(q =>
      q.topics && q.topics.some(t => weakTopics.includes(t)) && !picks.find(p => p.id === q.id)
    ).sort(() => Math.random() - 0.5)
    picks.push(...weakUnsolved.slice(0, 1))

    const remaining = unsolved.filter(q => !picks.find(p => p.id === q.id)).sort(() => Math.random() - 0.5)
    picks.push(...remaining.slice(0, Math.min(5 - picks.length, remaining.length)))

    return picks
  }, [questions])

  const solved = questions.filter(q => q.status === 'Solved').length
  const total = questions.length
  const todaySolved = plan.filter(p => p.status === 'Solved').length
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0

  return (
    <div className="plan-page">
      {/* Hero */}
      <div className="plan-hero">
        <div className="plan-hero__left">
          <h2 className="plan-hero__title">Today's Study Plan</h2>
          <p className="plan-hero__subtitle">
            {plan.length > 0
              ? `${plan.length} problems picked based on your weak areas and revision queue`
              : 'All caught up! Add more problems or check the dashboard.'}
          </p>
          <div className="plan-hero__stats">
            <div className="plan-stat">
              <span className="plan-stat__value">{pct}%</span>
              <span className="plan-stat__label">Overall</span>
            </div>
            <div className="plan-stat">
              <span className="plan-stat__value plan-stat__value--green">{todaySolved}/{plan.length}</span>
              <span className="plan-stat__label">Today</span>
            </div>
            <div className="plan-stat">
              <span className="plan-stat__value plan-stat__value--orange">{questions.filter(q => q.needsRevision).length}</span>
              <span className="plan-stat__label">Revision</span>
            </div>
          </div>
        </div>
        <div className="plan-hero__ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-light)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" strokeWidth="10"
              strokeDasharray={`${(todaySolved / Math.max(plan.length, 1)) * 314} 314`}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
            <text x="60" y="56" textAnchor="middle" className="plan-hero__ring-value">{todaySolved}</text>
            <text x="60" y="72" textAnchor="middle" className="plan-hero__ring-label">of {plan.length}</text>
          </svg>
        </div>
      </div>

      {/* Problem Cards */}
      {plan.length > 0 && (
        <div className="plan-cards">
          {plan.map((q, i) => (
            <div key={q.id} className={`plan-card ${q.status === 'Solved' ? 'plan-card--done' : ''}`}>
              <div className="plan-card__number">{i + 1}</div>
              <div className="plan-card__body">
                <div className="plan-card__top">
                  <div className="plan-card__title-row">
                    <h3 className="plan-card__title">
                      {q.link ? (
                        <a href={q.link} target="_blank" rel="noopener noreferrer">{q.title}</a>
                      ) : q.title}
                    </h3>
                    <span className={`badge ${DIFF_CLASS[q.difficulty]}`}>{q.difficulty}</span>
                    <span className={`badge ${STATUS_CLASS[q.status]}`}>{q.status}</span>
                  </div>
                  {q.description && <p className="plan-card__desc">{q.description}</p>}
                  <div className="plan-card__meta">
                    {q.needsRevision && <span className="plan-card__tag plan-card__tag--revision">🔄 Revision</span>}
                    {q.topics && q.topics.slice(0, 3).map(t => (
                      <span key={t} className="plan-card__tag">{t}</span>
                    ))}
                    {q.companies && q.companies.slice(0, 2).map(c => (
                      <span key={c} className="plan-card__tag plan-card__tag--company">{c}</span>
                    ))}
                    {q.timeComplexity && <span className="plan-card__complexity">⏱ {q.timeComplexity}</span>}
                    {q.source && <span className="plan-card__source">{q.source}</span>}
                  </div>
                </div>
                <div className="plan-card__actions">
                  <button className="plan-card__btn plan-card__btn--focus" onClick={() => onFocus(q)}>
                    🎯 Focus
                  </button>
                  <button className="plan-card__btn plan-card__btn--edit" onClick={() => onEdit(q)}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
              {q.status === 'Solved' && <div className="plan-card__check">✓</div>}
            </div>
          ))}
        </div>
      )}

      {plan.length === 0 && (
        <div className="plan-empty">
          <div className="plan-empty__icon">🎉</div>
          <h3 className="plan-empty__title">All caught up!</h3>
          <p className="plan-empty__text">No unsolved or revision problems to suggest. Add more questions to keep practicing.</p>
        </div>
      )}
    </div>
  )
}
