// Everything the student does: visited lessons, quiz attempts and notes.
// Saved in localStorage only; no personal data leaves the device.
import type { AnswerValue, Question, Quiz } from '~/types/content'

export interface Attempt {
  id: string
  quizId: string
  at: string // ISO date
  score: number
  total: number
  percent: number
  seconds: number
  answers: Record<string, AnswerValue>
}

export interface Note {
  id: string
  text: string
  topic: string
  createdAt: string
  done: boolean
}

interface Saved {
  visited: string[] // lesson slugs
  attempts: Attempt[]
  notes: Note[]
}

const STORAGE_KEY = 'mainframe-v1'
const empty = (): Saved => ({ visited: [], attempts: [], notes: [] })
let loaded = false

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export function isCorrect(q: Question, a: AnswerValue | undefined) {
  if (a == null) return false
  if (q.type === 'mcq') return a === q.answer
  return Array.isArray(a) && a.length === q.answer.length && a.every((v, i) => v === q.answer[i])
}

export function answerText(q: Question, a: AnswerValue | undefined) {
  if (a == null || (Array.isArray(a) && a.length === 0)) return 'No answer'
  if (q.type === 'mcq') return q.options.find(o => o.id === a)?.text ?? String(a)
  return (a as number[]).join(', ')
}

export function correctText(q: Question) {
  return q.type === 'mcq' ? (q.options.find(o => o.id === q.answer)?.text ?? '') : q.answer.join(', ')
}

export function useProgress() {
  const state = useState<Saved>('tq-progress', empty)

  if (import.meta.client && !loaded) {
    loaded = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) state.value = { ...empty(), ...JSON.parse(raw) }
    } catch { /* storage blocked or corrupt: start fresh */ }
    watch(state, (v) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch { /* ignore */ }
    }, { deep: true })
  }

  const { lessons, quizzes } = useContent()

  // ---- Quiz attempts ----
  const attemptsFor = (quizId: string) =>
    state.value.attempts.filter(a => a.quizId === quizId).sort((a, b) => b.at.localeCompare(a.at))
  const bestFor = (quizId: string) => {
    const list = attemptsFor(quizId)
    return list.length ? Math.max(...list.map(a => a.percent)) : null
  }
  const recentAttempts = computed(() => [...state.value.attempts].sort((a, b) => b.at.localeCompare(a.at)))

  function recordAttempt(quiz: Quiz, answers: Record<string, AnswerValue>, seconds: number) {
    const score = quiz.questions.filter(q => isCorrect(q, answers[q.id])).length
    const total = quiz.questions.length
    const attempt: Attempt = {
      id: newId(), quizId: quiz.id, at: new Date().toISOString(),
      score, total, percent: Math.round((score / total) * 100), seconds,
      answers: JSON.parse(JSON.stringify(answers)),
    }
    state.value.attempts.push(attempt)
    return attempt
  }

  // ---- Lessons ----
  function markVisited(slug: string) {
    if (!state.value.visited.includes(slug)) state.value.visited.push(slug)
  }
  const lessonStatus = (slug: string): 'done' | 'started' | 'new' => {
    const quiz = lessons.find(l => l.slug === slug)?.quizId
    if (quiz && attemptsFor(quiz).length) return 'done'
    return state.value.visited.includes(slug) ? 'started' : 'new'
  }
  const lessonsDone = computed(() => lessons.filter(l => lessonStatus(l.slug) === 'done').length)
  const nextLesson = computed(() => lessons.find(l => lessonStatus(l.slug) !== 'done') ?? null)
  const allLessonsDone = computed(() => lessonsDone.value === lessons.length)

  const isLocked = (quiz: Quiz) => quiz.kind === 'final' && !allLessonsDone.value

  const overallPercent = computed(() => {
    const finalDone = quizzes.some(q => q.kind === 'final' && attemptsFor(q.id).length) ? 1 : 0
    return Math.round(((lessonsDone.value + finalDone) / (lessons.length + 1)) * 100)
  })

  const quizzesAttempted = computed(() => quizzes.filter(q => attemptsFor(q.id).length).length)
  const averageBest = computed(() => {
    const bests = quizzes.map(q => bestFor(q.id)).filter((b): b is number => b != null)
    return bests.length ? Math.round(bests.reduce((s, b) => s + b, 0) / bests.length) : null
  })

  // ---- Notes ----
  const notes = computed(() => [...state.value.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  const openNotes = computed(() => notes.value.filter(n => !n.done))
  function addNote(text: string, topic: string) {
    state.value.notes.push({ id: newId(), text: text.trim(), topic, createdAt: new Date().toISOString(), done: false })
  }
  function toggleNote(id: string) {
    const n = state.value.notes.find(x => x.id === id)
    if (n) n.done = !n.done
  }
  function deleteNote(id: string) {
    state.value.notes = state.value.notes.filter(x => x.id !== id)
  }

  function resetProgress() {
    state.value = empty()
  }

  return {
    state,
    attemptsFor, bestFor, recentAttempts, recordAttempt,
    markVisited, lessonStatus, lessonsDone, nextLesson, allLessonsDone, isLocked,
    overallPercent, quizzesAttempted, averageBest,
    notes, openNotes, addNote, toggleNote, deleteNote,
    resetProgress,
  }
}
