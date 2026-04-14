<template>
    <div class="m-6 p-6 border-purple-500 border-2 rounded-xl w-100 h-75">
        <span>Lessons</span>
        <div>Number of Lessons: {{ lessons[0]?.subjectIds.length }}</div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ lessons: WaniKani.LessonReview[] }>();    

</script>