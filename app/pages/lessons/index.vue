<!-- /lessons → jump to the next unfinished lesson -->
<script setup lang="ts">
const { lessons } = useContent()
const { nextLesson } = useProgress()
await navigateTo(`/lessons/${(nextLesson.value ?? lessons[0])!.slug}`, { replace: true })
</script>

<template>
  <div />
</template>
