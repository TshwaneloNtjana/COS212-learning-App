<!-- A YouTube video: shows the thumbnail first and only loads the player when pressed,
     which keeps lesson pages fast and saves mobile data. -->
<script setup lang="ts">
import type { Video } from '~/types/content'

const props = defineProps<{ video: Video }>()
const playing = ref(false)

const watchUrl = computed(() => `https://www.youtube.com/watch?v=${props.video.id}`)
const embedUrl = computed(() => `https://www.youtube-nocookie.com/embed/${props.video.id}?autoplay=1&rel=0`)
const thumb = computed(() => `https://i.ytimg.com/vi/${props.video.id}/hqdefault.jpg`)
</script>

<template>
  <div class="rounded-xl border border-tq-line bg-white overflow-hidden flex flex-col">
    <div class="relative aspect-video bg-black">
      <iframe
        v-if="playing"
        :src="embedUrl"
        :title="video.title"
        class="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
      <button
        v-else
        type="button"
        class="absolute inset-0 w-full h-full group cursor-pointer"
        :aria-label="`Play video: ${video.title}`"
        @click="playing = true"
      >
        <img :src="thumb" alt="" class="w-full h-full object-cover" loading="lazy">
        <span class="absolute inset-0 flex items-center justify-center">
          <span class="w-16 h-16 rounded-full bg-tq-yellow text-tq-ink flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <v-icon icon="mdi-play" size="36" />
          </span>
        </span>
        <span v-if="video.length" class="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-white text-xs">{{ video.length }}</span>
      </button>
    </div>
    <div class="p-4 flex flex-col gap-1 flex-1">
      <div class="text-[15px] font-medium leading-snug">{{ video.title }}</div>
      <div class="text-[13px] text-tq-muted">{{ video.channel }}</div>
      <p v-if="video.note" class="text-sm text-[#3D3520] leading-snug mt-1">{{ video.note }}</p>
      <a :href="watchUrl" target="_blank" rel="noopener" class="mt-auto pt-2 text-sm font-medium text-tq-gold">
        Open on YouTube <v-icon icon="mdi-open-in-new" size="14" />
      </a>
    </div>
  </div>
</template>
