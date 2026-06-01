<template>
    <div :style="badgeStyle " class="w-fit h-fit border rounded-md m-1 text-">
        <button>{{ props.subject.data.characters }}</button>
    </div>
    <div class="flex flex-row justify-between px-1" v-if="props.assignment != null && props.assignment.data.startedAt != null">
        <div v-for="index in 5" :key="index" :class="`level-progress ${(props.assignment?.data.passedAt != null || props.assignment?.data.srsStage >= index) ? 'passed' : ''}`"></div>
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