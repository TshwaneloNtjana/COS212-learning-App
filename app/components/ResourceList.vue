<!-- A list of external links (practice problems or further reading), opening in a new tab. -->
<script setup lang="ts">
import type { Resource } from '~/types/content'

defineProps<{ items: Resource[] }>()

const levelColor = { Basic: 'success', Easy: 'secondary', Medium: 'primary-darken-1', Hard: 'error' } as const
</script>

<template>
  <ul class="flex flex-col divide-y divide-[#F1EAD3] rounded-xl border border-tq-line bg-white">
    <li v-for="r in items" :key="r.url">
      <a
        :href="r.url"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-3 px-4 py-3 no-underline text-tq-ink hover:bg-tq-yellow-light"
      >
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[15px] font-medium">{{ r.title }}</span>
            <v-chip v-if="r.level" size="x-small" variant="tonal" :color="levelColor[r.level]">{{ r.level }}</v-chip>
          </div>
          <div class="text-[13px] text-tq-muted mt-0.5">
            {{ r.source }}<template v-if="r.note"> · {{ r.note }}</template>
          </div>
        </div>
        <v-icon icon="mdi-open-in-new" size="18" color="primary-darken-1" aria-label="opens in a new tab" />
      </a>
    </li>
  </ul>
</template>
