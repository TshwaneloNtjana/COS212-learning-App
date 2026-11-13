<!-- Shows every question of a quiz, checks the answers, saves the attempt,
     and explains each answer. Used at the bottom of each lesson and on /quizzes/[id]. -->
<script setup lang="ts">
import type { AnswerValue, Quiz } from '~/types/content'
import type { Attempt } from '~/composables/useProgress'

const props = defineProps<{ quiz: Quiz }>()
const emit = defineEmits<{ submitted: [attempt: Attempt] }>()

const { recordAttempt } = useProgress()

const answers = reactive<Record<string, AnswerValue>>({})
const result = ref<Attempt | null>(null)
let startedAt = Date.now()

function init() {
  for (const k of Object.keys(answers)) delete answers[k]
  for (const q of props.quiz.questions) if (q.type === 'order') answers[q.id] = []
  result.value = null
  startedAt = Date.now()
}
init()
watch(() => props.quiz.id, init)

const checked = computed(() => result.value != null)

const answeredCount = computed(() =>
  props.quiz.questions.filter((q) => {
    const a = answers[q.id]
    return q.type === 'mcq' ? a != null : Array.isArray(a) && a.length === q.answer.length
  }).length,
)
const allAnswered = computed(() => answeredCount.value === props.quiz.questions.length)

// Order questions: tap to place, tap a placed one to remove it and everything after it
function place(qid: string, v: number) {
  if (checked.value) return
  ;(answers[qid] as number[]).push(v)
}
function unplace(qid: string, index: number) {
  if (checked.value) return
  answers[qid] = (answers[qid] as number[]).slice(0, index)
}
const placed = (qid: string) => (answers[qid] as number[] | undefined) ?? []

function check() {
  const seconds = Math.round((Date.now() - startedAt) / 1000)
  result.value = recordAttempt(props.quiz, { ...answers }, seconds)
  emit('submitted', result.value)
}

const passed = computed(() => (result.value?.percent ?? 0) >= props.quiz.passMark)

function optionClass(q: { id: string; answer: string }, optId: string) {
  const chosen = answers[q.id] === optId
  if (checked.value && optId === q.answer) return 'border-[#2E7D4F] bg-[#EEF7F1]'
  if (checked.value && chosen) return 'border-[#B3261E] bg-[#FCEEEC]'
  if (chosen) return 'border-tq-gold bg-[#FFF8DC]'
  return 'border-tq-line bg-white'
}
</script>

<template>
  <div>
    <ol class="flex flex-col gap-7">
      <li v-for="(q, qi) in quiz.questions" :key="q.id">
        <fieldset class="m-0 p-0 border-0">
          <legend class="p-0 mb-3 text-[17px] font-medium leading-snug">{{ qi + 1 }}. {{ q.prompt }}</legend>

          <div v-if="q.tree" class="mb-3 rounded-xl bg-tq-bg border border-tq-line py-3">
            <TreeDiagram :values="q.tree" :width="400" :level-gap="72" :node-size="42" />
          </div>

          <!-- Multiple choice -->
          <v-radio-group
            v-if="q.type === 'mcq'"
            v-model="answers[q.id]"
            :disabled="checked"
            hide-details
            color="primary-darken-1"
            class="tq-options"
          >
            <v-radio
              v-for="o in q.options"
              :key="o.id"
              :value="o.id"
              class="mb-2 rounded-xl border-[1.5px] pr-4 !opacity-100"
              :class="optionClass(q, o.id)"
            >
              <template #label>
                <span class="flex-1 text-[15px] text-tq-ink" :class="q.mono ? 'font-mono' : ''">{{ o.text }}</span>
                <span v-if="checked && o.id === q.answer" class="text-xs font-medium text-[#1F5C38]">Correct answer</span>
                <span v-else-if="checked && answers[q.id] === o.id" class="text-xs font-medium text-[#8C1D18]">Your answer</span>
              </template>
            </v-radio>
          </v-radio-group>

          <!-- Tap in order -->
          <div v-else>
            <div class="text-sm text-tq-muted mb-2">Your order (tap a node to remove it and everything after it)</div>
            <ol
              class="flex flex-wrap gap-2 p-3 rounded-xl border-[1.5px] border-dashed min-h-[68px]"
              :class="checked ? (isCorrect(q, answers[q.id]) ? 'border-[#2E7D4F]' : 'border-[#B3261E]') : 'border-[#C9B26A]'"
              aria-label="Your order"
            >
              <li v-for="(v, i) in placed(q.id)" :key="`${v}-${i}`">
                <button
                  type="button"
                  class="min-w-[52px] h-11 px-3 rounded-full inline-flex items-center gap-1.5 font-medium border-[1.5px]"
                  :class="checked && q.answer[i] !== v ? 'bg-[#FCEEEC] border-[#B3261E] text-[#7A2E1C]' : 'bg-tq-yellow-light border-tq-gold'"
                  :aria-label="`Position ${i + 1}: ${v}. Remove`"
                  :disabled="checked"
                  @click="unplace(q.id, i)"
                >
                  <span class="text-xs opacity-70">{{ i + 1 }}.</span>{{ v }}
                </button>
              </li>
              <li v-for="i in q.answer.length - placed(q.id).length" :key="`empty-${i}`" aria-hidden="true">
                <span class="min-w-[52px] h-11 rounded-full bg-[#F7F2E2] inline-flex items-center justify-center text-sm text-tq-muted">
                  {{ placed(q.id).length + i }}
                </span>
              </li>
            </ol>
            <div v-if="!checked" class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="v in q.choices.filter(c => !placed(q.id).includes(c))"
                :key="v"
                type="button"
                class="min-w-[52px] h-11 px-3 rounded-full bg-white border-[1.5px] border-gray-500 font-medium hover:bg-tq-yellow-light"
                :aria-label="`Place ${v} next`"
                @click="place(q.id, v)"
              >{{ v }}</button>
            </div>
            <div v-if="checked && !isCorrect(q, answers[q.id])" class="mt-2 text-sm">
              Correct order: <span class="font-mono font-medium">{{ q.answer.join(', ') }}</span>
            </div>
          </div>

          <v-alert
            v-if="checked"
            class="mt-3"
            variant="tonal"
            density="comfortable"
            :type="isCorrect(q, answers[q.id]) ? 'success' : 'warning'"
            :text="`${isCorrect(q, answers[q.id]) ? 'Correct.' : 'Not quite.'} ${q.explanation}`"
          />
        </fieldset>
      </li>
    </ol>

    <v-alert
      v-if="result"
      class="mt-7"
      variant="tonal"
      :type="passed ? 'success' : 'warning'"
      :title="`You scored ${result.score} of ${result.total} (${result.percent}%)`"
    >
      <template v-if="passed">Nice work. This attempt is saved in Quizzes.</template>
      <template v-else>
        Below {{ quiz.passMark }}%. Read the explanations above, review the lesson, then try again.
        Anything still unclear can go in your Notes.
      </template>
    </v-alert>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <template v-if="!checked">
        <v-btn color="primary" flat size="large" :disabled="!allAnswered" @click="check">Check answers</v-btn>
        <span class="text-sm text-tq-muted">{{ answeredCount }} of {{ quiz.questions.length }} answered</span>
      </template>
      <template v-else>
        <v-btn variant="outlined" color="primary-darken-1" size="large" @click="init">Try again</v-btn>
        <slot name="after-result" :passed="passed" />
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Let each radio fill its row like a card */
.tq-options :deep(.v-selection-control) { min-height: 52px; }
.tq-options :deep(.v-label) { width: 100%; gap: 12px; opacity: 1; }
</style>
