<!-- Shared shell: yellow app bar + side menu (Dashboard, Lessons, Quizzes, Summary, Notes). -->
<script setup lang="ts">
const { lessons } = useContent()
const { overallPercent, lessonStatus, lessonsDone, openNotes } = useProgress()
const route = useRoute()

const drawer = ref<boolean | null>(null) // null: open on desktop, hamburger on phones

const { settings, live } = useA11y()

// <html lang> and the accessibility classes
useHead(() => ({
  htmlAttrs: {
    lang: 'en',
    class: [
      `mf-text-${settings.value.textSize}`,
      settings.value.highContrast ? 'mf-contrast' : '',
      settings.value.reduceMotion ? 'mf-reduce-motion' : '',
    ].filter(Boolean).join(' '),
  },
}))

// After moving to another page, put keyboard/screen-reader focus on the new page's heading
const mainEl = ref<HTMLElement>()
const router = useRouter()
router.afterEach((to, from) => {
  if (to.path === from.path) return
  setTimeout(() => {
    const h1 = mainEl.value?.querySelector('h1') as HTMLElement | null
    const target = h1 ?? mainEl.value
    if (!target) return
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, 120)
})
function skipToMain() {
  const target = (mainEl.value?.querySelector('h1') as HTMLElement | null) ?? mainEl.value
  target?.setAttribute('tabindex', '-1')
  target?.focus()
}

const lessonIcon = (slug: string) => {
  const s = lessonStatus(slug)
  return s === 'done' ? 'mdi-check-circle' : s === 'started' ? 'mdi-record-circle-outline' : 'mdi-circle-outline'
}
</script>

<template>
  <v-app>
    <a href="#main-content" class="mf-skip" @click.prevent="skipToMain">Skip to main content</a>
    <!-- Live regions: screen readers read whatever announce() puts here -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ live.polite }}</div>
    <div class="sr-only" role="alert" aria-live="assertive" aria-atomic="true">{{ live.assertive }}</div>

    <v-app-bar color="primary" flat>
      <v-app-bar-nav-icon class="d-lg-none" aria-label="Open menu" @click="drawer = !drawer" />

      <NuxtLink to="/" class="flex items-center gap-2 ml-4 text-inherit no-underline" aria-label="MainFrame dashboard">
        <v-icon icon="mdi-file-tree" size="28" />
        <span class="text-xl font-bold">MainFrame</span>
      </NuxtLink>
      <span class="hidden md:inline ml-4 text-sm text-[#4A3D10] whitespace-nowrap">COS 212 · Trees and traversals</span>

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
          aria-hidden="true"
        />
      </div>
      <A11yMenu />
      <v-btn icon="mdi-note-text-outline" to="/notes" aria-label="My notes" />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" width="280" tag="nav" aria-label="Main menu">
      <!-- Plain links in a list: simple and predictable for screen readers and keyboards -->
      <ul class="mf-nav px-3 pt-4 flex flex-col gap-1">
        <li>
          <NuxtLink to="/" class="mf-nav-link" :aria-current="route.path === '/' ? 'page' : undefined">
            <v-icon icon="mdi-view-dashboard-outline" />Dashboard
          </NuxtLink>
        </li>
        <li>
          <span id="nav-lessons" class="mf-nav-link mf-nav-head">
            <v-icon icon="mdi-book-open-variant-outline" />Lessons
            <span class="ml-auto text-xs">{{ lessonsDone }} of {{ lessons.length }} done</span>
          </span>
          <ul aria-labelledby="nav-lessons" class="flex flex-col gap-1 mt-1">
            <li v-for="l in lessons" :key="l.slug">
              <NuxtLink
                :to="`/lessons/${l.slug}`"
                class="mf-nav-link pl-6 text-[15px]"
                :aria-current="route.path === `/lessons/${l.slug}` ? 'page' : undefined"
              >
                <v-icon :icon="lessonIcon(l.slug)" :color="lessonStatus(l.slug) === 'done' ? 'success' : undefined" size="20" />
                <span>{{ l.number }} · {{ l.title.split(':')[0] }}<span class="sr-only">, {{ lessonStatus(l.slug) === 'done' ? 'done' : lessonStatus(l.slug) === 'started' ? 'started' : 'not started' }}</span></span>
              </NuxtLink>
            </li>
          </ul>
        </li>
        <li>
          <NuxtLink to="/quizzes" class="mf-nav-link" :aria-current="route.path.startsWith('/quizzes') ? 'page' : undefined">
            <v-icon icon="mdi-clipboard-check-outline" />Quizzes
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/summary" class="mf-nav-link" :aria-current="route.path === '/summary' ? 'page' : undefined">
            <v-icon icon="mdi-text-box-outline" />Summary
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/notes" class="mf-nav-link" :aria-current="route.path === '/notes' ? 'page' : undefined">
            <v-icon icon="mdi-note-text-outline" />Notes
            <span v-if="openNotes.length" class="ml-auto text-xs">{{ openNotes.length }} open</span>
          </NuxtLink>
        </li>
      </ul>

      <template #append>
        <div class="m-4 p-4 rounded-xl bg-tq-yellow-light">
          <div class="text-sm font-medium">Confused by something?</div>
          <div class="text-[13px] text-[#4A3D10] mt-1 leading-snug">Write it in Notes and bring it to class.</div>
          <NuxtLink to="/notes" class="inline-block mt-2.5 text-sm font-medium text-tq-gold">Add a note →</NuxtLink>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <div id="main-content" ref="mainEl" class="mf-zoom mx-auto px-4 py-6 sm:px-8 sm:py-8 outline-none" tabindex="-1">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.mf-nav-link { display: flex; align-items: center; gap: 14px; min-height: 44px; padding: 8px 14px; border-radius: 999px; color: var(--color-tq-ink); text-decoration: none; font-size: 16px; }
a.mf-nav-link:hover { background: var(--color-tq-yellow-light); }
a.mf-nav-link[aria-current="page"] { background: var(--color-tq-yellow); font-weight: 500; }
html.mf-contrast a.mf-nav-link[aria-current="page"] { background: #000; color: #fff; }
html.mf-contrast a.mf-nav-link[aria-current="page"] :deep(.v-icon) { color: #fff; }
.mf-nav-head { font-weight: 500; }
</style>
