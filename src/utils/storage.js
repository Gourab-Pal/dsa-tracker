import { supabase } from './supabase'

// Map from frontend camelCase to DB snake_case
function toDb(q, userId) {
  return {
    id: q.id,
    user_id: userId,
    serial: q.serial,
    title: q.title,
    description: q.description || '',
    example: q.example || '',
    link: q.link || '',
    notes: q.notes || '',
    difficulty: q.difficulty,
    status: q.status,
    source: q.source,
    companies: q.companies || [],
    topics: q.topics || [],
    needs_revision: q.needsRevision || false,
    time_complexity: q.timeComplexity || '',
    space_complexity: q.spaceComplexity || '',
    attempts: q.attempts || 1,
    solution_code: q.solutionCode || '',
    perceived_difficulty: q.perceivedDifficulty || '',
    solve_time_seconds: q.solveTimeSeconds || 0,
    created_at: q.createdAt || new Date().toISOString(),
    last_solved_at: q.lastSolvedAt || null,
  }
}

// Map from DB snake_case to frontend camelCase
function fromDb(row) {
  return {
    id: row.id,
    serial: row.serial,
    title: row.title,
    description: row.description || '',
    example: row.example || '',
    link: row.link || '',
    notes: row.notes || '',
    difficulty: row.difficulty,
    status: row.status,
    source: row.source,
    companies: row.companies || [],
    topics: row.topics || [],
    needsRevision: row.needs_revision || false,
    timeComplexity: row.time_complexity || '',
    spaceComplexity: row.space_complexity || '',
    attempts: row.attempts || 1,
    solutionCode: row.solution_code || '',
    perceivedDifficulty: row.perceived_difficulty || '',
    solveTimeSeconds: row.solve_time_seconds || 0,
    createdAt: row.created_at,
    lastSolvedAt: row.last_solved_at,
  }
}

export async function loadQuestions() {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('serial', { ascending: true })
    if (error) throw error
    return (data || []).map(fromDb)
  } catch (err) {
    console.error('Failed to load questions:', err)
    return []
  }
}

export async function saveQuestions(questions) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get existing IDs from DB
    const { data: existing } = await supabase
      .from('questions')
      .select('id')
    const existingIds = new Set((existing || []).map(r => r.id))
    const currentIds = new Set(questions.map(q => q.id))

    // Delete removed questions
    const toDelete = [...existingIds].filter(id => !currentIds.has(id))
    if (toDelete.length > 0) {
      await supabase.from('questions').delete().in('id', toDelete)
    }

    // Upsert all current questions
    if (questions.length > 0) {
      const { error } = await supabase
        .from('questions')
        .upsert(questions.map(q => toDb(q, user.id)), { onConflict: 'id' })
      if (error) throw error
    }
  } catch (err) {
    console.error('Failed to save questions:', err)
  }
}
