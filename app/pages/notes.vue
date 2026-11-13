<!-- Notes for class: questions to ask or bring up in the lecture. -->
<script setup lang="ts">
useHead({ title: 'Notes · TreeQuest' })

const route = useRoute()
const { lessons } = useContent()
const { notes, openNotes, addNote, toggleNote, deleteNote } = useProgress()

const topics = ['General', ...lessons.map(l => `Lesson ${l.number} · ${l.short}`), 'Quizzes']

const draft = ref('')
const topic = ref(typeof route.query.topic === 'string' && topics.includes(route.query.topic) ? route.query.topic : 'General')
const filter = ref<'open' | 'done' | 'all'>('open')
const copied = ref(false)
const textarea = ref()

onMounted(() => { if (route.query.topic) textarea.value?.focus() })

function add() {
  if (!draft.value.trim()) return
  addNote(draft.value, topic.value)
  draft.value = ''
  filter.value = 'open'
}

const shown = computed(() => notes.value.filter(n =>
  filter.value === 'all' ? true : filter.value === 'done' ? n.done : !n.done,
))
const doneCount = computed(() => notes.value.length - openNotes.value.length)

const asText = () => openNotes.value.map((n, i) => `${i + 1}. [${n.topic}] ${n.text}`).join('\n')

async function copy() {
  try {
    await navigator.clipboard.writeText(asText())
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch { /* clipboard blocked */ }
}

function download() {
  const blob = new Blob([`TreeQuest: questions for class\n\n${asText()}\n`], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'treequest-questions.txt'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="mx-auto max-w-[860px] flex flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex-[999_1_380px] min-w-0">
        <h1 class="text-[32px] font-medium mb-1.5">Notes for class</h1>
        <p class="text-base text-[#3D3520] leading-normal">Write down anything you want to ask or bring up in the lecture. Tick a note once it’s been answered.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <v-btn variant="outlined" color="primary-darken-1" class="bg-white" :disabled="!openNotes.length" @click="copy">
          {{ copied ? 'Copied' : 'Copy all' }}
        </v-btn>
        <v-btn variant="outlined" color="primary-darken-1" class="bg-white" prepend-icon="mdi-download" :disabled="!openNotes.length" @click="download">
          Download .txt
        </v-btn>
      </div>
    </div>

    <!-- New note -->
    <v-card class="p-6 !border-2 !border-tq-yellow">
      <h2 class="text-lg font-medium mb-3.5">New note</h2>
      <form @submit.prevent="add">
        <v-textarea
          ref="textarea"
          v-model="draft"
          label="What do you want to ask or bring up?"
          placeholder="e.g. Why does in-order give sorted output?"
          variant="outlined"
          rows="3"
          auto-grow
          hide-details
          color="primary-darken-1"
        />
        <div class="mt-3.5 flex flex-wrap items-center gap-3">
          <v-select
            v-model="topic"
            :items="topics"
            label="Topic"
            variant="outlined"
            density="comfortable"
            hide-details
            color="primary-darken-1"
            class="max-w-64"
          />
          <v-spacer />
          <v-btn type="submit" color="primary" flat size="large" prepend-icon="mdi-plus" :disabled="!draft.trim()">Add note</v-btn>
        </div>
      </form>
    </v-card>

    <v-chip-group v-model="filter" mandatory selected-class="bg-primary text-on-primary" aria-label="Filter notes">
      <v-chip value="open" variant="outlined">To ask ({{ openNotes.length }})</v-chip>
      <v-chip value="done" variant="outlined">Answered ({{ doneCount }})</v-chip>
      <v-chip value="all" variant="outlined">All ({{ notes.length }})</v-chip>
    </v-chip-group>

    <ul class="flex flex-col gap-3">
      <li v-for="n in shown" :key="n.id">
        <v-card class="flex items-start gap-3 py-4 pl-3 pr-2" :class="n.done ? '!bg-[#FBFAF5]' : ''">
          <v-checkbox-btn
            :model-value="n.done"
            color="success"
            :aria-label="`Answered in class: ${n.text}`"
            @update:model-value="toggleNote(n.id)"
          />
          <div class="flex-1 min-w-0 pt-2">
            <div class="text-base leading-normal" :class="n.done ? 'text-tq-muted' : ''">{{ n.text }}</div>
            <div class="mt-2.5 flex flex-wrap items-center gap-2">
              <v-chip size="small" color="primary-darken-1" variant="tonal">{{ n.topic }}</v-chip>
              <span class="text-[13px] text-tq-muted">{{ formatDateTime(n.createdAt) }}</span>
              <v-chip v-if="n.done" size="small" color="success" variant="tonal">Answered in class</v-chip>
            </div>
          </div>
          <v-btn icon="mdi-delete-outline" variant="text" :aria-label="`Delete note: ${n.text}`" @click="deleteNote(n.id)" />
        </v-card>
      </li>
    </ul>
    <p v-if="!shown.length" class="p-6 text-center text-[15px] text-tq-muted border-[1.5px] border-dashed border-[#DCCFA6] rounded-2xl">
      {{ filter === 'done' ? 'No answered notes yet.' : 'No notes here yet. Add one above.' }}
    </p>
  </div>
</template>
