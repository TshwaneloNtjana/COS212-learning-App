<!-- Dashboard -->
<script setup lang="ts">
useHead({ title: 'Dashboard · Mainframe' })

const { lessons, quizzes, getQuiz } = useContent()
const {
  nextLesson, lessonsDone, lessonStatus, bestFor, attemptsFor,
  quizzesAttempted, averageBest, recentAttempts, openNotes,
} = useProgress()

const started = computed(() => lessons.some(l => lessonStatus(l.slug) !== 'new'))

const heading = computed(() => {
  if (!nextLesson.value) return 'You’re ready for the lecture.'
  if (!started.value) return 'Welcome to Mainframe.'
  return `Welcome back. Lesson ${nextLesson.value.number} is next.`
})

const intro = computed(() => {
  if (!nextLesson.value) return 'You’ve finished every lesson. Try the final check, read the summary and look over your notes before class.'
  if (!started.value) return 'Before your lecture on trees, you’ll learn what a binary search tree is and how breadth-first search (BFS) walks through one. Each lesson ends with a short practice quiz. Your progress is saved on this device.'
  return `You’ve finished ${lessonsDone.value} of ${lessons.length} lessons. Next up is Lesson ${nextLesson.value.number} (about ${nextLesson.value.minutes} minutes), then its short practice quiz.`
})

const lessonCards = computed(() => lessons.map((l) => {
  const status = lessonStatus(l.slug)
  const best = bestFor(l.quizId)
  return {
    ...l,
    status,
    statusText: { done: 'Completed', started: 'In progress', new: 'Not started' }[status],
    chipColor: { done: 'success', started: 'primary', new: undefined }[status],
    progress: { done: 100, started: 50, new: 0 }[status],
    quizText: best == null ? 'Quiz not taken' : `Quiz best ${best}%`,
  }
}))

const recent = computed(() => recentAttempts.value.slice(0, 3).map((a) => {
  const quiz = getQuiz(a.quizId)
  const pass = a.percent >= (quiz?.passMark ?? 70)
  return {
    ...a,
    title: quiz?.title ?? a.quizId,
    when: `${formatDay(a.at)} · attempt ${attemptsFor(a.quizId).length - attemptsFor(a.quizId).findIndex(x => x.id === a.id)}`,
    pass,
  }
}))
</script>

<template>
  <div class="mx-auto max-w-[1080px] flex flex-col gap-6">
    <!-- What's next -->
    <section class="rounded-2xl bg-tq-yellow-light p-6 sm:p-8 flex flex-wrap items-center gap-6">
      <div class="flex-[999_1_420px] min-w-0">
        <div class="text-xs font-bold tracking-widest uppercase text-tq-gold">Before your COS 212 lecture</div>
        <h1 class="mt-2 mb-3 text-[28px] sm:text-[32px] leading-tight font-medium">{{ heading }}</h1>
        <p class="mb-6 max-w-xl text-base leading-relaxed text-[#3D3520]">{{ intro }}</p>
        <div class="flex flex-wrap gap-3">
          <v-btn
            v-if="nextLesson"
            :to="`/lessons/${nextLesson.slug}`"
            color="primary"
            size="large"
            flat
            append-icon="mdi-arrow-right"
          >
            {{ started ? `Continue Lesson ${nextLesson.number}` : 'Start Lesson 1' }}
          </v-btn>
          <v-btn v-else to="/quizzes/final" color="primary" size="large" flat append-icon="mdi-arrow-right">
            Take the final check
          </v-btn>
          <v-btn to="/quizzes" variant="outlined" color="primary-darken-1" size="large" class="bg-white">See my quizzes</v-btn>
        </div>
      </div>
      <div class="flex-[1_1_220px] flex justify-center" aria-hidden="true">
        <TreeDiagram :values="[50, 30, 70, 20, 40, 60, 80]" :current="50" :visited="[30, 70]" :frontier="[20, 40, 60, 80]" :width="240" :level-gap="56" :node-size="36" />
      </div>
    </section>

    <!-- Stats -->
    <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <v-card class="p-5">
        <div class="text-[13px] text-tq-muted">Lessons done</div>
        <div class="mt-1 text-[28px] font-medium">{{ lessonsDone }} <span class="text-base font-normal text-tq-muted">of {{ lessons.length }}</span></div>
      </v-card>
      <v-card class="p-5">
        <div class="text-[13px] text-tq-muted">Quizzes attempted</div>
        <div class="mt-1 text-[28px] font-medium">{{ quizzesAttempted }} <span class="text-base font-normal text-tq-muted">of {{ quizzes.length }}</span></div>
      </v-card>
      <v-card class="p-5">
        <div class="text-[13px] text-tq-muted">Average best score</div>
        <div class="mt-1 text-[28px] font-medium">{{ averageBest == null ? '–' : `${averageBest}%` }}</div>
      </v-card>
      <v-card class="p-5">
        <div class="text-[13px] text-tq-muted">Open notes</div>
        <div class="mt-1 text-[28px] font-medium">{{ openNotes.length }}</div>
      </v-card>
    </div>

    <!-- Lessons -->
    <section aria-labelledby="lessons-h">
      <div class="flex items-baseline justify-between gap-3 mb-3">
        <h2 id="lessons-h" class="text-xl font-medium">Lessons</h2>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <v-card
          v-for="l in lessonCards"
          :key="l.slug"
          :to="`/lessons/${l.slug}`"
          class="p-6"
          :class="l.status === 'started' ? '!border-2 !border-tq-yellow' : ''"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold tracking-widest uppercase text-tq-gold">Lesson {{ l.number }}</span>
            <v-chip size="small" :color="l.chipColor" :variant="l.status === 'started' ? 'flat' : 'tonal'">{{ l.statusText }}</v-chip>
          </div>
          <div class="mt-2.5 mb-1.5 text-lg font-medium">{{ l.title }}</div>
          <div class="rich text-sm leading-normal text-tq-muted line-clamp-2" v-html="l.intro" />
          <div class="mt-4 flex items-center gap-2.5">
            <v-progress-linear
              :model-value="l.progress"
              :color="l.status === 'done' ? 'success' : 'primary'"
              bg-color="#F1EAD3"
              :bg-opacity="1"
              height="8"
              rounded
              :aria-label="`${l.title} progress`"
            />
            <span class="text-[13px] whitespace-nowrap">{{ l.quizText }}</span>
          </div>
        </v-card>
      </div>
    </section>

    <div class="flex flex-wrap items-start gap-6">
      <!-- Recent attempts -->
      <v-card class="flex-[2_1_420px] min-w-0 p-6" aria-labelledby="recent-h">
        <div class="flex items-baseline justify-between gap-3 mb-2">
          <h2 id="recent-h" class="text-lg font-medium">Recent quiz attempts</h2>
          <NuxtLink to="/quizzes" class="text-sm font-medium text-tq-gold">View all</NuxtLink>
        </div>
        <ul v-if="recent.length">
          <li v-for="r in recent" :key="r.id" class="flex items-center gap-3.5 py-3.5 border-t border-[#F1EAD3]">
            <span
              class="w-13 h-13 flex-none rounded-xl flex items-center justify-center text-[15px] font-bold"
              :class="r.pass ? 'bg-[#E3F1E8] text-[#1F5C38]' : 'bg-[#FFE7D1] text-[#8A3B00]'"
            >{{ r.percent }}%</span>
            <div class="flex-1 min-w-0">
              <div class="text-[15px] font-medium">{{ r.title }}</div>
              <div class="text-[13px] text-tq-muted">{{ r.when }}</div>
            </div>
            <v-btn :to="r.pass ? '/quizzes' : `/quizzes/${r.quizId}`" variant="outlined" color="primary-darken-1">{{ r.pass ? 'Review' : 'Retake' }}</v-btn>
          </li>
        </ul>
        <p v-else class="py-4 text-[15px] text-tq-muted">No attempts yet. Each lesson ends with a short practice quiz.</p>
      </v-card>

      <!-- Notes preview -->
      <v-card class="flex-[1_1_280px] min-w-0 p-6" aria-labelledby="notes-h">
        <h2 id="notes-h" class="text-lg font-medium mb-3">Questions for class</h2>
        <ul v-if="openNotes.length" class="flex flex-col gap-2.5 mb-4">
          <li v-for="n in openNotes.slice(0, 2)" :key="n.id" class="p-3 rounded-lg bg-tq-bg border border-[#F1EAD3] text-sm leading-snug">
            {{ n.text }}
          </li>
        </ul>
        <p v-else class="mb-4 text-sm text-tq-muted">Nothing yet. Add a question whenever something doesn’t make sense.</p>
        <v-btn to="/notes" variant="outlined" color="primary-darken-1">Open notes</v-btn>
      </v-card>
    </div>
  </div>
</template>
