<!-- Renders one content block from lessons.json.
     v-html is safe here because the HTML comes only from our own JSON file. -->
<script setup lang="ts">
import type { Block } from '~/types/content'

defineProps<{ block: Block }>()
</script>

<template>
  <p v-if="block.type === 'p'" class="rich text-base leading-relaxed text-[#2E2818]" v-html="block.html" />

  <ul v-else-if="block.type === 'list'" class="flex flex-col gap-2.5">
    <li v-for="(item, i) in block.items" :key="i" class="rich flex gap-3 text-base leading-relaxed text-[#2E2818]">
      <span class="mt-2.5 w-2 h-2 flex-none rounded-full bg-tq-yellow" aria-hidden="true" />
      <span v-html="item" />
    </li>
  </ul>

  <div v-else-if="block.type === 'callout'" class="rich flex gap-3 p-4 rounded-xl bg-tq-yellow-light text-[15px] leading-normal text-[#3D2E00]">
    <v-icon icon="mdi-lightbulb-outline" color="primary-darken-1" />
    <span v-html="block.html" />
  </div>

  <div v-else-if="block.type === 'compare'" class="grid gap-4 sm:grid-cols-2">
    <div
      v-for="(c, i) in block.cards"
      :key="i"
      class="p-5 rounded-xl border"
      :class="c.tone === 'blue' ? 'bg-tq-blue-light border-[#C9DAF0] text-[#1E3557]' : 'bg-tq-yellow-light border-[#F0DE9A] text-[#3D2E00]'"
    >
      <div class="text-xs font-bold tracking-widest uppercase" :class="c.tone === 'blue' ? 'text-[#22508A]' : 'text-tq-gold'">{{ c.label }}</div>
      <div class="text-lg font-medium mt-2 mb-1.5 text-tq-ink">{{ c.title }}</div>
      <p class="rich text-[15px] leading-normal" v-html="c.html" />
      <ul v-if="c.items" class="mt-2.5 flex flex-col gap-1 text-sm">
        <li v-for="(it, j) in c.items" :key="j" class="rich" v-html="`• ${it}`" />
      </ul>
      <div v-if="c.example" class="mt-3 font-mono text-sm">{{ c.example }}</div>
    </div>
  </div>

  <figure v-else-if="block.type === 'tree'" class="m-0 py-2">
    <TreeDiagram :values="block.values" :label="block.caption" />
    <figcaption v-if="block.caption" class="text-center text-sm text-tq-muted mt-2">{{ block.caption }}</figcaption>
  </figure>

  <pre v-else-if="block.type === 'code'" class="m-0 p-4 rounded-xl bg-tq-bg border border-tq-line font-mono text-sm leading-relaxed overflow-x-auto">{{ block.text }}</pre>

  <BstSearch v-else-if="block.type === 'bst-search'" :values="block.values" :target="block.target" />

  <TraversalStepper v-else-if="block.type === 'traversal-stepper'" :values="block.values" />
</template>
