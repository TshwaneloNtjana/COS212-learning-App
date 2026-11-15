<!-- Accessibility settings, opened from the app bar. -->
<script setup lang="ts">
const { settings, speak } = useA11y()
const open = ref(false)
const sizes = ['Normal', 'Large', 'Larger']
const speechOk = import.meta.client && 'speechSynthesis' in window

function testVoice() { speak('Read aloud is on. Steps in the lessons will be read to you.') }
function reset() {
  settings.value = { textSize: 0, highContrast: false, reduceMotion: false, readAloud: false, treeText: false }
}
</script>

<template>
  <v-dialog v-model="open" max-width="520" scrollable aria-label="Accessibility settings">
    <template #activator="{ props: act }">
      <v-btn v-bind="act" icon="mdi-human" aria-label="Accessibility settings" title="Accessibility settings" />
    </template>
    <v-card aria-labelledby="a11y-title" class="!border-2">
      <v-card-title id="a11y-title" class="!text-xl !font-medium pt-5 px-6">Accessibility settings</v-card-title>
      <v-card-text class="px-6 flex flex-col gap-5">
        <p class="text-[15px]">These settings are saved on this device. MainFrame is designed to work with screen readers (NVDA, JAWS, VoiceOver, TalkBack) and with the keyboard alone.</p>

        <fieldset class="border-0 p-0 m-0">
          <legend class="text-base font-medium mb-2">Text and tree size</legend>
          <v-btn-toggle v-model="settings.textSize" mandatory divided variant="outlined" color="primary-darken-1" aria-label="Text and tree size">
            <v-btn v-for="(s, i) in sizes" :key="s" :value="i" :style="{ fontSize: `${14 + i * 2}px` }">{{ s }}</v-btn>
          </v-btn-toggle>
        </fieldset>

        <v-switch v-model="settings.highContrast" color="primary-darken-1" hide-details inset>
          <template #label><span><strong class="font-medium">High contrast</strong><br><span class="text-sm">Black text, white background, thick borders.</span></span></template>
        </v-switch>
        <v-switch v-model="settings.treeText" color="primary-darken-1" hide-details inset>
          <template #label><span><strong class="font-medium">Describe trees in text</strong><br><span class="text-sm">Show a written list of every node under each tree diagram.</span></span></template>
        </v-switch>
        <v-switch v-model="settings.readAloud" color="primary-darken-1" hide-details inset :disabled="!speechOk">
          <template #label><span><strong class="font-medium">Read steps aloud</strong><br><span class="text-sm">Speak each step of the search and traversal demos. Turn this off if you use a screen reader.</span></span></template>
        </v-switch>
        <v-btn v-if="settings.readAloud" variant="text" size="small" prepend-icon="mdi-volume-high" class="self-start -mt-3" @click="testVoice">Test the voice</v-btn>
        <v-switch v-model="settings.reduceMotion" color="primary-darken-1" hide-details inset>
          <template #label><span><strong class="font-medium">Reduce motion</strong><br><span class="text-sm">No animations, and slower auto-play.</span></span></template>
        </v-switch>

        <details class="text-[15px]">
          <summary class="cursor-pointer font-medium">Keyboard shortcuts</summary>
          <ul class="mt-2 list-disc pl-5 flex flex-col gap-1">
            <li><kbd>Tab</kbd> moves between buttons; <kbd>Enter</kbd> or <kbd>Space</kbd> presses them.</li>
            <li>Search playground: <kbd>←</kbd> go left, <kbd>→</kbd> go right, <kbd>=</kbd> found it.</li>
            <li>Traversal stepper: <kbd>←</kbd> step back, <kbd>→</kbd> step forward, <kbd>Space</kbd> play or pause.</li>
            <li>The first <kbd>Tab</kbd> on any page offers "Skip to main content".</li>
          </ul>
        </details>
      </v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-btn variant="text" @click="reset">Reset to defaults</v-btn>
        <v-spacer />
        <v-btn color="primary" flat @click="open = false">Done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
kbd { font-family: var(--font-mono); font-size: .85em; padding: 1px 6px; border: 1px solid #8A7F60; border-radius: 4px; background: #fff; }
</style>
