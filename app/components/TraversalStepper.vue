<!-- Step through breadth-first search, showing the queue,
     the visit order and the highlighted pseudocode line. -->
<script setup lang="ts">
const props = defineProps<{ values: number[] }>()

const step = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const steps = computed(() => traceBfs(props.values))
const total = computed(() => steps.value.length - 1)
const s = computed(() => steps.value[step.value]!)

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
  }, 1200)
}
const back = () => { stop(); step.value = Math.max(0, step.value - 1) }
const forward = () => { step.value = Math.min(total.value, step.value + 1) }
const restart = () => { stop(); step.value = 0 }

watch(() => props.values, () => { stop(); step.value = 0 })
onBeforeUnmount(stop)
</script>

<template>
  <div class="rounded-2xl border border-tq-line bg-white overflow-hidden">
    <div class="flex flex-wrap">
      <div class="flex-[999_1_420px] min-w-0 py-6">
        <TreeDiagram
          :values="values"
          :current="s.current"
          :frontier="s.queue"
          :visited="s.output"
          label="Breadth-first search tree"
        />
      </div>

      <div class="flex-[1_1_260px] min-w-0 p-5 border-l border-tq-line bg-[#FFFDF6] flex flex-col gap-5">
        <div>
          <div class="text-sm font-medium">Queue</div>
          <div class="text-xs text-tq-muted mb-2">front ← first in, first out ← back</div>
          <div class="min-h-11 flex flex-wrap gap-1.5 items-center p-1.5 rounded-lg border border-tq-line bg-white">
            <span
              v-for="v in s.queue"
              :key="v"
              class="min-w-9 h-8 px-1.5 rounded-md inline-flex items-center justify-center text-sm font-medium bg-tq-blue-light border-2 border-dashed border-tq-blue text-[#1E3557]"
            >{{ v }}</span>
            <span v-if="!s.queue.length" class="text-sm text-tq-muted px-1.5">empty</span>
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
          <div class="font-mono text-[13px] leading-relaxed rounded-lg bg-tq-bg py-1.5 overflow-x-auto">
            <div
              v-for="(line, i) in BFS_PSEUDOCODE"
              :key="i"
              class="whitespace-pre px-3"
              :class="i + 1 === s.line ? 'bg-tq-yellow-light font-medium shadow-[inset_3px_0_0_#F2B807]' : ''"
            ><span class="inline-block w-5 text-tq-muted">{{ i + 1 }}</span>{{ line }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-5 px-4 py-3.5 rounded-xl bg-tq-yellow-light text-[15px] leading-normal" aria-live="polite">
      {{ s.message }}
    </div>

    <div class="flex flex-wrap items-center gap-1.5 px-4 py-4">
      <v-btn icon="mdi-restart" variant="text" aria-label="Restart" :disabled="step === 0" @click="restart" />
      <v-btn icon="mdi-skip-previous" variant="text" aria-label="Step back" :disabled="step === 0" @click="back" />
      <v-btn
        :icon="playing ? 'mdi-pause' : 'mdi-play'"
        color="primary"
        flat
        :aria-label="playing ? 'Pause' : 'Play'"
        @click="togglePlay"
      />
      <v-btn icon="mdi-skip-next" variant="text" aria-label="Step forward" :disabled="step === total" @click="forward" />
      <span class="ml-2 text-sm text-gray-700">Step {{ step }} of {{ total }}</span>
    </div>
  </div>
</template>
