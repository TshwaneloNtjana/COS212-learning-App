// app/composables/useProgress.ts
// Single source of truth for the student's progress.
// Saved to localStorage only (no personal data leaves the device – NFR4 in the SE doc).

export type StepKey =
    | 'home' | 'diagnostic' | 'trees' | 'bst' | 'traversals' | 'practice' | 'quiz' | 'summary'

export interface Step {
    key: StepKey
    label: string     // shown in the side menu
    short: string     // used in sentences, e.g. "Lesson 3 is next"
    to: string        // route
    minutes: number   // rough time estimate
}

export type ConceptKey = 'terms' | 'bstProperty' | 'bstSearch' | 'bfs' | 'dfs'

export const STEPS: Step[] = [
    { key: 'home',       label: 'Overview',                 short: 'Overview',        to: '/',                   minutes: 0 },
    { key: 'diagnostic', label: 'Diagnostic quiz',          short: 'The diagnostic quiz', to: '/diagnostic',     minutes: 5 },
    { key: 'trees',      label: '1 · What is a tree?',      short: 'Lesson 1',        to: '/lessons/trees',      minutes: 8 },
    { key: 'bst',        label: '2 · Binary search trees',  short: 'Lesson 2',        to: '/lessons/bst',        minutes: 12 },
    { key: 'traversals', label: '3 · Traversals',           short: 'Lesson 3',        to: '/lessons/traversals', minutes: 15 },
    { key: 'practice',   label: 'Practice',                 short: 'Practice',        to: '/practice',           minutes: 5 },
    { key: 'quiz',       label: 'Mastery quiz',             short: 'The mastery quiz', to: '/quiz',              minutes: 8 },
    { key: 'summary',    label: 'Summary',                  short: 'The summary',     to: '/summary',            minutes: 2 },
]

export const CONCEPTS: { key: ConceptKey; label: string }[] = [
    { key: 'terms',       label: 'Tree terminology' },
    { key: 'bstProperty', label: 'BST property' },
    { key: 'bstSearch',   label: 'BST insert and search' },
    { key: 'bfs',         label: 'BFS (level order)' },
    { key: 'dfs',         label: 'DFS (pre-, in-, post-order)' },
]

export const MASTERY_THRESHOLD = 70

interface SavedProgress {
    completed: StepKey[]
    mastery: Record<ConceptKey, number | null>
    path: 'standard' | 'supported'
    notes: string
    bfsStreak: number
}

const STORAGE_KEY = 'treequest-progress-v1'

// Demo data so the home page has something to show while you build.
// Change to the commented-out values for a real first visit.
function defaults(): SavedProgress {
    return {
        completed: ['diagnostic', 'trees', 'bst'],          // []
        mastery: { terms: 90, bstProperty: 80, bstSearch: 65, bfs: null, dfs: null }, // all null
        path: 'standard',
        notes: 'Why does a BST get slow if I insert the values already sorted?', // ''
        bfsStreak: 0,
    }
}

let loaded = false

export function useProgress() {
    const state = useState<SavedProgress>('tq-progress', defaults)

    // Load once from localStorage, then save on every change.
    if (import.meta.client && !loaded) {
        loaded = true
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) state.value = { ...defaults(), ...JSON.parse(raw) }
        } catch { /* storage blocked or corrupt: keep defaults */ }
        watch(state, (v) => {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch { /* ignore */ }
        }, { deep: true })
    }

    const learningSteps = STEPS.filter(s => s.key !== 'home')

    const steps = computed(() =>
        STEPS.map((s, i) => ({ ...s, num: i, done: state.value.completed.includes(s.key) })),
    )

    const doneCount = computed(() => learningSteps.filter(s => state.value.completed.includes(s.key)).length)
    const totalSteps = learningSteps.length
    const overallPercent = computed(() => Math.round((doneCount.value / totalSteps) * 100))
    const nextStep = computed(() => learningSteps.find(s => !state.value.completed.includes(s.key)) ?? null)
    const lastDoneStep = computed(() => [...learningSteps].reverse().find(s => state.value.completed.includes(s.key)) ?? null)
    const timeLeft = computed(() =>
        learningSteps.filter(s => !state.value.completed.includes(s.key)).reduce((t, s) => t + s.minutes, 0),
    )

    const concepts = computed(() =>
        CONCEPTS.map((c) => {
            const score = state.value.mastery[c.key]
            const status = score == null ? 'none' : score >= MASTERY_THRESHOLD ? 'mastered' : 'practising'
            return { ...c, score, status } as const
        }),
    )

    const badges = computed(() => {
        const m = state.value.mastery
        return [
            { key: 'root', name: 'Root Explorer', how: 'Finish Lesson 1', earned: state.value.completed.includes('trees') },
            { key: 'queue', name: 'Queue Master', how: 'Predict 5 BFS steps in a row', earned: state.value.bfsStreak >= 5 },
            { key: 'pro', name: 'Traversal Pro', how: 'Master BFS and DFS',
                earned: (m.bfs ?? 0) >= MASTERY_THRESHOLD && (m.dfs ?? 0) >= MASTERY_THRESHOLD },
        ]
    })

    function completeStep(key: StepKey) {
        if (!state.value.completed.includes(key)) state.value.completed.push(key)
    }
    function setMastery(key: ConceptKey, score: number) {
        state.value.mastery[key] = Math.max(0, Math.min(100, Math.round(score)))
    }
    function resetProgress() {
        state.value = { completed: [], mastery: { terms: null, bstProperty: null, bstSearch: null, bfs: null, dfs: null }, path: 'standard', notes: '', bfsStreak: 0 }
    }

    return {
        state,
        steps, doneCount, totalSteps, overallPercent, nextStep, lastDoneStep, timeLeft,
        concepts, badges,
        path: computed(() => state.value.path),
        notes: computed({ get: () => state.value.notes, set: v => { state.value.notes = v } }),
        completeStep, setMastery, resetProgress,
    }
}