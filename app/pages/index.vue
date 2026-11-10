<!-- app/pages/index.vue
     Home / Overview page: what's next, progress, concept mastery, badges, lecture notes. -->
<script setup lang="ts">
useHead({ title: 'Overview · TreeQuest' })

const {
  nextStep, lastDoneStep, doneCount, totalSteps, timeLeft,
  path, concepts, badges, notes,
} = useProgress()

const heading = computed(() =>
  nextStep.value
    ? doneCount.value === 0
      ? 'Welcome to TreeQuest.'
      : `Welcome back. ${nextStep.value.short} is next.`
    : 'You’re ready for the lecture.',
)

const intro = computed(() => {
  if (!nextStep.value) return 'You’ve finished every step. Look over your lecture questions before class.'
  if (doneCount.value === 0)
    return 'Before your lecture on trees, you’ll learn what a binary search tree is and how BFS and DFS walk through one. It takes about 45 minutes, and your progress is saved on this device.'
  return `You’ve finished ${doneCount.value} of ${totalSteps} steps. Next up: ${nextStep.value.label.replace(/^\d · /, '')}, about ${nextStep.value.minutes} minutes.`
})

const firstNote = computed(() => notes.value.split('\n').find(l => l.trim()) ?? '')

const statusChip = {
  mastered:   { text: 'Mastered',    color: 'success' },
  practising: { text: 'Practising',  color: 'primary-darken-1' },
  none:       { text: 'Not started', color: undefined },
} as const

const barColor = { mastered: 'success', practising: 'primary', none: 'grey-lighten-1' } as const
</script>

<template>
  <div class="mx-auto max-w-[1040px] px-4 py-6 sm:px-8 sm:py-8 flex flex-col gap-6">

    <!-- Hero: what to do next -->
    <section class="rounded-2xl bg-tq-yellow-light p-6 sm:p-8 flex flex-wrap items-center gap-6">
      <div class="flex-[999_1_420px] min-w-0">
        <div class="text-xs font-medium tracking-widest uppercase text-tq-gold">
          Before your COS 212 lecture
        </div>
        <h1 class="mt-2 mb-3 text-[28px] sm:text-[32px] leading-tight font-medium text-tq-ink">
          {{ heading }}
        </h1>
        <p class="mb-6 max-w-xl text-base leading-relaxed text-gray-700">
          {{ intro }}
        </p>
        <div class="flex flex-wrap gap-3">
          <v-btn
            v-if="nextStep"
            :to="nextStep.to"
            color="primary"
            size="large"
            flat
            append-icon="mdi-arrow-right"
          >
            {{ doneCount === 0 ? 'Start' : `Continue to ${nextStep.short}` }}
          </v-btn>
          <v-btn
            v-if="lastDoneStep"
            :to="lastDoneStep.to"
            variant="outlined"
            color="primary-darken-1"
            size="large"
          >
            Review {{ lastDoneStep.short }}
          </v-btn>
        </div>
      </div>

      <!-- Decorative mini tree (current node yellow, queue nodes dashed blue) -->
      <div class="flex-[1_1_220px] flex justify-center" aria-hidden="true">
        <svg width="220" height="150" viewBox="0 0 220 150">
          <g stroke="#C9B26A" stroke-width="2">
            <line x1="110" y1="28" x2="55" y2="80" /><line x1="110" y1="28" x2="165" y2="80" />
            <line x1="55" y1="80" x2="25" y2="128" /><line x1="55" y1="80" x2="85" y2="128" />
            <line x1="165" y1="80" x2="140" y2="128" /><line x1="165" y1="80" x2="195" y2="128" />
          </g>
          <g font-family="Roboto, sans-serif" font-size="14" font-weight="500" text-anchor="middle">
            <circle cx="110" cy="28" r="18" fill="#F2B807" stroke="#FFE48A" stroke-width="4" />
            <text x="110" y="33" fill="#1F1A0A">50</text>
            <circle cx="55" cy="80" r="18" fill="#FFFFFF" stroke="#8A6500" stroke-width="2" />
            <text x="55" y="85" fill="#1F1A0A">30</text>
            <circle cx="165" cy="80" r="18" fill="#FFFFFF" stroke="#8A6500" stroke-width="2" />
            <text x="165" y="85" fill="#1F1A0A">70</text>
            <circle cx="25" cy="128" r="18" fill="#E8F0FA" stroke="#2F6FB5" stroke-width="2" stroke-dasharray="4 3" />
            <text x="25" y="133" fill="#1F1A0A">20</text>
            <circle cx="85" cy="128" r="18" fill="#E8F0FA" stroke="#2F6FB5" stroke-width="2" stroke-dasharray="4 3" />
            <text x="85" y="133" fill="#1F1A0A">40</text>
            <circle cx="140" cy="128" r="18" fill="#E8F0FA" stroke="#2F6FB5" stroke-width="2" stroke-dasharray="4 3" />
            <text x="140" y="133" fill="#1F1A0A">60</text>
            <circle cx="195" cy="128" r="18" fill="#E8F0FA" stroke="#2F6FB5" stroke-width="2" stroke-dasharray="4 3" />
            <text x="195" y="133" fill="#1F1A0A">80</text>
          </g>
        </svg>
      </div>
    </section>

    <!-- Quick stats -->
    <div class="grid gap-4 sm:grid-cols-3">
      <v-card class="p-6">
        <div class="text-[13px] text-gray-600">Steps done</div>
        <div class="mt-1 mb-3 text-[28px] font-medium">
          {{ doneCount }} <span class="text-base font-normal text-gray-600">of {{ totalSteps }}</span>
        </div>
        <v-progress-linear
          :model-value="(doneCount / totalSteps) * 100"
          color="primary"
          bg-color="grey-lighten-2"
          height="8"
          rounded
          aria-label="Steps done"
        />
      </v-card>
      <v-card class="p-6">
        <div class="text-[13px] text-gray-600">Time left</div>
        <div class="mt-1 mb-1 text-[28px] font-medium">≈ {{ timeLeft }} min</div>
        <div class="text-[13px] text-gray-600">For the remaining steps</div>
      </v-card>
      <v-card class="p-6">
        <div class="text-[13px] text-gray-600">Your path</div>
        <div class="mt-1 mb-1 text-[28px] font-medium capitalize">{{ path }}</div>
        <div class="text-[13px] text-gray-600">Set by your diagnostic quiz</div>
      </v-card>
    </div>

    <!-- Mastery + badges -->
    <div class="flex flex-wrap items-start gap-6">
      <v-card class="flex-[2_1_420px] min-w-0 p-6" aria-labelledby="mastery-h">
        <h2 id="mastery-h" class="mb-1 text-lg font-medium">Concept mastery</h2>
        <p class="mb-5 text-sm text-gray-600">
          70% or more counts as mastered. Below that, you’ll get extra support before you retry.
        </p>
        <ul class="flex flex-col gap-[18px]">
          <li v-for="c in concepts" :key="c.key">
            <div class="mb-2 flex items-center gap-3">
              <span class="flex-1 text-[15px]">{{ c.label }}</span>
              <span class="min-w-9 text-right text-sm text-gray-700">
                {{ c.score == null ? '–' : `${c.score}%` }}
              </span>
              <v-chip size="small" variant="tonal" :color="statusChip[c.status].color">
                {{ statusChip[c.status].text }}
              </v-chip>
            </div>
            <v-progress-linear
              :model-value="c.score ?? 0"
              :color="barColor[c.status]"
              bg-color="grey-lighten-2"
              height="8"
              rounded
              :aria-label="c.label"
            />
          </li>
        </ul>
      </v-card>

      <v-card class="flex-[1_1_260px] min-w-0 p-6" aria-labelledby="badges-h">
        <h2 id="badges-h" class="mb-4 text-lg font-medium">Badges</h2>
        <ul class="flex flex-col gap-[14px]">
          <li v-for="b in badges" :key="b.key" class="flex items-center gap-[14px]">
            <v-avatar
              size="44"
              :color="b.earned ? 'primary' : 'grey-lighten-3'"
            >
              <v-icon
                :icon="b.earned ? 'mdi-star-outline' : 'mdi-lock-outline'"
                :color="b.earned ? 'on-primary' : 'grey-darken-1'"
              />
            </v-avatar>
            <div class="min-w-0">
              <div class="text-[15px] font-medium">{{ b.name }}</div>
              <div class="text-[13px] text-gray-600">
                {{ b.earned ? `Earned: ${b.how.toLowerCase()}` : b.how }}
              </div>
            </div>
          </li>
        </ul>
      </v-card>
    </div>

    <!-- Lecture notes teaser -->
    <v-card class="p-6 flex flex-wrap items-center gap-4" aria-labelledby="notes-h">
      <div class="flex-[999_1_360px] min-w-0">
        <h2 id="notes-h" class="mb-1.5 text-lg font-medium">Questions for the lecture</h2>
        <p class="text-[15px] leading-normal text-gray-700">
          <template v-if="firstNote">“{{ firstNote }}”</template>
          <template v-else>No questions yet. Add one whenever something doesn’t make sense.</template>
        </p>
      </div>
      <v-btn to="/summary" variant="outlined" color="primary-darken-1">Open notes</v-btn>
    </v-card>

  </div>
</template>