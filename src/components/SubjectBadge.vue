<template>
    <div>
        <div :style="badgeStyle" class="w-fit h-fit border rounded-md m-1">
            <button class="badge-button">
                <span v-if="!useCharacterImage">{{ props.subject.data.characters }}</span>
                <img v-else class="py-1.5" :src="characterImageData?.url" height="32" width="24">
            </button>
        </div>
        <div class="flex flex-row justify-between px-1"
            v-if="props.assignment != null && props.assignment.data.startedAt != null">
            <div v-for="index in 5" :key="index"
                :class="`level-progress border-[.5px] w-full mx-[1px] ${(props.assignment?.data.passedAt != null || props.assignment?.data.srsStage >= index) ? 'passed' : ''}`">
            </div>
        </div>
    </div>
</template>

<style scoped>
.badge-button {
    padding: 0.3rem 0.6rem;
    font-size: 1.5rem;
    font-weight: lighter;
    color: white;
}

.badge-button img {
    filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(2%) hue-rotate(307deg) brightness(108%) contrast(101%);
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

//TODO when adding themes, update image styling to re-color appropriately
const useCharacterImage = computed(() => props.subject.data.characters == null);

const characterImageData = computed(() =>
{
    let subject = props.subject.data;
    if (props.subject.object === 'radical')
    {
        let radical = subject as WaniKani.Radical;
        let characterSvgs = radical.characterImages.filter(x => x.contentType === 'image/svg+xml' && x.metadata['inlineStyles'] === true);
        let characterImage = characterSvgs[characterSvgs.length - 1];
        return characterImage;
    }

    return null;
})

const badgeStyle = computed(() =>
{
    let style = '';
    switch (props.subject.object)
    {
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

    if (props.assignment?.data.unlockedAt == null)
    {
        style += 'opacity: 0.5 ';
    }

    return style;
})
</script>