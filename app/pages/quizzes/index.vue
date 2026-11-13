<!-- All quizzes, with past attempts and a review of the latest one. -->
<script setup lang="ts">
import type { Quiz } from '~/types/content'

useHead({ title: 'Quizzes · TreeQuest' })

const { quizzes, lessonForQuiz } = useContent()
const { attemptsFor, bestFor, isLocked, quizzesAttempted, averageBest, state } = useProgress()

type Filter = 'all' | 'done' | 'todo' | 'retry'
const filter = ref<Filter>('all')
const open = ref<string | null>(null)

function statusOf(q: Quiz): 'locked' | 'todo' | 'passed' | 'retry' {
  const best = bestFor(q.id)
  if (isLocked(q)) return 'locked'
  if (best == null) return 'todo'
  return best >= q.passMark ? 'passed' : 'retry'
}

const rows = computed(() => quizzes.map((q) => {
  const attempts = attemptsFor(q.id)
  const status = statusOf(q)
  const lesson = lessonForQuiz(q)
  return {
    quiz: q,
    attempts,
    best: bestFor(q.id),
    status,
    subtitle: [
      lesson ? `Lesson ${lesson.number}: ${lesson.title}` : q.description,
      `${q.questions.length} questions`,
      attempts.length ? `${attempts.length} attempt${attempts.length > 1 ? 's' : ''}, last ${formatDay(attempts[0]!.at)}` : null,
    ].filter(Boolean).join(' · '),
  }
}))

const counts = computed(() => ({
  all: rows.value.length,
  done: rows.value.filter(r => r.attempts.length).length,
  todo: rows.value.filter(r => !r.attempts.length).length,
  retry: rows.value.filter(r => r.status === 'retry').length,
}))

const shown = computed(() => rows.value.filter((r) => {
  if (filter.value === 'done') return r.attempts.length > 0
  if (filter.value === 'todo') return r.attempts.length === 0
  if (filter.value === 'retry') return r.status === 'retry'
  return true
}))

const passedCount = computed(() => rows.value.filter(r => r.status === 'passed').length)

const statusChip = {
  locked: { text: 'Locked', color: undefined },
  todo: { text: 'Not started', color: undefined },
  passed: { text: 'Passed', color: 'success' },
  retry: { text: 'Retake suggested', color: 'warning' },
} as const

function actionFor(r: (typeof rows.value)[number]) {
  if (r.status === 'locked') return { text: 'Finish all lessons first', to: '/lessons', variant: 'outlined' as const }
  const to = r.quiz.lessonSlug ? `/lessons/${r.quiz.lessonSlug}#practice` : `/quizzes/${r.quiz.id}`
  if (r.status === 'todo') return { text: 'Start quiz', to, variant: 'flat' as const }
  return { text: 'Retake', to: `/quizzes/${r.quiz.id}`, variant: r.status === 'retry' ? 'flat' as const : 'outlined' as const }
}
</script>

<template>
  <div class="mx-auto max-w-[1000px] flex flex-col gap-6">
    <div>
      <h1 class="text-[32px] font-medium mb-1.5">Quizzes</h1>
      <p class="text-base text-[#3D3520] leading-normal">
        Every quiz in one place: the practice quiz from each lesson, a warm-up and the final check.
        Past attempts are kept so you can review or retake them.
      </p>
    </div>

    <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <v-card class="p-5"><div class="text-[13px] text-tq-muted">Attempted</div><div class="mt-1 text-[26px] font-medium">{{ quizzesAttempted }} <span class="text-[15px] font-normal text-tq-muted">of {{ quizzes.length }}</span></div></v-card>
      <v-card class="p-5"><div class="text-[13px] text-tq-muted">Passed (70%+)</div><div class="mt-1 text-[26px] font-medium">{{ passedCount }}</div></v-card>
      <v-card class="p-5"><div class="text-[13px] text-tq-muted">Average best</div><div class="mt-1 text-[26px] font-medium">{{ averageBest == null ? '–' : `${averageBest}%` }}</div></v-card>
      <v-card class="p-5"><div class="text-[13px] text-tq-muted">Total attempts</div><div class="mt-1 text-[26px] font-medium">{{ state.attempts.length }}</div></v-card>
    </div>

    <v-chip-group v-model="filter" mandatory selected-class="bg-primary text-on-primary" aria-label="Filter quizzes">
      <v-chip value="all" variant="outlined">All ({{ counts.all }})</v-chip>
      <v-chip value="done" variant="outlined">Attempted ({{ counts.done }})</v-chip>
      <v-chip value="todo" variant="outlined">Not started ({{ counts.todo }})</v-chip>
      <v-chip value="retry" variant="outlined">Needs a retake ({{ counts.retry }})</v-chip>
    </v-chip-group>

    <v-card class="overflow-hidden">
      <ul>
        <li v-for="r in shown" :key="r.quiz.id" class="border-t border-[#F1EAD3] first:border-t-0">
          <div class="flex flex-wrap items-center gap-4 px-6 py-4.5">
            <span
              class="w-15 h-15 flex-none rounded-2xl flex items-center justify-center text-base font-bold"
              :class="r.best == null
                ? 'bg-[#FFFDF6] text-[#8A7E5C] border-2 border-dashed border-[#C9B26A]'
                : r.status === 'passed' ? 'bg-[#E3F1E8] text-[#1F5C38]' : 'bg-[#FFE7D1] text-[#8A3B00]'"
            >{{ r.best == null ? '–' : `${r.best}%` }}</span>

            <div class="flex-[999_1_240px] min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-base font-medium">{{ r.quiz.title }}</span>
                <v-chip size="small" variant="tonal" :color="statusChip[r.status].color">{{ statusChip[r.status].text }}</v-chip>
              </div>
              <div class="mt-1 text-[13px] text-tq-muted">{{ r.subtitle }}</div>
            </div>

            <div class="flex flex-1 flex-wrap justify-end gap-2">
              <v-btn
                v-if="r.attempts.length"
                variant="text"
                color="primary-darken-1"
                :aria-expanded="open === r.quiz.id"
                @click="open = open === r.quiz.id ? null : r.quiz.id"
              >
                {{ open === r.quiz.id ? 'Hide attempts' : 'View attempts' }}
              </v-btn>
              <v-btn
                :to="actionFor(r).to"
                :variant="actionFor(r).variant"
                :color="actionFor(r).variant === 'flat' ? 'primary' : 'primary-darken-1'"
                :disabled="r.status === 'locked'"
              >{{ actionFor(r).text }}</v-btn>
            </div>
          </div>

          <!-- Attempt history + review of the latest attempt -->
          <div v-if="open === r.quiz.id" class="px-6 pb-6 flex flex-col gap-4">
            <v-table density="comfortable" class="border border-[#F1EAD3] rounded-xl">
              <thead>
                <tr><th>Attempt</th><th>Date</th><th>Score</th><th>Time</th><th>Result</th></tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in r.attempts" :key="a.id">
                  <td>{{ r.attempts.length - i }}</td>
                  <td>{{ formatDateTime(a.at) }}</td>
                  <td class="font-medium">{{ a.score }}/{{ a.total }} ({{ a.percent }}%)</td>
                  <td>{{ formatDuration(a.seconds) }}</td>
                  <td>
                    <v-chip size="small" variant="tonal" :color="a.percent >= r.quiz.passMark ? 'success' : 'warning'">
                      {{ a.percent >= r.quiz.passMark ? 'Passed' : `Below ${r.quiz.passMark}%` }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div>
              <div class="text-[15px] font-medium mb-2.5">Latest attempt: question review</div>
              <ul class="flex flex-col gap-2">
                <li
                  v-for="q in r.quiz.questions"
                  :key="q.id"
                  class="flex gap-3 items-start p-3.5 rounded-xl border"
                  :class="isCorrect(q, r.attempts[0]!.answers[q.id]) ? 'bg-[#F3FAF5] border-[#CFE6D7]' : 'bg-[#FFF8EC] border-[#F0D9B0]'"
                >
                  <v-icon
                    :icon="isCorrect(q, r.attempts[0]!.answers[q.id]) ? 'mdi-check-circle' : 'mdi-close-circle'"
                    :color="isCorrect(q, r.attempts[0]!.answers[q.id]) ? 'success' : 'error'"
                    :aria-label="isCorrect(q, r.attempts[0]!.answers[q.id]) ? 'Correct' : 'Incorrect'"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-[15px] font-medium">{{ q.prompt }}</div>
                    <div class="text-sm text-[#3D3520] mt-0.5">
                      You answered: {{ answerText(q, r.attempts[0]!.answers[q.id]) }}
                      <template v-if="!isCorrect(q, r.attempts[0]!.answers[q.id])"> · Correct: {{ correctText(q) }}</template>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
      <p v-if="!shown.length" class="p-6 text-[15px] text-tq-muted">No quizzes match this filter.</p>
    </v-card>
  </div>
</template>
