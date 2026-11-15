// Shapes of the data in app/data/lessons.json and app/data/quizzes.json.
// Text fields marked "html" may contain <strong>, <em> and <code>.

export interface CompareCard {
  tone: 'blue' | 'yellow'
  label: string
  title: string
  html: string
  items?: string[]
  example?: string
}

export type Block =
  | { type: 'p'; html: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; html: string }
  | { type: 'compare'; cards: CompareCard[] }
  | { type: 'tree'; values: number[]; caption?: string }
  | { type: 'code'; text: string }
  | { type: 'bst-search'; values: number[]; target?: number }
  | { type: 'traversal-stepper'; values: number[] }

export interface Section {
  id: string
  heading: string
  blocks: Block[]
}

export interface Video {
  id: string // YouTube video id, e.g. "HZ5YTanv5QE"
  title: string
  channel: string
  length?: string // e.g. "3:59"
  note?: string // why it's worth watching
}

export interface Resource {
  title: string
  url: string
  source: string // e.g. "GeeksforGeeks"
  note?: string
  level?: 'Basic' | 'Easy' | 'Medium' | 'Hard'
}

export type ProblemLevel = 'Basic' | 'Easy' | 'Medium'

/** Self-check problems. For tree kinds the answer is computed from the values, so it is always right. */
export type Problem =
  | { id: string; level: ProblemLevel; title: string; kind: 'height' | 'leaves' | 'min-max' | 'bfs-order'; values: number[] }
  | { id: string; level: ProblemLevel; title: string; kind: 'search-path'; values: number[]; target: number }
  | { id: string; level: ProblemLevel; title: string; kind: 'text'; prompt: string; answer: string; tree?: number[] }

export interface Lesson {
  slug: string
  number: number
  title: string
  short: string
  minutes: number
  quizId: string
  intro: string
  sections: Section[]
  problems?: Problem[]
  videos?: Video[]
  practiceLinks?: Resource[] // problems on other sites
  resources?: Resource[] // further reading
  summary: {
    points: string[]
    terms: string[]
    example?: { title: string; lines: string[]; caption?: string }
  }
}

export interface Option {
  id: string
  text: string
}

export type Question =
  | {
      id: string
      type: 'mcq'
      prompt: string
      tree?: number[]
      mono?: boolean
      options: Option[]
      answer: string
      explanation: string
    }
  | {
      id: string
      type: 'order'
      prompt: string
      tree?: number[]
      choices: number[]
      answer: number[]
      explanation: string
    }

export type AnswerValue = string | number[]

export interface Quiz {
  id: string
  title: string
  description: string
  lessonSlug: string | null
  kind: 'warmup' | 'practice' | 'final'
  passMark: number
  questions: Question[]
}
