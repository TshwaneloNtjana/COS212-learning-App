<!-- Step through BFS or one of the three DFS orders, showing the queue/stack,
     the visit order and the highlighted pseudocode line. -->
<script setup lang="ts">
import type { Order } from '~/utils/bst'

const props = defineProps<{ values: number[] }>()
const { announce, settings } = useA11y()

const order = ref<Order>('bfs')
const step = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const steps = computed(() => traceTraversal(props.values, order.value))
const total = computed(() => steps.value.length - 1)
const s = computed(() => steps.value[step.value]!)
const isBfs = computed(() => order.value === 'bfs')
const code = computed(() => PSEUDOCODE[order.value])

const tabs: { value: Order; label: string }[] = [
  { value: 'bfs', label: 'BFS' },
  { value: 'pre', label: 'Pre-order' },
  { value: 'in', label: 'In-order' },
  { value: 'post', label: 'Post-order' },
]

function stop() {
  if (timer) clearInterval(timer)
  timer = null
  playing.value = false
}
function togglePlay() {
  if (playing.value) return stop()
  if (step.value >= total.value) step.value = 0
  playing.value = true
  timer = setInterval(() => {
    if (step.value >= total.value) stop()
    else step.value++
  }, settings.value.reduceMotion || settings.value.readAloud ? 3500 : 1600)
}
const back = () => { stop(); step.value = Math.max(0, step.value - 1) }
const forward = () => { step.value = Math.min(total.value, step.value + 1) }
const restart = () => { stop(); step.value = 0 }

watch(order, () => { stop(); step.value = 0 })

// Announce every step (screen readers, and spoken if "Read steps aloud" is on)
const stepText = computed(() => {
  const st = s.value
  const what = isBfs.value ? 'Queue' : 'Stack'
  return `Step ${step.value} of ${total.value}. ${st.message} ${what}: ${st.frontier.length ? st.frontier.join(', ') : 'empty'}. Visited so far: ${st.output.length ? st.output.join(', ') : 'none'}.`
})
watch([step, order], () => announce(stepText.value))

function onKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement).closest('[role="tablist"]')) return
  if (e.key === 'ArrowRight') { e.preventDefault(); forward() }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); back() }
  else if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'BUTTON') { e.preventDefault(); togglePlay() }
}
onBeforeUnmount(stop)
</script>

<template>
  <section class="rounded-2xl border border-tq-line bg-white overflow-hidden" aria-label="Traversal stepper" @keydown="onKey">
    <v-tabs v-model="order" color="primary-darken-1" class="border-b border-tq-line px-3" aria-label="Choose a traversal">
      <v-tab v-for="t in tabs" :key="t.value" :value="t.value">{{ t.label }}</v-tab>
    </v-tabs>

    <div class="flex flex-wrap">
      <div class="flex-[999_1_420px] min-w-0 py-6">
        <TreeDiagram
          :values="values"
          :current="s.current"
          :frontier="s.frontier"
          :visited="s.output"
          :frontier-word="isBfs ? 'waiting in the queue' : 'on the call stack'"
          :label="`Traversal tree, step ${step} of ${total}.`"
        />
      </div>

      <div class="flex-[1_1_260px] min-w-0 p-5 border-l border-tq-line bg-[#FFFDF6] flex flex-col gap-5">
        <div>
          <div class="text-sm font-medium">{{ isBfs ? 'Queue' : 'Call stack' }}</div>
          <div class="text-xs text-tq-muted mb-2">
            {{ isBfs ? 'front ← first in, first out' : 'bottom → top (top is running now)' }}
          </div>
          <div class="min-h-11 flex flex-wrap gap-1.5 items-center p-1.5 rounded-lg border border-tq-line bg-white">
            <span
              v-for="v in s.frontier"
              :key="v"
              class="min-w-9 h-8 px-1.5 rounded-md inline-flex items-center justify-center text-sm font-medium bg-tq-blue-light border-2 border-dashed border-tq-blue text-[#1E3557]"
            >{{ v }}</span>
            <span v-if="!s.frontier.length" class="text-sm text-tq-muted px-1.5">empty</span>
          </div>
        </div>

        <div>
          <div class="text-sm font-medium mb-2">Visit order</div>
          <div class="font-mono text-[15px] leading-normal">
            {{ s.output.length ? s.output.join(' → ') : 'Nothing yet' }}
          </div>
        </div>

        <div>
          <div class="text-sm font-medium mb-2">Pseudocode</div>
          <div class="font-mono text-[13px] leading-relaxed rounded-lg bg-tq-bg py-1.5 overflow-x-auto" tabindex="0" role="region" :aria-label="`Pseudocode, line ${s.line} highlighted`">
            <div
              v-for="(line, i) in code"
              :key="i"
              class="whitespace-pre px-3"
              :class="i + 1 === s.line ? 'bg-tq-yellow-light font-medium shadow-[inset_4px_0_0_#1F1A0A]' : ''"
              :aria-current="i + 1 === s.line ? 'step' : undefined"
            ><span class="inline-block w-5 text-tq-muted">{{ i + 1 }}</span>{{ line }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-5 px-4 py-3.5 rounded-xl bg-tq-yellow-light text-[15px] leading-normal">
      {{ s.message }}
    </div>

    <div class="flex flex-wrap items-center gap-1.5 px-4 py-4">
      <v-btn icon="mdi-restart" variant="text" aria-label="Restart" :disabled="step === 0" @click="restart" />
      <v-btn icon="mdi-skip-previous" variant="text" aria-label="Step back" aria-keyshortcuts="ArrowLeft" :disabled="step === 0" @click="back" />
      <v-btn
        :icon="playing ? 'mdi-pause' : 'mdi-play'"
        color="primary"
        flat
        :aria-label="playing ? 'Pause' : 'Play'"
        @click="togglePlay"
      />
      <v-btn icon="mdi-skip-next" variant="text" aria-label="Step forward" aria-keyshortcuts="ArrowRight" :disabled="step === total" @click="forward" />
      <span class="ml-2 text-sm text-gray-700">Step {{ step }} of {{ total }}</span>
      <span class="ml-auto text-xs text-tq-muted hidden sm:inline">Keys: ← → step, Space play</span>
    </div>
  </section>
</template>
