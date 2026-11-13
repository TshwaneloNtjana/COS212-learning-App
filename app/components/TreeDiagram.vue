<!-- Draws a BST built from `values`.
     Node states use colour AND shape: current = yellow + ring, frontier = dashed blue,
     visited = pale yellow + gold border, others = white. -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  values: number[]
  current?: number | null
  frontier?: number[]
  visited?: number[]
  path?: number[]          // highlighted edges (e.g. a search path)
  dimOthers?: boolean      // fade nodes that are not highlighted
  clickable?: boolean
  width?: number
  levelGap?: number
  nodeSize?: number
  label?: string
}>(), {
  current: null,
  frontier: () => [],
  visited: () => [],
  path: () => [],
  dimOthers: false,
  clickable: false,
  width: 480,
  levelGap: 84,
  nodeSize: 48,
  label: '',
})

const emit = defineEmits<{ select: [value: number] }>()

const layout = computed(() => layoutTree(props.values, props.width, props.levelGap, props.nodeSize / 2 + 8))

function stateOf(v: number) {
  if (v === props.current) return 'current'
  if (props.frontier.includes(v)) return 'frontier'
  if (props.visited.includes(v) || props.path.includes(v)) return 'visited'
  return 'idle'
}

const stateText = { current: 'current', frontier: 'waiting', visited: 'visited', idle: 'not reached' } as const

function nodeClass(v: number) {
  const s = stateOf(v)
  const hasHighlight = props.current != null || props.frontier.length || props.visited.length || props.path.length
  return {
    current: 'bg-tq-yellow border-2 border-tq-yellow ring-4 ring-tq-ring',
    frontier: 'bg-tq-blue-light border-2 border-dashed border-tq-blue',
    visited: 'bg-tq-yellow-light border-2 border-tq-gold',
    idle: `bg-white border-2 border-gray-400 ${props.dimOthers && hasHighlight ? 'opacity-40' : ''}`,
  }[s]
}

const pathEdge = (from: number, to: number) => props.path.includes(from) && props.path.includes(to)

const ariaLabel = computed(() =>
  props.label || `Binary search tree with ${props.values.length} nodes, root ${props.values[0] ?? 'none'}.`,
)
</script>

<template>
  <div class="overflow-x-auto">
    <div
      class="relative mx-auto"
      :style="{ width: `${layout.width}px`, height: `${layout.height}px` }"
      :role="clickable ? 'group' : 'img'"
      :aria-label="ariaLabel"
    >
      <svg
        :width="layout.width"
        :height="layout.height"
        class="absolute inset-0"
        aria-hidden="true"
      >
        <line
          v-for="e in layout.edges"
          :key="e.key"
          :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
          :stroke="pathEdge(e.from, e.to) ? '#8A6500' : '#D6CCAE'"
          :stroke-width="pathEdge(e.from, e.to) ? 3 : 2"
        />
      </svg>

      <component
        :is="clickable ? 'button' : 'div'"
        v-for="n in layout.nodes"
        :key="n.value"
        :type="clickable ? 'button' : undefined"
        class="absolute flex items-center justify-center rounded-full font-medium text-tq-ink box-border transition-all"
        :class="[nodeClass(n.value), clickable ? 'cursor-pointer hover:scale-105 focus-visible:outline-3 focus-visible:outline-tq-ink focus-visible:outline-offset-2' : '']"
        :style="{
          left: `${n.x - nodeSize / 2}px`,
          top: `${n.y - nodeSize / 2}px`,
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          fontSize: `${Math.round(nodeSize / 3)}px`,
        }"
        :aria-label="clickable ? `Node ${n.value}, ${stateText[stateOf(n.value)]}` : undefined"
        @click="clickable && emit('select', n.value)"
      >
        {{ n.value }}
      </component>
    </div>
  </div>
</template>
