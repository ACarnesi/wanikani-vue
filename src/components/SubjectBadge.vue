<template>
    <div :style="badgeStyle " class="w-fit h-fit border rounded-md m-1">
        <button class="badge-button">{{ props.subject.data.characters }}</button>
    </div>
    <div class="flex flex-row justify-between px-1" v-if="props.assignment != null && props.assignment.data.startedAt != null">
        <div v-for="index in 5" :key="index" :class="`level-progress border-[.5px] w-full mx-[1px] ${(props.assignment?.data.passedAt != null || props.assignment?.data.srsStage >= index) ? 'passed' : ''}`"></div>
    </div>
</template>

<style scoped>
    .badge-button {
        padding: 0.3rem 0.6rem;
        font-size: 1.5rem;
        font-weight: lighter;
        color: white;
    }

    .level-progress {
        height: 5px;
        background-color: gray;
    }

    .level-progress.passed {
        background-color: limegreen;
    }

    .level-progress:first-child {
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
    }

    .level-progress:last-child {
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
    }
</style>

<script setup lang="ts">
import { computed } from 'vue';


const props = defineProps<{ 
    subject: WaniKani.WaniKaniResource<WaniKani.Subject>, 
    assignment: WaniKani.WaniKaniResource<WaniKani.Assignment> | undefined 
}>();    

const badgeStyle = computed(() => {
    let style = '';
    switch (props.subject.object) {
        case 'radical':
            style += 'background-color: var(--color-teal-500); ';
            break;
        case 'kanji':
            style += 'background-color: var(--color-pink-500); ';
            break;
        case 'vocabulary':
        case 'kana_vocabulary':
            style += 'background-color: var(--color-purple-500); ';
            break;
    }

    if (props.assignment?.data.unlockedAt == null) {
        style += 'opacity: 0.5 ';
    }

    return style;
})
</script>