<template>
    <div :style="badgeStyle " class="w-fit h-fit border rounded-md m-1 text-">
        <button>{{ props.subject.characters }}</button>
        <div class="flex flex-row justify-between p-0.5">
            <div v-for="index in 6" :key="index" :class="`level-progress ${props.assignment.srsStage >= index ? 'passed' : ''}`"></div>
        </div>
    </div>
</template>

<style scoped>
    .level-progress {
        width: 15%;
        height: 5px;
        background-color: var(--color-gray-500);
        border-radius: 10px;
        border-color: white;
        border-width: .5px;
    }

    .level-progress.passed {
        background-color: var(--color-green-500);
    }
</style>

<script setup lang="ts">
import { computed } from 'vue';


const props = defineProps<{ subject: WaniKani.Subject, assignment: WaniKani.Assignment }>();    

const badgeStyle = computed(() => {
    let style = '';
    switch (props.assignment.subjectType) {
        case 'radical':
            style += 'background-color: var(--color-teal-500) ';
            break;
        case 'kanji':
            style += 'background-color: var(--color-pink-500) ';
            break;
        case 'vocabulary':
        case 'kana_vocabulary':
            style += 'background-color: var(--color-purple-500) ';
            break;
    }

    if (props.assignment.unlockedAt == null) {
        style += 'opacity: 0.5 ';
    }

    return style;
})
</script>