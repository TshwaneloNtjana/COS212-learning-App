<!-- app/layouts/default.vue
     Shared shell for every page: yellow app bar + "Your path" side menu. -->
<script setup lang="ts">
const { steps, overallPercent } = useProgress()
const route = useRoute()

// null = let Vuetify decide: open on desktop, closed (hamburger) on phones
const drawer = ref<boolean | null>(null)

const isCurrent = (to: string) => route.path === to
</script>

<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <v-app-bar-nav-icon
        class="d-lg-none"
        aria-label="Open lesson path"
        @click="drawer = !drawer"
      />

      <NuxtLink
        to="/"
        class="flex items-center gap-2 ml-4 text-inherit no-underline"
        aria-label="TreeQuest home"
      >
        <v-icon icon="mdi-file-tree" size="28" />
        <span class="text-xl font-medium">TreeQuest</span>
      </NuxtLink>

      <span class="hidden md:inline ml-4 text-sm opacity-80 whitespace-nowrap">
        COS 212 · Trees and traversals
      </span>

      <v-spacer />

      <div class="hidden sm:flex items-center gap-3 mr-2">
        <span class="text-sm whitespace-nowrap">{{ overallPercent }}% done</span>
        <v-progress-linear
          :model-value="overallPercent"
          color="on-primary"
          bg-color="on-primary"
          :bg-opacity="0.15"
          height="6"
          rounded
          class="!w-36"
          aria-label="Overall progress"
        />
      </div>

      <v-btn icon="mdi-help-circle-outline" aria-label="Help" />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" width="280">
      <div class="px-5 pt-5 pb-2 text-xs font-medium tracking-widest uppercase text-gray-600">
        Your path
      </div>

      <v-list nav density="comfortable" class="px-3">
        <v-list-item
          v-for="s in steps"
          :key="s.key"
          :to="s.to"
          :title="s.label"
          exact
          rounded="xl"
          color="primary-darken-1"
          :aria-current="isCurrent(s.to) ? 'page' : undefined"
        >
          <template #prepend>
            <div class="w-7 mr-3 flex justify-center">
              <v-icon v-if="s.key === 'home'" icon="mdi-home-outline" />
              <v-icon v-else-if="isCurrent(s.to)" icon="mdi-record-circle-outline" color="primary-darken-1" />
              <v-icon v-else-if="s.done" icon="mdi-check-circle" color="success" />
              <span
                v-else
                class="w-[22px] h-[22px] rounded-full border-[1.5px] border-gray-500 text-xs text-gray-600 flex items-center justify-center"
              >{{ s.num }}</span>
            </div>
          </template>
          <template v-if="s.done && !isCurrent(s.to)" #append>
            <span class="text-xs text-tq-gold">Done</span>
          </template>
        </v-list-item>
      </v-list>

      <template #append>
        <div class="m-4 p-4 rounded-xl bg-tq-bg">
          <div class="text-sm font-medium">Stuck on something?</div>
          <div class="text-[13px] text-gray-600 mt-1 leading-snug">
            Add it to your lecture notes and bring it to class.
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <slot />
    </v-main>
  </v-app>
</template>