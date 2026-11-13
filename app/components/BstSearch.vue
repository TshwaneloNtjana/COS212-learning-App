<!-- Search a BST for a value and see each comparison. -->
<script setup lang="ts">
const props = withDefaults(defineProps<{ values: number[]; target?: number }>(), { target: undefined })

const input = ref(props.target != null ? String(props.target) : '')
const searched = ref<number | null>(props.target ?? null)

const result = computed(() => (searched.value == null ? null : searchBst(props.values, searched.value)))
const path = computed(() => result.value?.steps.map(s => s.value) ?? [])

function search() {
  const v = Number.parseInt(input.value, 10)
  searched.value = Number.isNaN(v) ? null : v
}

const lines = computed(() => {
  if (!result.value || searched.value == null) return []
  const t = searched.value
  const out = result.value.steps.map((s) => {
    if (s.result === 'found') return { expr: `${t} = ${s.value}`, text: 'found it!' }
    return s.result === 'left'
      ? { expr: `${t} < ${s.value}`, text: 'smaller, so go left.' }
      : { expr: `${t} > ${s.value}`, text: 'larger, so go right.' }
  })
  if (!result.value.found) out.push({ expr: 'empty', text: `spot reached: ${t} is not in the tree.` })
  return out
})

const summary = computed(() => {
  if (!result.value || searched.value == null) return 'Type a number and press Search.'
  const n = result.value.steps.length
  return result.value.found
    ? `Found ${searched.value} with ${n} comparison${n === 1 ? '' : 's'}, out of ${props.values.length} nodes.`
    : `${searched.value} is not in the tree. ${n} comparisons were enough to be sure.`
})
</script>

<template>
  <div class="rounded-2xl border border-tq-line bg-white overflow-hidden">
    <form class="flex flex-wrap items-end gap-3 px-5 py-4 border-b border-tq-line" @submit.prevent="search">
      <v-text-field
        v-model="input"
        label="Value to find"
        type="number"
        density="comfortable"
        variant="outlined"
        hide-details
        class="max-w-40"
      />
      <v-btn type="submit" color="primary" flat prepend-icon="mdi-magnify">Search</v-btn>
    </form>

    <div class="flex flex-wrap">
      <div class="flex-[999_1_420px] min-w-0 py-6">
        <TreeDiagram
          :values="values"
          :current="result?.found ? searched : null"
          :path="path"
          dim-others
          :label="summary"
        />
      </div>
      <div class="flex-[1_1_240px] min-w-0 p-5 border-l border-tq-line">
        <div class="text-sm font-medium mb-1">Comparisons</div>
        <p class="text-sm text-tq-muted mb-4">{{ summary }}</p>
        <ol class="flex flex-col gap-2.5">
          <li v-for="(l, i) in lines" :key="i" class="flex gap-3 items-start">
            <span class="w-6 h-6 flex-none rounded-full bg-tq-yellow-light text-xs font-medium flex items-center justify-center">{{ i + 1 }}</span>
            <span class="text-[15px] leading-snug"><span class="font-mono font-medium">{{ l.expr }}</span> {{ l.text }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
