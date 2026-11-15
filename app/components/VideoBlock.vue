<!-- A lesson video with captions (on by default) and a full transcript.
     The narration describes everything shown on screen, so the video also works
     for students who cannot see it. -->
<script setup lang="ts">
import type { Block } from '~/types/content'

const props = defineProps<{ block: Extract<Block, { type: 'video' }> }>()
const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
const url = (p?: string) => (p ? `${base}/${p.replace(/^\//, '')}` : undefined)
const showTranscript = ref(false)
const tid = useId()
</script>

<template>
  <figure class="m-0">
    <video
      class="w-full rounded-xl bg-black"
      controls
      preload="metadata"
      playsinline
      :poster="url(block.poster)"
      :aria-label="`Video: ${block.title}`"
      :aria-describedby="`${tid}-cap`"
    >
      <source :src="url(block.src)" type="video/mp4">
      <track kind="captions" srclang="en" label="English" :src="url(block.captions)" default>
      Your browser cannot play this video. The transcript below has everything it says.
    </video>
    <figcaption :id="`${tid}-cap`" class="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-tq-muted">
      <span>{{ block.title }}<template v-if="block.minutes"> · about {{ block.minutes }} min</template> · captions on, narration describes every picture</span>
      <v-btn
        variant="text"
        size="small"
        color="primary-darken-1"
        :prepend-icon="showTranscript ? 'mdi-chevron-up' : 'mdi-text-box-outline'"
        :aria-expanded="showTranscript"
        :aria-controls="`${tid}-tr`"
        @click="showTranscript = !showTranscript"
      >
        {{ showTranscript ? 'Hide transcript' : 'Read the transcript' }}
      </v-btn>
    </figcaption>
    <div v-show="showTranscript" :id="`${tid}-tr`" class="mt-2 p-4 rounded-xl border border-tq-line bg-white text-[15px] leading-relaxed flex flex-col gap-2.5">
      <h3 class="text-base font-medium">Transcript</h3>
      <p v-for="(t, i) in block.transcript" :key="i">{{ t }}</p>
    </div>
  </figure>
</template>
