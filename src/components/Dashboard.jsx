import { useMemo } from 'react'
import './Dashboard.css'

function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <span className="progress-bar__label">{label}</span>
        <span className="progress-bar__count">{value}/{max}</span>
      </div>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function DonutChart({ segments, size = 120, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-chart">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-light)" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0
        const dashArray = `${pct * circumference} ${circumference}`
        const dashOffset = -offset * circumference
        offset += pct
        return (
          <circle key={i} cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={seg.color} strokeWidth={strokeWidth}
            strokeDasharray={dashArray} strokeDashoffset={dashOffset}
            strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        )
      })}
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="donut-chart__text">{total}</text>
    </svg>
  )
}

export default function Dashboard({ questions, weeklyGoal, onSetWeeklyGoal, weeklySolved, onOpenQuestion }) {
  const stats = useMemo(() => {
    const byDiff = { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } }
    const byTopic = {}
    const byCompany = {}
    const byStatus = { 'Not Started': 0, 'In Progress': 0, 'Solved': 0 }

    questions.forEach(q => {
      if (byDiff[q.difficulty]) {
        byDiff[q.difficulty].total++
        if (q.status === 'Solved') byDiff[q.difficulty].solved++
      }
      byStatus[q.status] = (byStatus[q.status] || 0) + 1
      if (q.topics) q.topics.forEach(t => {
        if (!byTopic[t]) byTopic[t] = { total: 0, solved: 0 }
        byTopic[t].total++
        if (q.status === 'Solved') byTopic[t].solved++
      })
      if (q.companies) q.companies.forEach(c => {
        if (!byCompany[c]) byCompany[c] = { total: 0, solved: 0 }
        byCompany[c].total++
        if (q.status === 'Solved') byCompany[c].solved++
      })
    })

    const topTopics = Object.entries(byTopic).sort((a, b) => b[1].total - a[1].total).slice(0, 6)
    const topCompanies = Object.entries(byCompany).sort((a, b) => b[1].total - a[1].total).slice(0, 6)

    // Recommendations
    const allTopicNames = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Binary Search', 'Stack', 'Queue', 'Heap', 'Greedy', 'Backtracking']
    const missingTopics = allTopicNames.filter(t => !byTopic[t] || byTopic[t].total === 0)
    const weakTopics = Object.entries(byTopic)
      .filter(([, v]) => v.total > 0 && v.solved / v.total < 0.5)
      .sort((a, b) => a[1].solved / a[1].total - b[1].solved / b[1].total)
      .slice(0, 3)
      .map(([name]) => name)

    return { byDiff, byStatus, topTopics, topCompanies, missingTopics, weakTopics }
  }, [questions])

  const revisionItems = questions.filter(q => q.needsRevision)

  // Activity heatmap data (last 16 weeks)
  const heatmapData = useMemo(() => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      days.push({ date: d, count: 0 })
    }
    questions.forEach(q => {
      if (q.lastSolvedAt) {
        const sd = new Date(q.lastSolvedAt)
        sd.setHours(0, 0, 0, 0)
        const match = days.find(d => d.date.getTime() === sd.getTime())
        if (match) match.count++
      }
    })
    return days
  }, [questions])

  // Monthly comparison (last 6 months)
  const monthlyData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('default', { month: 'short' })
      const year = d.getFullYear()
      const month = d.getMonth()
      const solved = questions.filter(q => {
        if (!q.lastSolvedAt) return false
        const sd = new Date(q.lastSolvedAt)
        return sd.getFullYear() === year && sd.getMonth() === month
      })
      months.push({
        label,
        total: solved.length,
        easy: solved.filter(q => q.difficulty === 'Easy').length,
        medium: solved.filter(q => q.difficulty === 'Medium').length,
        hard: solved.filter(q => q.difficulty === 'Hard').length,
      })
    }
    return months
  }, [questions])

  // Average solve time by difficulty
  const avgTimes = useMemo(() => {
    const groups = { Easy: [], Medium: [], Hard: [] }
    questions.forEach(q => {
      if (q.solveTimeSeconds && q.solveTimeSeconds > 0 && groups[q.difficulty]) {
        groups[q.difficulty].push(q.solveTimeSeconds)
      }
    })
    return [
      { label: 'Easy', avg: groups.Easy.length ? Math.round(groups.Easy.reduce((a, b) => a + b, 0) / groups.Easy.length / 60) : 0, color: '#4ade80' },
      { label: 'Medium', avg: groups.Medium.length ? Math.round(groups.Medium.reduce((a, b) => a + b, 0) / groups.Medium.length / 60) : 0, color: '#fbbf24' },
      { label: 'Hard', avg: groups.Hard.length ? Math.round(groups.Hard.reduce((a, b) => a + b, 0) / groups.Hard.length / 60) : 0, color: '#f87171' },
    ]
  }, [questions])

  const maxAvgTime = Math.max(...avgTimes.map(a => a.avg), 1)

  return (
    <div className="dashboard">
      {/* Row 1: Overview */}
      <div className="dashboard__row">
        <div className="dash-card">
          <h3 className="dash-card__title">Status Overview</h3>
          <div className="dash-card__donut-wrap">
            <DonutChart segments={[
              { value: stats.byStatus['Solved'] || 0, color: '#4ade80' },
              { value: stats.byStatus['In Progress'] || 0, color: '#60a5fa' },
              { value: stats.byStatus['Not Started'] || 0, color: '#94a3b8' },
            ]} />
            <div className="dash-card__legend">
              <div className="legend-item"><span className="legend-dot" style={{ background: '#4ade80' }} /> Solved ({stats.byStatus['Solved'] || 0})</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#60a5fa' }} /> In Progress ({stats.byStatus['In Progress'] || 0})</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#94a3b8' }} /> Not Started ({stats.byStatus['Not Started'] || 0})</div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <h3 className="dash-card__title">Difficulty Breakdown</h3>
          <div className="dash-card__bars">
            <ProgressBar label="Easy" value={stats.byDiff.Easy.solved} max={stats.byDiff.Easy.total} color="#4ade80" />
            <ProgressBar label="Medium" value={stats.byDiff.Medium.solved} max={stats.byDiff.Medium.total} color="#fbbf24" />
            <ProgressBar label="Hard" value={stats.byDiff.Hard.solved} max={stats.byDiff.Hard.total} color="#f87171" />
          </div>
        </div>

        <div className="dash-card">
          <h3 className="dash-card__title">Weekly Goal</h3>
          <div className="weekly-goal">
            <div className="weekly-goal__ring">
              <DonutChart size={100} strokeWidth={10} segments={[
                { value: Math.min(weeklySolved, weeklyGoal), color: '#818cf8' },
                { value: Math.max(0, weeklyGoal - weeklySolved), color: 'transparent' },
              ]} />
            </div>
            <p className="weekly-goal__text">{weeklySolved} of {weeklyGoal} solved this week</p>
            <div className="weekly-goal__setter">
              <label className="weekly-goal__label">Goal:</label>
              <input type="number" min="1" max="50" value={weeklyGoal}
                onChange={e => onSetWeeklyGoal(Math.max(1, parseInt(e.target.value) || 1))}
                className="weekly-goal__input" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Topics & Companies */}
      <div className="dashboard__row dashboard__row--2col">
        <div className="dash-card dash-card--wide">
          <h3 className="dash-card__title">Progress by Topic</h3>
          {stats.topTopics.length === 0 ? (
            <p className="dash-card__empty">Add topics to your questions to see progress here</p>
          ) : (
            <div className="dash-card__bars">
              {stats.topTopics.map(([name, data]) => (
                <ProgressBar key={name} label={name} value={data.solved} max={data.total} color="#f59e0b" />
              ))}
            </div>
          )}
        </div>

        <div className="dash-card dash-card--wide">
          <h3 className="dash-card__title">Progress by Company</h3>
          {stats.topCompanies.length === 0 ? (
            <p className="dash-card__empty">Add company tags to see progress here</p>
          ) : (
            <div className="dash-card__bars">
              {stats.topCompanies.map(([name, data]) => (
                <ProgressBar key={name} label={name} value={data.solved} max={data.total} color="#818cf8" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Recommendations & Revision */}
      <div className="dashboard__row dashboard__row--2col">
        <div className="dash-card">
          <h3 className="dash-card__title">💡 Recommendations</h3>
          <div className="recommendations">
            {stats.missingTopics.length > 0 && (
              <div className="rec-item">
                <span className="rec-item__icon">🎯</span>
                <div>
                  <strong>Missing topics:</strong> You haven't practiced{' '}
                  {stats.missingTopics.slice(0, 4).join(', ')}
                  {stats.missingTopics.length > 4 && ` and ${stats.missingTopics.length - 4} more`}.
                </div>
              </div>
            )}
            {stats.weakTopics.length > 0 && (
              <div className="rec-item">
                <span className="rec-item__icon">📈</span>
                <div>
                  <strong>Needs improvement:</strong> Low solve rate in {stats.weakTopics.join(', ')}.
                </div>
              </div>
            )}
            {stats.byDiff.Hard.total === 0 && (
              <div className="rec-item">
                <span className="rec-item__icon">🔴</span>
                <div><strong>Challenge yourself:</strong> Try adding some Hard problems.</div>
              </div>
            )}
            {questions.length > 0 && stats.byStatus['Solved'] === questions.length && (
              <div className="rec-item">
                <span className="rec-item__icon">🎉</span>
                <div><strong>All solved!</strong> Great job. Time to add more problems.</div>
              </div>
            )}
            {questions.length === 0 && (
              <div className="rec-item">
                <span className="rec-item__icon">🚀</span>
                <div><strong>Get started:</strong> Add your first question to begin tracking.</div>
              </div>
            )}
          </div>
        </div>

        <div className="dash-card">
          <h3 className="dash-card__title">🔄 Revision Queue ({revisionItems.length})</h3>
          {revisionItems.length === 0 ? (
            <p className="dash-card__empty">No items marked for revision</p>
          ) : (
            <div className="revision-list">
              {revisionItems.slice(0, 8).map(q => (
                <button key={q.id} className="revision-item" onClick={() => onOpenQuestion(q)}>
                  <span className={`revision-item__diff badge badge--${q.difficulty.toLowerCase()}`}>{q.difficulty[0]}</span>
                  <span className="revision-item__title">{q.title}</span>
                  {q.lastSolvedAt && (
                    <span className="revision-item__date">
                      {new Date(q.lastSolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </button>
              ))}
              {revisionItems.length > 8 && (
                <p className="dash-card__more">+{revisionItems.length - 8} more</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Activity Heatmap */}
      <div className="dashboard__row">
        <div className="dash-card dash-card--span">
          <h3 className="dash-card__title">📅 Activity (Last 16 Weeks)</h3>
          <div className="heatmap">
            {heatmapData.map((d, i) => {
              const level = d.count === 0 ? 0 : d.count <= 1 ? 1 : d.count <= 3 ? 2 : 3
              return (
                <div key={i} className={`heatmap__cell heatmap__cell--${level}`}
                  title={`${d.date.toLocaleDateString()}: ${d.count} solved`} />
              )
            })}
          </div>
          <div className="heatmap__legend">
            <span>Less</span>
            <div className="heatmap__cell heatmap__cell--0" />
            <div className="heatmap__cell heatmap__cell--1" />
            <div className="heatmap__cell heatmap__cell--2" />
            <div className="heatmap__cell heatmap__cell--3" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Row 5: Monthly Comparison */}
      <div className="dashboard__row dashboard__row--2col">
        <div className="dash-card">
          <h3 className="dash-card__title">📊 Monthly Comparison</h3>
          <div className="monthly-compare">
            {monthlyData.map(m => (
              <div key={m.label} className="monthly-bar">
                <div className="monthly-bar__label">{m.label}</div>
                <div className="monthly-bar__track">
                  <div className="monthly-bar__fill monthly-bar__fill--easy" style={{ width: `${m.easy * 8}px` }} />
                  <div className="monthly-bar__fill monthly-bar__fill--medium" style={{ width: `${m.medium * 8}px` }} />
                  <div className="monthly-bar__fill monthly-bar__fill--hard" style={{ width: `${m.hard * 8}px` }} />
                </div>
                <div className="monthly-bar__count">{m.total}</div>
              </div>
            ))}
          </div>
          <div className="monthly-legend">
            <span className="monthly-legend__item"><span className="monthly-legend__dot monthly-legend__dot--easy" /> Easy</span>
            <span className="monthly-legend__item"><span className="monthly-legend__dot monthly-legend__dot--medium" /> Medium</span>
            <span className="monthly-legend__item"><span className="monthly-legend__dot monthly-legend__dot--hard" /> Hard</span>
          </div>
        </div>

        <div className="dash-card">
          <h3 className="dash-card__title">⏱️ Avg Solve Time by Difficulty</h3>
          {avgTimes.some(a => a.avg > 0) ? (
            <div className="dash-card__bars">
              {avgTimes.map(a => (
                <div key={a.label} className="solve-time-row">
                  <span className="solve-time-row__label">{a.label}</span>
                  <div className="solve-time-row__bar-track">
                    <div className="solve-time-row__bar-fill" style={{ width: `${Math.min(100, (a.avg / maxAvgTime) * 100)}%`, background: a.color }} />
                  </div>
                  <span className="solve-time-row__value">{a.avg > 0 ? `${a.avg}m` : '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="dash-card__empty">Solve problems in Focus Mode to track time</p>
          )}
        </div>
      </div>
    </div>
  )
}
