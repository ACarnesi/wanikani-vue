<template>
    <template v-for="text in textSections">
        <span v-if="text.style == null">{{ text.value }}</span>
        <span v-else :class="`px-1 my-0.5 border rounded-md inline-block ${text.style}`">{{ text.value }}</span>
    </template>
</template>

<style scoped>
.radical {
    background-color: var(--color-radical-primary);
}

.kanji {
    background-color: var(--color-pink-500);
}

.vocabulary {
    background-color: var(--color-purple-500);
}

.meaning,
.reading {
    background-color: gray;
}
</style>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    text: string
}>(); 0

let textSections = computed(() =>
{
    let regex = /(?<previousText>.*?)<(?<object>radical|kanji|vocabulary|meaning|reading)>(?<value>.*?)<\/(?:radical|kanji|vocabulary|meaning|reading)>|.+/mg;

    let sections: TextSection[] = [];
    let match;

    while ((match = regex.exec(props.text)) !== null)
    {
        if (match.groups?.previousText != null)
        {
            sections.push({
                style: null,
                value: match.groups.previousText
            });
        }

        sections.push({
            style: match.groups?.object ?? null,
            value: match.groups?.value ?? match[0]
        });
    }

    return sections;
})

interface TextSection
{
    style: string | null,
    value: string
}
</script>