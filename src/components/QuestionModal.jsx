import { useState, useEffect, useRef } from 'react'
import './QuestionModal.css'
import { DIFFICULTIES, STATUSES, SOURCES, COMPANIES, TOPICS } from '../utils/constants'
import Dropdown from './Dropdown'

const DEFAULT_FORM = {
  title: '',
  description: '',
  example: '',
  link: '',
  notes: '',
  difficulty: 'Easy',
  status: 'Not Started',
  source: 'LeetCode',
  customSource: '',
  companies: [],
  topics: [],
  needsRevision: false,
  timeComplexity: '',
  spaceComplexity: '',
  attempts: 1,
  solutionCode: '',
  perceivedDifficulty: '',
}

const DIFF_EMOJI = { Easy: '🟢', Medium: '🟡', Hard: '🔴' }

export default function QuestionModal({ question, onSave, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [error, setError] = useState('')
  const [companyInput, setCompanyInput] = useState('')
  const [topicInput, setTopicInput] = useState('')
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false)
  const companySugRef = useRef(null)
  const companyInputRef = useRef(null)
  const topicSugRef = useRef(null)
  const topicInputRef = useRef(null)

  useEffect(() => {
    if (question) {
      setForm({
        title: question.title,
        description: question.description || '',
        example: question.example || '',
        link: question.link || '',
        notes: question.notes || '',
        difficulty: question.difficulty,
        status: question.status,
        source: SOURCES.includes(question.source) ? question.source : 'Other',
        customSource: SOURCES.includes(question.source) ? '' : question.source,
        companies: question.companies || [],
        topics: question.topics || [],
        needsRevision: question.needsRevision || false,
        timeComplexity: question.timeComplexity || '',
        spaceComplexity: question.spaceComplexity || '',
        attempts: question.attempts || 1,
        solutionCode: question.solutionCode || '',
        perceivedDifficulty: question.perceivedDifficulty || '',
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    setError('')
    setCompanyInput('')
    setTopicInput('')
  }, [question])

  useEffect(() => {
    function handleKeyDown(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    function handleClickOutside(e) {
      if (companySugRef.current && !companySugRef.current.contains(e.target) &&
          companyInputRef.current && !companyInputRef.current.contains(e.target)) {
        setShowCompanySuggestions(false)
      }
      if (topicSugRef.current && !topicSugRef.current.contains(e.target) &&
          topicInputRef.current && !topicInputRef.current.contains(e.target)) {
        setShowTopicSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Company tag helpers
  function addCompany(c) {
    const t = c.trim()
    if (t && !form.companies.includes(t)) setForm(p => ({ ...p, companies: [...p.companies, t] }))
    setCompanyInput(''); setShowCompanySuggestions(false); companyInputRef.current?.focus()
  }
  function removeCompany(c) { setForm(p => ({ ...p, companies: p.companies.filter(x => x !== c) })) }
  function handleCompanyKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); if (companyInput.trim()) addCompany(companyInput) }
    if (e.key === 'Backspace' && !companyInput && form.companies.length) removeCompany(form.companies.at(-1))
  }

  // Topic tag helpers
  function addTopic(t) {
    const trimmed = t.trim()
    if (trimmed && !form.topics.includes(trimmed)) setForm(p => ({ ...p, topics: [...p.topics, trimmed] }))
    setTopicInput(''); setShowTopicSuggestions(false); topicInputRef.current?.focus()
  }
  function removeTopic(t) { setForm(p => ({ ...p, topics: p.topics.filter(x => x !== t) })) }
  function handleTopicKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); if (topicInput.trim()) addTopic(topicInput) }
    if (e.key === 'Backspace' && !topicInput && form.topics.length) removeTopic(form.topics.at(-1))
  }

  const filteredCompanies = COMPANIES.filter(c => c.toLowerCase().includes(companyInput.toLowerCase()) && !form.companies.includes(c))
  const filteredTopics = TOPICS.filter(t => t.toLowerCase().includes(topicInput.toLowerCase()) && !form.topics.includes(t))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (form.source === 'Other' && !form.customSource.trim()) { setError('Please enter a source name.'); return }
    const finalSource = form.source === 'Other' ? form.customSource.trim() : form.source
    onSave({ ...form, source: finalSource })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__header-left">
            <span className="modal__header-icon">{question ? '✏️' : '➕'}</span>
            <div>
              <h2 className="modal__title">{question ? 'Edit Question' : 'New Question'}</h2>
              <p className="modal__subtitle">{question ? 'Update the details below' : 'Fill in the details to track a new problem'}</p>
            </div>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          {/* Problem Info */}
          <div className="modal__section">
            <div className="modal__section-label"><span className="modal__section-dot" /> Problem Info</div>
            <label className="field">
              <span className="field__label">Title <span className="required">*</span></span>
              <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Two Sum" autoFocus />
            </label>
            <label className="field">
              <span className="field__label">Description</span>
              <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Brief description of the problem..." rows={2} />
            </label>
            <label className="field">
              <span className="field__label">Example</span>
              <input type="text" value={form.example} onChange={e => handleChange('example', e.target.value)} placeholder="e.g. [1,2,3] → [0,1]" className="field__mono" />
            </label>
            <label className="field">
              <span className="field__label">🔗 Problem Link</span>
              <input type="url" value={form.link} onChange={e => handleChange('link', e.target.value)} placeholder="https://leetcode.com/problems/two-sum" />
            </label>
          </div>

          {/* Classification */}
          <div className="modal__section">
            <div className="modal__section-label"><span className="modal__section-dot modal__section-dot--purple" /> Classification</div>
            <div className="field-row">
              <div className="field field--flex">
                <span className="field__label">{DIFF_EMOJI[form.difficulty]} Difficulty</span>
                <Dropdown value={form.difficulty} options={DIFFICULTIES.map(d => ({ value: d, label: d }))} placeholder="Difficulty" onChange={v => handleChange('difficulty', v)} />
              </div>
              <div className="field field--flex">
                <span className="field__label">Status</span>
                <Dropdown value={form.status} options={STATUSES.map(s => ({ value: s, label: s }))} placeholder="Status" onChange={v => handleChange('status', v)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field field--flex">
                <span className="field__label">Source</span>
                <Dropdown value={form.source} options={SOURCES.map(s => ({ value: s, label: s }))} placeholder="Source" onChange={v => handleChange('source', v)} />
              </div>
              {form.source === 'Other' && (
                <label className="field field--flex">
                  <span className="field__label">Custom Source <span className="required">*</span></span>
                  <input type="text" value={form.customSource} onChange={e => handleChange('customSource', e.target.value)} placeholder="e.g. HackerRank" />
                </label>
              )}
            </div>
          </div>

          {/* Topics */}
          <div className="modal__section">
            <div className="modal__section-label"><span className="modal__section-dot modal__section-dot--orange" /> Topics</div>
            <div className="field">
              <span className="field__label">🏷️ Topic Tags</span>
              <div className="tags-input">
                {form.topics.map(t => (
                  <span key={t} className="tag tag--topic">{t}<button type="button" className="tag__remove" onClick={() => removeTopic(t)}>×</button></span>
                ))}
                <div className="tags-input__field-wrap">
                  <input ref={topicInputRef} type="text" className="tags-input__field" value={topicInput}
                    onChange={e => { setTopicInput(e.target.value); setShowTopicSuggestions(true) }}
                    onFocus={() => setShowTopicSuggestions(true)} onKeyDown={handleTopicKey}
                    placeholder={form.topics.length === 0 ? 'Type to add topics...' : 'Add more...'} />
                  {showTopicSuggestions && topicInput && filteredTopics.length > 0 && (
                    <div className="tags-suggestions" ref={topicSugRef}>
                      {filteredTopics.slice(0, 8).map(t => (
                        <button key={t} type="button" className="tags-suggestions__item" onClick={() => addTopic(t)}>{t}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Company Tags */}
          <div className="modal__section">
            <div className="modal__section-label"><span className="modal__section-dot modal__section-dot--teal" /> Company Tags</div>
            <div className="field">
              <span className="field__label">🏢 Companies</span>
              <div className="tags-input">
                {form.companies.map(c => (
                  <span key={c} className="tag">{c}<button type="button" className="tag__remove" onClick={() => removeCompany(c)}>×</button></span>
                ))}
                <div className="tags-input__field-wrap">
                  <input ref={companyInputRef} type="text" className="tags-input__field" value={companyInput}
                    onChange={e => { setCompanyInput(e.target.value); setShowCompanySuggestions(true) }}
                    onFocus={() => setShowCompanySuggestions(true)} onKeyDown={handleCompanyKey}
                    placeholder={form.companies.length === 0 ? 'Type to add companies...' : 'Add more...'} />
                  {showCompanySuggestions && companyInput && filteredCompanies.length > 0 && (
                    <div className="tags-suggestions" ref={companySugRef}>
                      {filteredCompanies.slice(0, 8).map(c => (
                        <button key={c} type="button" className="tags-suggestions__item" onClick={() => addCompany(c)}>{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Complexity */}
          <div className="modal__section">
            <div className="modal__section-label"><span className="modal__section-dot modal__section-dot--green" /> Notes & Analysis</div>
            <label className="field">
              <span className="field__label">📝 Solution Notes</span>
              <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Your approach, key insights, edge cases..." rows={3} />
            </label>
            <div className="field-row">
              <label className="field field--flex">
                <span className="field__label">⏱️ Time Complexity</span>
                <input type="text" value={form.timeComplexity} onChange={e => handleChange('timeComplexity', e.target.value)} placeholder="e.g. O(n log n)" className="field__mono" />
              </label>
              <label className="field field--flex">
                <span className="field__label">💾 Space Complexity</span>
                <input type="text" value={form.spaceComplexity} onChange={e => handleChange('spaceComplexity', e.target.value)} placeholder="e.g. O(n)" className="field__mono" />
              </label>
            </div>
            <div className="field">
              <label className="checkbox-field">
                <input type="checkbox" checked={form.needsRevision} onChange={e => handleChange('needsRevision', e.target.checked)} />
                <span className="checkbox-field__label">🔄 Mark for revision</span>
              </label>
            </div>
          </div>

          {/* Solution Code */}
          <div className="modal__section">
            <div className="modal__section-label"><span className="modal__section-dot modal__section-dot--blue" /> Solution</div>
            <div className="field-row">
              <label className="field field--flex">
                <span className="field__label">🔢 Attempts</span>
                <input type="number" min="1" value={form.attempts} onChange={e => handleChange('attempts', Math.max(1, parseInt(e.target.value) || 1))} />
              </label>
              <label className="field field--flex">
                <span className="field__label">🎯 Perceived Difficulty</span>
                <input type="text" value={form.perceivedDifficulty} onChange={e => handleChange('perceivedDifficulty', e.target.value)} placeholder="e.g. 7/10, Tricky" />
              </label>
            </div>
            <label className="field">
              <span className="field__label">💻 Solution Code</span>
              <textarea value={form.solutionCode} onChange={e => handleChange('solutionCode', e.target.value)}
                placeholder="Paste your solution code here..." rows={5} className="field__mono field__code" />
            </label>
          </div>

          {error && <div className="modal__error"><span className="modal__error-icon">⚠️</span>{error}</div>}

          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">{question ? 'Save Changes' : 'Add Question'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
