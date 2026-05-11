<template>
    <div class="flex flex-col justify-between m-6 p-6 border-purple-500 border-2 rounded-xl h-50">
        <span class="text-2xl">Lessons</span>
        <div>Number of Lessons: {{ lessons[0]?.subjectIds.length }}</div>
        <button class="justify-end self-end bg-purple-500" type="submit" @click.prevent="">Begin Lessons</button>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ lessons: WaniKani.LessonReview[] }>();    

</script>