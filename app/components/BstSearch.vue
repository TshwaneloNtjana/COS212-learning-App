<!-- Interactive BST search and insert.
     "You decide": at every node the student chooses left, right or "found it" (buttons,
     arrow keys, or by clicking the next node). Wrong choices get an explanation.
     "Watch it": the app steps through the same search, forwards and backwards.
     Every step is announced to screen readers and, if switched on, read aloud. -->
<script setup lang="ts">
import type { SearchStep } from '~/utils/bst'

const props = withDefaults(defineProps<{ values: number[]; target?: number }>(), { target: undefined })
const { announce, settings } = useA11y()

type Choice = 'left' | 'right' | 'found'
interface Run { kind: 'search' | 'insert'; value: number; steps: SearchStep[]; found: boolean }
interface LogLine { expr: string; text: string }

const MAX_NODES = 15
const MAX_DEPTH = 5

const tree = ref<number[]>([...props.values])
const mode = ref<'you' | 'watch'>('you')
const input = ref(props.target != null ? String(props.target) : '')
const run = ref<Run | null>(null)
const pos = ref(0) // index of the node being compared
const done = ref(false)
const slips = ref(0)
const wrongNode = ref<number | null>(null)
const status = ref('Type a number, then choose Search or Insert.')
const newNode = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null
const panel = ref<HTMLElement>()

const facts = computed(() => new Map(treeFacts(tree.value).map(f => [f.value, f])))
const currentValue = computed(() => (run.value && !done.value ? run.value.steps[pos.value]?.value ?? null : null))
const pathSoFar = computed(() => (run.value ? run.value.steps.slice(0, done.value ? undefined : pos.value + 1).map(s => s.value) : []))

// Nodes we no longer need to look at: everything outside the current node's subtree
const ruledOut = computed(() => {
  if (!run.value || done.value || currentValue.value == null) return []
  const keep = new Set<number>()
  const stack = [currentValue.value]
  while (stack.length) {
    const v = stack.pop()!
    keep.add(v)
    const f = facts.value.get(v)
    if (f?.left != null) stack.push(f.left)
    if (f?.right != null) stack.push(f.right)
  }
  return tree.value.filter(v => !keep.has(v) && !pathSoFar.value.includes(v))
})

const log = computed<LogLine[]>(() => {
  if (!run.value) return []
  const t = run.value.value
  const upto = done.value ? run.value.steps.length : pos.value
  const lines = run.value.steps.slice(0, upto).map((s): LogLine => s.result === 'found'
    ? { expr: `${t} = ${s.value}`, text: 'found it.' }
    : { expr: `${t} ${s.result === 'left' ? '<' : '>'} ${s.value}`, text: `${s.result === 'left' ? 'smaller' : 'larger'}, so go ${s.result}.` })
  if (done.value && !run.value.found) {
    lines.push(run.value.kind === 'insert'
      ? { expr: 'empty spot', text: `${t} is placed here as a new leaf.` }
      : { expr: 'empty spot', text: `${t} is not in the tree.` })
  }
  return lines
})

function say(text: string, urgent = false) {
  status.value = text
  announce(text, urgent)
}

/* ---------- starting a run ---------- */
function parse(): number | null {
  const v = Number(input.value)
  if (!Number.isInteger(v) || v < 1 || v > 99) {
    say('Please type a whole number from 1 to 99.', true)
    return null
  }
  return v
}

function begin(kind: 'search' | 'insert') {
  stop()
  const v = parse()
  if (v === null) return
  if (kind === 'insert') {
    if (tree.value.includes(v)) return say(`${v} is already in the tree. A BST holds each value once. Try Search instead.`, true)
    if (tree.value.length >= MAX_NODES) return say('The tree is full for this screen. Press Reset tree to start again.', true)
  }
  const r = searchBst(tree.value, v)
  if (kind === 'insert' && r.steps.length > MAX_DEPTH) return say('That value would make the tree too tall for the screen. Try a different number.', true)
  run.value = { kind, value: v, steps: r.steps, found: r.found }
  pos.value = 0
  done.value = false
  slips.value = 0
  newNode.value = null
  if (r.steps.length === 0) return finish()
  say(`${kind === 'search' ? 'Searching for' : 'Inserting'} ${v}. ${promptText()}`)
  if (mode.value === 'watch') play()
  nextTick(() => panel.value?.focus())
}

function randomValue() {
  const inTree = Math.random() < 0.5 && tree.value.length
  let v: number
  if (inTree) v = tree.value[Math.floor(Math.random() * tree.value.length)]!
  else do { v = 1 + Math.floor(Math.random() * 99) } while (tree.value.includes(v))
  input.value = String(v)
  begin('search')
}

/* ---------- the student's choice ---------- */
const promptText = () => {
  if (!run.value || done.value) return ''
  const c = run.value.steps[pos.value]!.value
  return mode.value === 'you'
    ? `Compare ${run.value.value} with ${c}. Go left, go right, or found it?`
    : `Comparing ${run.value.value} with ${c}.`
}

function explain(step: SearchStep, t: number) {
  if (step.result === 'found') return `${t} equals ${step.value}`
  return `${t} is ${step.result === 'left' ? 'smaller' : 'larger'} than ${step.value}, so go ${step.result}`
}

function choose(c: Choice) {
  if (!run.value || done.value) return
  const step = run.value.steps[pos.value]!
  const t = run.value.value
  if (c !== step.result) {
    slips.value++
    const why = step.result === 'found'
      ? `${t} equals ${step.value}, so we have found it.`
      : `${t} is ${step.result === 'left' ? 'smaller' : 'larger'} than ${step.value}, so it can only be on the ${step.result}.`
    return say(`Not quite. ${why} Try again.`, true)
  }
  advance(`Yes: ${explain(step, t)}.`)
}

function advance(prefix: string) {
  const r = run.value!
  const step = r.steps[pos.value]!
  if (step.result === 'found') return finish(prefix)
  pos.value++
  if (pos.value >= r.steps.length) return finish(prefix)
  say(`${prefix} ${promptText()}`)
}

function finish(prefix = '') {
  const r = run.value!
  done.value = true
  stop()
  const n = r.steps.length
  const cmp = `${n} comparison${n === 1 ? '' : 's'}`
  let msg: string
  if (r.found) {
    msg = `Found ${r.value} after ${cmp}. The tree has ${tree.value.length} nodes, but we only looked at ${n}.`
  } else if (r.kind === 'insert') {
    const parent = r.steps.at(-1)
    tree.value = [...tree.value, r.value]
    newNode.value = r.value
    msg = parent
      ? `There is an empty spot, so ${r.value} becomes the ${r.value < parent.value ? 'left' : 'right'} child of ${parent.value}. It took ${cmp}.`
      : `The tree was empty, so ${r.value} becomes the root.`
  } else {
    msg = `We reached an empty spot, so ${r.value} is not in the tree. ${cmp} were enough to be sure.`
  }
  if (mode.value === 'you' && slips.value === 0 && n > 0) msg += ' No slips. Well done!'
  say(`${prefix} ${msg}`.trim())
}

/* ---------- clicking nodes (another way to choose) ---------- */
function pickNode(v: number) {
  if (!run.value || done.value || mode.value !== 'you') return
  const cur = facts.value.get(currentValue.value!)!
  if (v === cur.value) return choose('found')
  if (v === cur.left) return choose('left')
  if (v === cur.right) return choose('right')
  wrongNode.value = v
  setTimeout(() => { if (wrongNode.value === v) wrongNode.value = null }, 900)
  say(`${v} is not next to ${cur.value}. Pick ${cur.value} itself, or one of its children.`, true)
}

/* ---------- watch mode ---------- */
function watchNext() {
  if (!run.value || done.value) return
  advance(`${explain(run.value.steps[pos.value]!, run.value.value)}.`)
}
function watchBack() {
  stop()
  if (!run.value) return
  if (done.value) {
    if (run.value.kind === 'insert' && !run.value.found) tree.value = tree.value.filter(v => v !== run.value!.value)
    newNode.value = null
    done.value = false
    pos.value = run.value.steps.length - 1
  } else if (pos.value > 0) pos.value--
  say(promptText())
}
function play() {
  stop()
  const ms = settings.value.reduceMotion || settings.value.readAloud ? 3200 : 1800
  isPlaying.value = true
  timer = setInterval(() => (done.value ? stop() : watchNext()), ms)
}
function stop() { if (timer) clearInterval(timer); timer = null; isPlaying.value = false }
const isPlaying = ref(false)
const playing = computed(() => isPlaying.value && !done.value)
watch(mode, () => { stop(); if (run.value && !done.value) say(promptText()) })
onBeforeUnmount(stop)

/* ---------- keyboard ---------- */
function onKey(e: KeyboardEvent) {
  if (!run.value || done.value || (e.target as HTMLElement).tagName === 'INPUT') return
  const map: Record<string, () => void> = mode.value === 'you'
    ? { ArrowLeft: () => choose('left'), ArrowRight: () => choose('right'), Enter: () => choose('found'), '=': () => choose('found') }
    : { ArrowRight: watchNext, ArrowLeft: watchBack }
  const fn = map[e.key]
  if (fn && !(e.key === 'Enter' && (e.target as HTMLElement).tagName === 'BUTTON')) { e.preventDefault(); fn() }
}

/* ---------- tree tools ---------- */
function resetTree(values = props.values) {
  stop()
  tree.value = [...values]
  run.value = null
  done.value = false
  newNode.value = null
  say(values === props.values ? 'Tree reset to the starting tree.' : 'New tree loaded.')
}
function sortedTree() {
  resetTree([10, 20, 30, 40, 50, 60, 70])
  input.value = '70'
  say('This tree was built by inserting 10, 20, 30, 40, 50, 60, 70 in sorted order. Every value went right, so it is one long chain. Search for 70 and count the comparisons.')
}

const treeLabel = computed(() => {
  const base = `Search tree with ${tree.value.length} nodes, root ${tree.value[0]}.`
  if (!run.value) return base
  return done.value ? `${base} ${status.value}` : `${base} Now comparing with ${currentValue.value}. Choose a node: the current node means found, its children mean go left or right.`
})
</script>

<template>
  <section class="rounded-2xl border border-tq-line bg-white overflow-hidden" aria-label="Binary search tree playground">
    <!-- Controls -->
    <div class="px-5 py-4 border-b border-tq-line flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-3 justify-between">
        <v-btn-toggle v-model="mode" mandatory density="comfortable" variant="outlined" color="primary-darken-1" divided aria-label="How do you want to search?" class="w-full sm:w-auto">
          <v-btn value="you" prepend-icon="mdi-hand-pointing-right" class="flex-1">You decide</v-btn>
          <v-btn value="watch" prepend-icon="mdi-eye-outline" class="flex-1">Watch it</v-btn>
        </v-btn-toggle>
        <div class="flex flex-wrap gap-1">
          <v-btn variant="text" size="small" prepend-icon="mdi-restart" @click="resetTree()">Reset tree</v-btn>
          <v-btn variant="text" size="small" prepend-icon="mdi-sort-ascending" @click="sortedTree">Try a sorted tree</v-btn>
        </div>
      </div>
      <form class="flex flex-wrap items-center gap-2" @submit.prevent="begin('search')">
        <v-text-field
          v-model="input"
          label="Value (1 to 99)"
          type="number"
          min="1"
          max="99"
          inputmode="numeric"
          density="comfortable"
          variant="outlined"
          hide-details
          class="max-w-40"
        />
        <v-btn type="submit" color="primary" flat prepend-icon="mdi-magnify">Search</v-btn>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="begin('insert')">Insert</v-btn>
        <v-btn variant="text" prepend-icon="mdi-dice-5-outline" @click="randomValue">Random value</v-btn>
      </form>
    </div>

    <div class="flex flex-wrap">
      <!-- Tree -->
      <div class="flex-[999_1_420px] min-w-0 py-6 px-2">
        <TreeDiagram
          :values="tree"
          :current="done ? (run?.found ? run.value : newNode) : currentValue"
          :path="pathSoFar"
          :visited="newNode != null ? [newNode] : []"
          :wrong="wrongNode"
          :faded="ruledOut"
          :clickable="!!run && !done && mode === 'you'"
          :label="treeLabel"
          @select="pickNode"
        />
        <p v-if="run && !done && mode === 'you'" class="text-center text-sm text-tq-muted mt-3">
          Tip: you can also tap the node you would go to next.
        </p>
      </div>

      <!-- Decision panel -->
      <div
        ref="panel"
        class="flex-[1_1_260px] min-w-0 p-5 border-l border-tq-line bg-[#FFFDF6] flex flex-col gap-4 outline-none"
        tabindex="-1"
        aria-label="Search steps"
        @keydown="onKey"
      >
        <div class="mf-status rounded-xl px-4 py-3 text-[15px] leading-snug" :class="done ? 'mf-status--done' : ''">
          {{ status }}
        </div>

        <!-- You decide -->
        <div v-if="run && !done && mode === 'you'" class="flex flex-col gap-2" role="group" :aria-label="`Compare ${run.value} with ${currentValue}`">
          <v-btn block variant="outlined" color="primary-darken-1" size="large" prepend-icon="mdi-arrow-left" aria-keyshortcuts="ArrowLeft" @click="choose('left')">
            Go left (smaller)
          </v-btn>
          <v-btn block color="primary" flat size="large" prepend-icon="mdi-check" aria-keyshortcuts="=" @click="choose('found')">
            Found it (equal)
          </v-btn>
          <v-btn block variant="outlined" color="primary-darken-1" size="large" append-icon="mdi-arrow-right" aria-keyshortcuts="ArrowRight" @click="choose('right')">
            Go right (larger)
          </v-btn>
          <p class="text-xs text-tq-muted mt-1">Keys: ← left, → right, = found.</p>
        </div>

        <!-- Watch it -->
        <div v-else-if="run && mode === 'watch'" class="flex items-center gap-1.5">
          <v-btn icon="mdi-skip-previous" variant="text" aria-label="Step back" aria-keyshortcuts="ArrowLeft" :disabled="pos === 0 && !done" @click="watchBack" />
          <v-btn :icon="playing ? 'mdi-pause' : 'mdi-play'" color="primary" flat :aria-label="playing ? 'Pause' : 'Play'" :disabled="done" @click="playing ? stop() : play()" />
          <v-btn icon="mdi-skip-next" variant="text" aria-label="Step forward" aria-keyshortcuts="ArrowRight" :disabled="done" @click="watchNext" />
        </div>

        <div v-if="run">
          <div class="text-sm font-medium mb-2">
            Comparisons: {{ log.filter(l => l.expr !== 'empty spot').length }}<template v-if="mode === 'you'"> · Slips: {{ slips }}</template>
          </div>
          <ol class="flex flex-col gap-2.5" aria-label="Comparisons made">
            <li v-for="(l, i) in log" :key="i" class="flex gap-3 items-start">
              <span class="w-6 h-6 flex-none rounded-full bg-tq-yellow-light border border-tq-gold text-xs font-medium flex items-center justify-center" aria-hidden="true">{{ i + 1 }}</span>
              <span class="text-[15px] leading-snug"><span class="font-mono font-medium">{{ l.expr }}</span> {{ l.text }}</span>
            </li>
          </ol>
        </div>
        <p v-else class="text-sm text-tq-muted">
          <strong>You decide:</strong> you choose the way at every node.<br>
          <strong>Watch it:</strong> the app shows each step.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mf-status { background: var(--color-tq-yellow-light); color: var(--color-tq-ink); border: 1px solid #F0DE9A; }
.mf-status--done { background: #EEF7F1; border-color: #9CCBAE; }
</style>
