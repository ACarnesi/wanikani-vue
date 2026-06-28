<template>
    <div class="flex flex-col justify-between m-6 p-6 border-purple-500 border-2 rounded-xl h-50">
        <span class="text-2xl">Lessons</span>
        <div>Number of Lessons: {{ lessons[0]?.subjectIds.length }}</div>
        <button class="justify-end self-end bg-purple-500" type="submit" @click.prevent="startLessons(true, false)">
            Begin Lessons
        </button>
        <button class="justify-end self-end border-purple-500" type="submit" @click.prevent="startLessons(true, true)">
            Advanced Selection
        </button>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps<{ lessons: WaniKani.LessonReview[] }>();
const router = useRouter();

function startLessons(isLesson: boolean, isAdvancedLessonSelection: boolean)
{
    let query = `?isLesson=${isLesson}&advancedLessonSelection=${isAdvancedLessonSelection}`;

    router.push(`/lessons/${query}`);
}

</script>