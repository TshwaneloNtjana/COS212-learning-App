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
  | { type: 'video'; title: string; src: string; captions: string; poster?: string; minutes?: number; transcript: string[] }

export interface Section {
  id: string
  heading: string
  blocks: Block[]
}

export interface Lesson {
  slug: string
  number: number
  title: string
  short: string
  minutes: number
  quizId: string
  intro: string
  sections: Section[]
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
