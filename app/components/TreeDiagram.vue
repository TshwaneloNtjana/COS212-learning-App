<!-- Draws a BST built from `values`.
     Node states use colour AND shape: current = yellow + thick ring, frontier = dashed blue,
     visited = pale yellow + gold border + tick, wrong = red + cross, others = white.
     For screen readers (and the "Describe trees in text" setting) every tree also has a
     plain-text description: one line per node, in level order, with its state. -->
<script setup lang="ts">
import type { TreeFact } from '~/utils/bst'

const props = withDefaults(defineProps<{
  values: number[]
  current?: number | null
  frontier?: number[]
  visited?: number[]
  path?: number[]          // highlighted edges (e.g. a search path)
  wrong?: number | null    // briefly marked as a wrong pick
  dimOthers?: boolean      // fade nodes that are not highlighted
  faded?: number[]         // fade exactly these nodes (e.g. ruled out by a search)
  clickable?: boolean
  width?: number
  levelGap?: number
  nodeSize?: number
  label?: string
  frontierWord?: string    // how the frontier is described: "in the queue", "on the stack"
}>(), {
  current: null,
  frontier: () => [],
  visited: () => [],
  path: () => [],
  wrong: null,
  dimOthers: false,
  faded: () => [],
  clickable: false,
  width: 480,
  levelGap: 84,
  nodeSize: 48,
  label: '',
  frontierWord: 'waiting',
})

const emit = defineEmits<{ select: [value: number] }>()
const { settings } = useA11y()
const uid = useId()

// Bigger nodes in the "large text" settings
const scale = computed(() => [1, 1.15, 1.3][settings.value.textSize])
const size = computed(() => Math.round(props.nodeSize * scale.value))
const layout = computed(() => layoutTree(props.values, props.width * scale.value, props.levelGap * scale.value, size.value / 2 + 10))
const facts = computed(() => treeFacts(props.values))

type State = 'current' | 'frontier' | 'visited' | 'wrong' | 'idle'
function stateOf(v: number): State {
  if (v === props.wrong) return 'wrong'
  if (v === props.current) return 'current'
  if (props.frontier.includes(v)) return 'frontier'
  if (props.visited.includes(v) || props.path.includes(v)) return 'visited'
  return 'idle'
}
const stateText = computed<Record<State, string>>(() => ({
  current: 'current node',
  frontier: props.frontierWord,
  visited: 'visited',
  wrong: 'not this one',
  idle: '',
}))

const hasHighlight = computed(() => props.current != null || props.frontier.length || props.visited.length || props.path.length)
function nodeClass(v: number) {
  const s = stateOf(v)
  return {
    current: 'mf-node--current',
    frontier: 'mf-node--frontier',
    visited: 'mf-node--visited',
    wrong: 'mf-node--wrong',
    idle: `mf-node--idle ${(props.dimOthers && hasHighlight.value) || props.faded.includes(v) ? 'mf-node--dim' : ''}`,
  }[s]
}

// A scrolling box must be reachable by keyboard, so it gets a tab stop only when it overflows
const scroller = ref<HTMLElement>()
const overflows = ref(false)
let ro: ResizeObserver | undefined
const measure = () => { const el = scroller.value; overflows.value = !!el && el.scrollWidth > el.clientWidth + 1 }
onMounted(() => { ro = new ResizeObserver(measure); if (scroller.value) ro.observe(scroller.value); measure() })
onBeforeUnmount(() => ro?.disconnect())
watch(layout, () => nextTick(measure))

// On narrow screens the tree scrolls sideways: keep the current node in view
watch(() => props.current, (v) => {
  const el = scroller.value
  if (v == null || !el || !overflows.value) return
  const n = layout.value.nodes.find(x => x.value === v)
  if (n) el.scrollTo({ left: n.x - el.clientWidth / 2, behavior: settings.value.reduceMotion ? 'auto' : 'smooth' })
}, { flush: 'post' })

const pathEdge = (from: number, to: number) => props.path.includes(from) && props.path.includes(to)

const summary = computed(() => {
  const n = props.values.length
  const root = props.values[0]
  const levels = facts.value.length ? Math.max(...facts.value.map(f => f.depth)) + 1 : 0
  return props.label || `Binary search tree with ${n} node${n === 1 ? '' : 's'} on ${levels} level${levels === 1 ? '' : 's'}. The root is ${root ?? 'empty'}.`
})

function nodeLabel(f: TreeFact) {
  const st = stateText.value[stateOf(f.value)] || (props.faded.includes(f.value) ? 'ruled out' : '')
  return `${f.value}: ${describeNode(f)}${st ? `. ${st[0]!.toUpperCase()}${st.slice(1)}` : ''}`
}
</script>

<template>
  <div class="mf-tree">
    <div
      ref="scroller"
      class="overflow-x-auto"
      :tabindex="overflows ? 0 : undefined"
      :role="overflows ? 'region' : undefined"
      :aria-label="overflows ? 'Tree diagram, scroll sideways to see all of it' : undefined"
    >
      <div
        class="relative mx-auto"
        :style="{ width: `${layout.width}px`, height: `${layout.height}px` }"
        :role="clickable ? 'group' : undefined"
        :aria-label="clickable ? summary : undefined"
        :aria-hidden="clickable ? undefined : 'true'"
      >
        <svg :width="layout.width" :height="layout.height" class="absolute inset-0" aria-hidden="true">
          <line
            v-for="e in layout.edges"
            :key="e.key"
            :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
            :class="pathEdge(e.from, e.to) ? 'mf-edge mf-edge--path' : 'mf-edge'"
          />
        </svg>

        <component
          :is="clickable ? 'button' : 'div'"
          v-for="n in layout.nodes"
          :key="n.value"
          :type="clickable ? 'button' : undefined"
          class="mf-node absolute flex items-center justify-center rounded-full font-medium box-border"
          :class="[nodeClass(n.value), clickable ? 'mf-node--click' : '']"
          :style="{
            left: `${n.x - size / 2}px`,
            top: `${n.y - size / 2}px`,
            width: `${size}px`,
            height: `${size}px`,
            fontSize: `${Math.round(size / 2.8)}px`,
          }"
          :aria-label="clickable ? nodeLabel(facts.find(f => f.value === n.value)!) : undefined"
          @click="clickable && emit('select', n.value)"
        >
          {{ n.value }}
          <!-- shape cues, so colour is never the only signal -->
          <span v-if="stateOf(n.value) === 'visited'" class="mf-badge mf-badge--tick" aria-hidden="true">✓</span>
          <span v-else-if="stateOf(n.value) === 'wrong'" class="mf-badge mf-badge--cross" aria-hidden="true">✕</span>
        </component>
      </div>
    </div>

    <!-- Text version of the tree. Hidden visually unless "Describe trees in text" is on. -->
    <div v-if="!clickable || settings.treeText" :id="`${uid}-desc`" :class="settings.treeText ? 'mf-tree-text' : 'sr-only'">
      <p class="font-medium mb-1">{{ summary }}</p>
      <ul :aria-label="`Nodes in level order`">
        <li v-for="f in facts" :key="f.value">{{ nodeLabel(f) }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.mf-edge { stroke: #B8AA80; stroke-width: 2; }
.mf-edge--path { stroke: #6B4E00; stroke-width: 4; }
.mf-node { color: var(--color-tq-ink); border: 2px solid #6F6650; background: #fff; transition: transform .15s, background-color .25s, box-shadow .25s; }
.mf-node--current { background: var(--color-tq-yellow); border: 3px solid #1F1A0A; box-shadow: 0 0 0 5px #1F1A0A33, 0 0 0 8px var(--color-tq-yellow); }
.mf-node--frontier { background: var(--color-tq-blue-light); border: 3px dashed var(--color-tq-blue); }
.mf-node--visited { background: var(--color-tq-yellow-light); border: 3px solid var(--color-tq-gold); }
.mf-node--wrong { background: #B3261E; border: 3px solid #5C120E; color: #fff; }
.mf-node--dim { background: #F1EEE4; border-color: #BDB497; border-style: dotted; color: #5E5640; }
.mf-node--click { cursor: pointer; }
.mf-node--click:hover { transform: scale(1.06); }
.mf-node--click:focus-visible { outline: 4px solid #1F1A0A; outline-offset: 3px; }
.mf-badge { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 999px; font-size: 12px; line-height: 18px; text-align: center; font-weight: 700; border: 2px solid; background: #fff; }
.mf-badge--tick { color: #6B4E00; border-color: #6B4E00; }
.mf-badge--cross { color: #8C1D18; border-color: #8C1D18; }
.mf-tree-text { margin-top: 12px; padding: 12px 16px; border-radius: 12px; background: #fff; border: 1px solid var(--color-tq-line); font-size: 15px; line-height: 1.55; }
.mf-tree-text ul { list-style: disc; padding-left: 20px; }
</style>
