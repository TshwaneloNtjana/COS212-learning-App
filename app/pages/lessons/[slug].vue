<!-- One lesson: theory sections from lessons.json, then its practice quiz. -->
<script setup lang="ts">
const route = useRoute()
const { lessons, getLesson, getQuiz } = useContent()
const { markVisited, lessonStatus } = useProgress()

const lesson = computed(() => getLesson(String(route.params.slug)))
if (!lesson.value) {
  throw createError({ statusCode: 404, statusMessage: 'Lesson not found', fatal: true })
}
const quiz = computed(() => (lesson.value ? getQuiz(lesson.value.quizId) : undefined))
const next = computed(() => lessons.find(l => l.number === (lesson.value?.number ?? 0) + 1))

useHead(() => ({ title: `Lesson ${lesson.value?.number}: ${lesson.value?.title} · Mainframe` }))

watchEffect(() => { if (lesson.value) markVisited(lesson.value.slug) })

const noteTopic = computed(() => `Lesson ${lesson.value?.number} · ${lesson.value?.short}`)
</script>

<template>
  <div v-if="lesson" class="mx-auto max-w-[920px] flex flex-col gap-7">
    <!-- Lesson switcher -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Choose a lesson" class="inline-flex rounded-full border border-[#C9B26A] bg-white overflow-hidden">
        <NuxtLink
          v-for="(l, i) in lessons"
          :key="l.slug"
          :to="`/lessons/${l.slug}`"
          class="inline-flex items-center gap-1.5 min-h-[42px] px-4 text-sm font-medium no-underline"
          :class="[
            l.slug === lesson.slug ? 'bg-tq-yellow text-tq-ink' : 'text-[#3D3520] hover:bg-tq-yellow-light',
            i > 0 ? 'border-l border-[#C9B26A]' : '',
          ]"
          :aria-current="l.slug === lesson.slug ? 'page' : undefined"
        >
          <v-icon v-if="lessonStatus(l.slug) === 'done' && l.slug !== lesson.slug" icon="mdi-check" color="success" size="16" />
          {{ l.number }} {{ l.short }}
        </NuxtLink>
      </nav>
      <span class="text-sm text-tq-muted">About {{ lesson.minutes }} min · then a {{ quiz?.questions.length }}-question practice quiz</span>
    </div>

    <!-- Header -->
    <header>
      <div class="text-xs font-bold tracking-widest uppercase text-tq-gold">Lesson {{ lesson.number }} · {{ lesson.short }}</div>
      <h1 class="mt-2 mb-3 text-[30px] sm:text-[34px] leading-tight font-medium">{{ lesson.title }}</h1>
      <p class="rich max-w-[720px] text-[17px] leading-relaxed text-[#2E2818]" v-html="lesson.intro" />
      <div class="mt-4 flex flex-wrap gap-2">
        <a
          v-for="s in lesson.sections"
          :key="s.id"
          :href="`#${s.id}`"
          class="text-[13px] px-3 py-1.5 rounded-full bg-white border border-tq-line no-underline text-[#3D3520] hover:bg-tq-yellow-light"
        >{{ s.heading }}</a>
        <a href="#practice" class="text-[13px] px-3 py-1.5 rounded-full bg-tq-yellow no-underline text-tq-ink font-medium">Practice quiz</a>
      </div>
    </header>

    <!-- Theory -->
    <v-card v-for="s in lesson.sections" :id="s.id" :key="s.id" class="p-6 sm:p-7 scroll-mt-24">
      <h2 class="text-[22px] font-medium mb-4">{{ s.heading }}</h2>
      <div class="flex flex-col gap-4">
        <LessonBlock v-for="(b, i) in s.blocks" :key="i" :block="b" />
      </div>
    </v-card>

    <div class="flex flex-wrap items-center gap-3 px-5 py-4 rounded-xl border-[1.5px] border-dashed border-[#C9B26A]">
      <span class="flex-[999_1_260px] text-[15px] text-[#3D3520]">Something not clear? Write it down to ask in class.</span>
      <v-btn :to="{ path: '/notes', query: { topic: noteTopic } }" variant="text" color="primary-darken-1" prepend-icon="mdi-plus">Add a note</v-btn>
    </div>

    <!-- Practice quiz -->
    <v-card v-if="quiz" id="practice" class="p-6 sm:p-7 scroll-mt-24 !border-2 !border-tq-yellow">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <h2 class="text-[22px] font-medium">Practice quiz</h2>
        <span class="text-sm text-tq-muted">{{ quiz.questions.length }} questions · not timed · saved to Quizzes</span>
      </div>
      <p class="mt-2 mb-6 text-base text-[#2E2818]">Answer all the questions, then check.</p>

      <QuizRunner :quiz="quiz">
        <template #after-result>
          <v-btn v-if="next" :to="`/lessons/${next.slug}`" color="primary" flat size="large" append-icon="mdi-arrow-right">
            Next: Lesson {{ next.number }}
          </v-btn>
          <v-btn v-else to="/summary" color="primary" flat size="large" append-icon="mdi-arrow-right">See the summary</v-btn>
        </template>
      </QuizRunner>
    </v-card>
  </div>
</template>
