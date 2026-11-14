<!-- Summary of every lesson, built from the `summary` field in lessons.json. -->
<script setup lang="ts">
import type { Order } from '~/utils/bst'

useHead({ title: 'Summary · MainFrame' })

const { lessons } = useContent()
const { lessonStatus, bestFor } = useProgress()

function chip(slug: string, quizId: string) {
  const status = lessonStatus(slug)
  const best = bestFor(quizId)
  if (status === 'done') {
    const ok = (best ?? 0) >= 70
    return { text: `Covered · quiz ${best}%${ok ? '' : ', retake suggested'}`, color: ok ? 'success' : 'warning', variant: 'tonal' as const }
  }
  if (status === 'started') return { text: 'In progress', color: 'primary', variant: 'flat' as const }
  return { text: 'Not started', color: undefined, variant: 'tonal' as const }
}

// Cheat sheet is computed from the same code the stepper uses, so it can never be wrong.
const sampleTree = [50, 30, 70, 20, 40, 60, 80]
const cheat: { order: Order; name: string; rule: string; uses: string }[] = [
  { order: 'bfs', name: 'BFS', rule: 'Level by level, left to right', uses: 'Queue' },
  { order: 'pre', name: 'Pre-order', rule: 'Node, left, right', uses: 'Stack / recursion' },
  { order: 'in', name: 'In-order', rule: 'Left, node, right', uses: 'Stack / recursion' },
  { order: 'post', name: 'Post-order', rule: 'Left, right, node', uses: 'Stack / recursion' },
]

function print() {
  window.print()
}
</script>

<template>
  <div class="mx-auto max-w-[960px] flex flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex-[999_1_420px] min-w-0">
        <h1 class="text-[32px] font-medium mb-1.5">Summary</h1>
        <p class="text-base text-[#3D3520] leading-normal">The key ideas from every lesson on one page. Read it again just before the lecture.</p>
      </div>
      <v-btn variant="outlined" color="primary-darken-1" prepend-icon="mdi-printer-outline" class="bg-white" @click="print">Print or save as PDF</v-btn>
    </div>

    <nav aria-label="Lessons in this summary" class="flex flex-wrap gap-2">
      <a
        v-for="l in lessons"
        :key="l.slug"
        :href="`#summary-${l.slug}`"
        class="text-sm px-3.5 py-2 rounded-full bg-white border border-tq-line no-underline text-[#3D3520] hover:bg-tq-yellow-light"
      >{{ l.number }} · {{ l.title }}</a>
      <a href="#cheat" class="text-sm px-3.5 py-2 rounded-full bg-tq-yellow no-underline text-tq-ink font-medium">Cheat sheet</a>
    </nav>

    <v-card v-for="l in lessons" :id="`summary-${l.slug}`" :key="l.slug" class="p-7 scroll-mt-24">
      <div class="flex flex-wrap items-center gap-2.5 mb-3.5">
        <span class="text-xs font-bold tracking-widest uppercase text-tq-gold">Lesson {{ l.number }}</span>
        <v-chip size="small" :color="chip(l.slug, l.quizId).color" :variant="chip(l.slug, l.quizId).variant">
          {{ chip(l.slug, l.quizId).text }}
        </v-chip>
      </div>
      <h2 class="text-2xl font-medium mb-4">{{ l.title }}</h2>

      <div class="flex flex-wrap gap-7">
        <ul class="flex-[999_1_380px] min-w-0 flex flex-col gap-2.5">
          <li v-for="(p, i) in l.summary.points" :key="i" class="rich flex gap-2.5 text-[15px] leading-normal text-[#2E2818]">
            <span class="mt-2 w-2 h-2 flex-none rounded-full bg-tq-yellow" aria-hidden="true" />
            <span v-html="p" />
          </li>
        </ul>

        <div class="flex-[1_1_220px] flex flex-col gap-4">
          <div v-if="l.summary.example">
            <div class="text-[13px] font-medium text-tq-muted mb-2">{{ l.summary.example.title }}</div>
            <div class="font-mono text-sm leading-loose px-3.5 py-3 rounded-lg bg-tq-bg border border-[#F1EAD3]">
              <div v-for="(line, i) in l.summary.example.lines" :key="i">{{ line }}</div>
            </div>
            <div v-if="l.summary.example.caption" class="text-[13px] text-tq-muted mt-1.5">{{ l.summary.example.caption }}</div>
          </div>
          <div>
            <div class="text-[13px] font-medium text-tq-muted mb-2">Key terms</div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="t in l.summary.terms" :key="t" class="text-[13px] px-2.5 py-1 rounded-full bg-tq-yellow-light text-[#4A3D10]">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="lessonStatus(l.slug) !== 'done'" class="mt-5 p-4 rounded-xl bg-tq-yellow-light flex flex-wrap items-center gap-3">
        <span class="flex-[999_1_280px] text-[15px] text-[#3D2E00]">Finish this lesson and its practice quiz to complete this section.</span>
        <v-btn :to="`/lessons/${l.slug}`" color="primary" flat>{{ lessonStatus(l.slug) === 'started' ? 'Continue' : 'Start' }} Lesson {{ l.number }}</v-btn>
      </div>
    </v-card>

    <v-card id="cheat" class="p-7 scroll-mt-24" aria-labelledby="cheat-h">
      <h2 id="cheat-h" class="text-[22px] font-medium mb-1.5">Cheat sheet: traversal orders</h2>
      <p class="text-[15px] text-[#3D3520] mb-4">For the tree with 50 at the root, 30 and 70 below, then 20, 40, 60 and 80.</p>
      <v-table>
        <thead><tr><th>Traversal</th><th>Rule</th><th>Uses</th><th>Visit order</th></tr></thead>
        <tbody>
          <tr v-for="c in cheat" :key="c.order">
            <td class="font-medium">{{ c.name }}</td>
            <td>{{ c.rule }}</td>
            <td>{{ c.uses }}</td>
            <td class="font-mono">{{ traversalOrder(sampleTree, c.order).join(' ') }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <div class="flex flex-wrap gap-2.5">
      <v-btn to="/quizzes" variant="outlined" color="primary-darken-1" class="bg-white">Retake a quiz</v-btn>
      <v-btn to="/notes" variant="outlined" color="primary-darken-1" class="bg-white">Open my notes</v-btn>
    </div>
  </div>
</template>
