<!-- One self-check problem. Tree answers are computed from the values with bst.ts,
     so they always match the tree. -->
<script setup lang="ts">
import type { Problem } from '~/types/content'

const props = defineProps<{ problem: Problem; number: number }>()

const shown = ref(false)
const attempt = ref('')

const levelColor = { Basic: 'success', Easy: 'secondary', Medium: 'primary-darken-1' } as const

const list = (vs: number[]) => vs.join(', ')

const prompt = computed(() => {
  const p = props.problem
  switch (p.kind) {
    case 'height': return 'What is the height of this tree, counting edges?'
    case 'leaves': return 'How many leaves does this tree have? Which nodes are they?'
    case 'min-max': return `Insert ${list(p.values)} into an empty BST, in that order. Which nodes do you pass to find the smallest value, and the largest?`
    case 'bfs-order': return `Insert ${list(p.values)} into an empty BST, in that order. Then write down the BFS (level-order) order.`
    case 'search-path': return `Insert ${list(p.values)} into an empty BST, in that order. Then search for ${p.target}. Which nodes are compared, in order, and is ${p.target} found?`
    default: return p.prompt
  }
})

/** The tree is part of the question for height/leaves; for the others, drawing it is part of the work. */
const treeInQuestion = computed(() => props.problem.kind === 'height' || props.problem.kind === 'leaves')

const answerTree = computed(() => {
  const p = props.problem
  return p.kind === 'text' ? p.tree : p.values
})

const answer = computed(() => {
  const p = props.problem
  switch (p.kind) {
    case 'height': return `Height ${treeHeight(p.values)}: the longest path from the root down to a leaf has ${treeHeight(p.values)} edges.`
    case 'leaves': {
      const leaves = leafValues(p.values)
      return `${leaves.length} leaves: ${list(leaves)}.`
    }
    case 'min-max': {
      const min = extremePath(p.values, 'min')
      const max = extremePath(p.values, 'max')
      return `Smallest: go left from the root, ${min.join(' → ')}, so it is ${min.at(-1)}. Largest: go right, ${max.join(' → ')}, so it is ${max.at(-1)}.`
    }
    case 'bfs-order': return `BFS order: ${list(bfsOrder(p.values))}.`
    case 'search-path': {
      const r = searchBst(p.values, p.target)
      const path = r.steps.map(s => s.value).join(' → ')
      return r.found
        ? `Compare ${path}: found after ${r.steps.length} comparisons.`
        : `Compare ${path}, then reach an empty spot: ${p.target} is not in the tree (${r.steps.length} comparisons).`
    }
    default: return p.answer
  }
})

const highlight = computed(() => {
  const p = props.problem
  if (p.kind === 'search-path') return searchBst(p.values, p.target).steps.map(s => s.value)
  if (p.kind === 'min-max') return [...extremePath(p.values, 'min'), ...extremePath(p.values, 'max')]
  if (p.kind === 'leaves') return leafValues(p.values)
  return []
})
</script>

<template>
  <li class="rounded-xl border border-tq-line bg-white p-5">
    <div class="flex flex-wrap items-center gap-2 mb-2">
      <span class="text-sm font-medium text-tq-muted">Problem {{ number }}</span>
      <v-chip size="small" variant="tonal" :color="levelColor[problem.level]">{{ problem.level }}</v-chip>
    </div>
    <h3 class="text-[17px] font-medium mb-1.5">{{ problem.title }}</h3>
    <p class="text-[15px] leading-normal text-[#2E2818]">{{ prompt }}</p>

    <div v-if="treeInQuestion" class="mt-3 rounded-xl bg-tq-bg border border-tq-line py-3">
      <TreeDiagram :values="problem.kind !== 'text' ? problem.values : []" :width="440" :level-gap="68" :node-size="40" />
    </div>

    <v-textarea
      v-model="attempt"
      class="mt-3"
      label="Your answer (not marked)"
      variant="outlined"
      rows="2"
      auto-grow
      hide-details
      density="comfortable"
      color="primary-darken-1"
    />

    <v-btn
      class="mt-3"
      :variant="shown ? 'text' : 'outlined'"
      color="primary-darken-1"
      :prepend-icon="shown ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
      :aria-expanded="shown"
      @click="shown = !shown"
    >
      {{ shown ? 'Hide answer' : 'Show answer' }}
    </v-btn>

    <div v-if="shown" class="mt-3 rounded-xl bg-[#EEF7F1] border border-[#CFE6D7] p-4">
      <p class="text-[15px] leading-normal text-[#1F3D2B]"><strong class="font-medium">Answer.</strong> {{ answer }}</p>
      <div v-if="answerTree && !treeInQuestion" class="mt-3 rounded-lg bg-white py-3">
        <TreeDiagram :values="answerTree" :path="highlight" :width="440" :level-gap="68" :node-size="40" />
      </div>
    </div>
  </li>
</template>
