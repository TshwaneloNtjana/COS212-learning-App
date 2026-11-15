<!-- Shared shell: yellow app bar + side menu (Dashboard, Lessons, Quizzes, Summary, Notes). -->
<script setup lang="ts">
const { lessons } = useContent()
const { overallPercent, lessonStatus, lessonsDone, openNotes } = useProgress()
const route = useRoute()

// The menu is always visible from 960px wide; on smaller screens it opens from the hamburger button.
const { mdAndUp } = useDisplay()
const drawer = ref(false)
const lessonsOpen = ref(['lessons'])

const lessonIcon = (slug: string) => {
  const s = lessonStatus(slug)
  return s === 'done' ? 'mdi-check-circle' : s === 'started' ? 'mdi-record-circle-outline' : 'mdi-circle-outline'
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <v-app-bar-nav-icon v-if="!mdAndUp" aria-label="Open menu" @click="drawer = !drawer" />

      <NuxtLink to="/" class="flex items-center gap-2 ml-4 text-inherit no-underline" aria-label="Mainframe dashboard">
        <v-icon icon="mdi-file-tree" size="28" />
        <span class="text-xl font-bold">Mainframe</span>
      </NuxtLink>
      <span class="hidden md:inline ml-4 text-sm text-[#4A3D10] whitespace-nowrap">COS 212 · Trees and BFS</span>

      <v-spacer />

      <div class="hidden sm:flex items-center gap-3 mr-2">
        <span class="text-sm font-medium whitespace-nowrap">{{ overallPercent }}% done</span>
        <v-progress-linear
          :model-value="overallPercent"
          color="on-primary"
          bg-color="on-primary"
          :bg-opacity="0.15"
          height="6"
          rounded
          class="w-36"
          aria-label="Overall progress"
        />
      </div>
      <v-btn icon="mdi-note-text-outline" to="/notes" aria-label="My notes" />
    </v-app-bar>

    <v-navigation-drawer
      :model-value="mdAndUp || drawer"
      :permanent="mdAndUp"
      width="280"
      @update:model-value="drawer = $event"
    >
      <v-list v-model:opened="lessonsOpen" nav density="comfortable" class="px-3 pt-4" color="on-primary" active-class="bg-primary">
        <v-list-item to="/" exact prepend-icon="mdi-view-dashboard-outline" title="Dashboard" rounded="xl" />

        <v-list-group value="lessons">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-book-open-variant-outline"
              title="Lessons"
              rounded="xl"
              :active="route.path.startsWith('/lessons')"
            >
              <template #append>
                <span class="text-xs text-tq-muted mr-1">{{ lessonsDone }} of {{ lessons.length }}</span>
              </template>
            </v-list-item>
          </template>
          <v-list-item
            v-for="l in lessons"
            :key="l.slug"
            :to="`/lessons/${l.slug}`"
            :title="`${l.number} · ${l.title.split(':')[0]}`"
            rounded="xl"
            density="compact"
          >
            <template #prepend>
              <v-icon
                :icon="lessonIcon(l.slug)"
                :color="lessonStatus(l.slug) === 'done' ? 'success' : 'primary-darken-1'"
                size="20"
              />
            </template>
          </v-list-item>
        </v-list-group>

        <v-list-item to="/quizzes" prepend-icon="mdi-clipboard-check-outline" title="Quizzes" rounded="xl" />
        <v-list-item to="/summary" prepend-icon="mdi-text-box-outline" title="Summary" rounded="xl" />
        <v-list-item to="/notes" prepend-icon="mdi-note-text-outline" title="Notes" rounded="xl">
          <template v-if="openNotes.length" #append>
            <span class="text-xs text-tq-muted">{{ openNotes.length }} open</span>
          </template>
        </v-list-item>
      </v-list>

      <template #append>
        <div class="m-4 p-4 rounded-xl bg-tq-yellow-light">
          <div class="text-sm font-medium">Confused by something?</div>
          <div class="text-[13px] text-[#4A3D10] mt-1 leading-snug">Write it in Notes and bring it to class.</div>
          <NuxtLink to="/notes" class="inline-block mt-2.5 text-sm font-medium text-tq-gold">Add a note →</NuxtLink>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <div class="mx-auto px-4 py-6 sm:px-8 sm:py-8">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>
