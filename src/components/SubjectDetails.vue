<template>
    <div>
        <div v-if="displayAsTabs" class="">

        </div>
        <div>

        </div>
    </div>
</template>

<script setup lang="ts">
import SubjectBadge from '@/components/SubjectBadge.vue';
import { ref, computed } from 'vue';

const props = defineProps<{
    subject: WaniKani.WaniKaniResource<WaniKani.Subject>,
    assignment: WaniKani.WaniKaniResource<WaniKani.Assignment> | undefined,
    isInLesson: boolean,
    displayAsTabs: boolean
}>();

const emit = defineEmits(['previousSubject', 'nextSubject']);

const tabIndex = ref(0);

const tabHeaders = computed(() =>
{
    switch (props.subject.object)
    {
        case 'radical':
            return ['Name', 'Examples'];
        case 'kanji':
            return ['Radicals', 'Meaning', 'Readings', 'Examples'];
        case 'vocabulary':
            return ['Kanji', 'Meaning', 'Reading', 'Context'];
        case 'kana_vocabulary':
            return ['Meaning', 'Pronunciation', 'Context'];
        default:
            return [];
    }
});

function previousTab()
{
    if (tabIndex.value <= 0)
    {
        emit('previousSubject');
    }

    tabIndex.value--;
}

function nextTab()
{
    if (tabIndex.value >= tabHeaders.value.length)
    {
        emit('nextSubject');
    }

    tabIndex.value++;
}

</script>