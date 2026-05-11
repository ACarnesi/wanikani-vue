<template>
    <div class="flex flex-col justify-between m-6 p-6 border-teal-500 border-2 rounded-xl h-50">
        <span class="text-2xl">Reviews</span>
        <div>Number of Reviews: {{ reviews.length }}</div>
        <button class="justify-end self-end bg-teal-500" type="submit" @click.prevent="">Begin Reviews</button>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ reviews: WaniKani.LessonReview[] }>();    

</script>