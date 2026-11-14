<!-- Take or retake any quiz on its own page (warm-up, final check, retakes). -->
<script setup lang="ts">
const route = useRoute()
const { getQuiz, lessonForQuiz } = useContent()
const { isLocked, bestFor, attemptsFor } = useProgress()

const quiz = computed(() => getQuiz(String(route.params.id)))
if (!quiz.value) {
  throw createError({ statusCode: 404, statusMessage: 'Quiz not found', fatal: true })
}
const lesson = computed(() => (quiz.value ? lessonForQuiz(quiz.value) : undefined))
const locked = computed(() => (quiz.value ? isLocked(quiz.value) : true))

useHead(() => ({ title: `${quiz.value?.title} · MainFrame` }))
</script>

<template>
  <div v-if="quiz" class="mx-auto max-w-[860px] flex flex-col gap-6">
    <v-btn to="/quizzes" variant="text" color="primary-darken-1" prepend-icon="mdi-arrow-left" class="self-start -ml-3">All quizzes</v-btn>

    <div>
      <div class="text-xs font-bold tracking-widest uppercase text-tq-gold">
        {{ lesson ? `Lesson ${lesson.number} · Practice quiz` : quiz.kind === 'final' ? 'Final check' : 'Warm-up' }}
      </div>
      <h1 class="mt-2 mb-2 text-[30px] font-medium">{{ quiz.title }}</h1>
      <p class="text-base text-[#3D3520]">
        {{ quiz.description }} {{ quiz.questions.length }} questions, pass mark {{ quiz.passMark }}%.
        <template v-if="bestFor(quiz.id) != null">
          Your best so far: <strong class="font-medium">{{ bestFor(quiz.id) }}%</strong> ({{ attemptsFor(quiz.id).length }} attempts).
        </template>
      </p>
    </div>

    <v-alert v-if="locked" type="info" variant="tonal" title="Not unlocked yet">
      Finish the practice quiz in every lesson to unlock the final check.
      <template #append><v-btn to="/lessons" color="primary" flat>Go to lessons</v-btn></template>
    </v-alert>

    <v-card v-else class="p-6 sm:p-7">
      <QuizRunner :quiz="quiz">
        <template #after-result>
          <v-btn v-if="lesson" :to="`/lessons/${lesson.slug}`" variant="text" color="primary-darken-1">Review Lesson {{ lesson.number }}</v-btn>
          <v-btn to="/quizzes" color="primary" flat size="large">Back to quizzes</v-btn>
        </template>
      </QuizRunner>
    </v-card>
  </div>
</template>
