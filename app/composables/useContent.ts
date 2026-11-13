// Loads lessons and quizzes from the JSON files in app/data.
import lessonsJson from '~/data/lessons.json'
import quizzesJson from '~/data/quizzes.json'
import type { Lesson, Quiz } from '~/types/content'

const lessons = lessonsJson as unknown as Lesson[]
const quizzes = quizzesJson as unknown as Quiz[]

export function useContent() {
  const getLesson = (slug: string) => lessons.find(l => l.slug === slug)
  const getQuiz = (id: string) => quizzes.find(q => q.id === id)
  const quizForLesson = (slug: string) => quizzes.find(q => q.lessonSlug === slug)
  const lessonForQuiz = (quiz: Quiz) => (quiz.lessonSlug ? getLesson(quiz.lessonSlug) : undefined)
  return { lessons, quizzes, getLesson, getQuiz, quizForLesson, lessonForQuiz }
}
