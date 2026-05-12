<template>
    <div class="flex flex-col justify-between m-6 p-6 border-teal-500 border-2 rounded-xl h-50">
        <span class="text-2xl">Reviews</span>
        <div>Number of Reviews: {{ readyToReview }}</div>
        <button class="justify-end self-end bg-teal-500" type="submit" @click.prevent="" :disabled="readyToReview === 0">Begin Reviews</button>
    </div>
</template>

<style scoped>
    button:disabled {
        background-color: #ffffff1e;
        color: #ffffff56;
        cursor: not-allowed;
    }

    button:disabled:hover {
        border: 1px solid transparent;
    }
</style>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ reviews: WaniKani.LessonReview[] }>();    

const readyToReview = computed(() => {
    return props.reviews[0]?.subjectIds.length;
})
</script>