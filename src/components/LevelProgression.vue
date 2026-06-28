<template>
    <div class="m-6 p-6 border-purple-500 border-2 rounded-xl h-fit">
        <div class="mb-3 flex justify-between">
            <span class="text-2xl self-center">Level Progression</span>
            <div class="flex">
                <ArrowLeftIcon class="hover:stroke-purple-500 m-3 w-6 h-6 cursor-pointer" @click="changeLevel(-1)" />
                <span class="self-center text-2xl">{{ `Level: ${displayedLevel}` }}</span>
                <ArrowRightIcon class="hover:stroke-purple-500 m-3 w-6 h-6 cursor-pointer" @click="changeLevel(1)" />
            </div>
            <span class="text-lg self-center">({{ gurudKanji }} / {{ kanjiGurudToLevel }}) Kanji
                Guru'd to Level</span>
        </div>
        <div id="level-progress-bar" class="flex flex-row justify-between px-1 mb-3">
            <div v-for="index in kanjiGurudToLevel" :key="index" class="border h-6 w-full mx-0.5"
                :style="{ backgroundColor: (gurudKanji >= index) ? 'limegreen' : 'gray' }"></div>
        </div>
        <div class="mb-1"><span class="text-xl">Radicals ({{ gurudRadicals }}/{{ radicals.length }})</span></div>
        <hr class="mb-3" />
        <div class="mb-6 flex flex-row flex-wrap">
            <div v-for="r in radicals" :key="r.subject.id">
                <SubjectBadge :subject="r.subject" :assignment="r.assignment" />
            </div>
        </div>
        <div class="mb-1"><span class="text-xl">Kanji ({{ gurudKanji }}/{{ kanji.length }})</span></div>
        <hr class="mb-3" />
        <div class="mb-6 flex flex-row flex-wrap">
            <div v-for="k in kanji" :key="k.subject.id">
                <SubjectBadge :subject="k.subject" :assignment="k.assignment" />
            </div>
        </div>
        <div class="mb-1"><button @click="toggleVocabulary"
                class="text-xl border border-purple-500 bg-purple-500 text-white hover:bg-purple-600">
                Vocabulary ({{ gurudVocabulary }}/{{ vocabulary.length }})</button></div>
        <hr class="mb-3" />
        <div class="mb-6 flex flex-row flex-wrap">
            <div :class="{ 'hidden': !showVocabulary }" v-for="v in vocabulary" :key="v.subject.id">
                <SubjectBadge :subject="v.subject" :assignment="v.assignment" />
            </div>
        </div>
    </div>
</template>

<style scoped>
#level-progress-bar>div:first-child {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
}

#level-progress-bar>div:last-child {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSubjectStore } from '@/stores/wanikani/subject';
import { useAssignmentStore } from '@stores/wanikani/assignments';
import { useUserStore } from '@stores/wanikani/users';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
import { sortBySubjectId } from '@/helpers/waniKaniHelpers.ts';
import SubjectBadge from './SubjectBadge.vue';

const subjectStore = useSubjectStore();
const assignmentStore = useAssignmentStore();
const userStore = useUserStore();

let displayedLevel = ref(userStore.user.userDetails?.data.level || 0);
let showVocabulary = ref(false);

let dataForLevel = ref([] as WaniKani.SubjectAssignmentPair[]);

watch(
    displayedLevel,
    (newValue, oldValue) =>
    {
        subjectStore.getSubjectsForLevel(displayedLevel.value).then(subjects =>
        {
            let relevantSubjects = subjects.filter(sub => sub.data.hiddenAt == null);
            assignmentStore.getAssignmentsForSubjectKeys(relevantSubjects.map(s => s.id!)).then(assignments =>
            {
                dataForLevel.value = relevantSubjects.map(s =>
                {
                    return {
                        subject: s,
                        assignment: assignments.find(a => a.data.subjectId === s.id)
                    }
                }).sort(sortBySubjectId(true));
            });
        });
    },
    { immediate: true }
);

const levelPassed = computed(() => { return (gurudKanji.value / kanjiGurudToLevel.value) > 1 })

const radicals = computed(() =>
{
    return dataForLevel.value.filter(s => s.subject.object === 'radical');
});

const kanji = computed(() =>
{
    return dataForLevel.value.filter(s => s.subject.object === 'kanji');
});

const vocabulary = computed(() =>
{
    return dataForLevel.value.filter(data => data.subject.object === 'vocabulary' || data.subject.object === 'kana_vocabulary');
});

const gurudRadicals = computed(() =>
{
    return radicals.value.filter(s => s.assignment?.data.passedAt != null).length;
});

const gurudKanji = computed(() =>
{
    return kanji.value.filter(s => s.assignment?.data.passedAt != null).length;
});

// 90% of the kanji need to be gurud to reach the next level rounded up 
const kanjiGurudToLevel = computed(() =>
{
    return Math.ceil(kanji.value.length * 0.9);
});

const gurudVocabulary = computed(() =>
{
    return vocabulary.value.filter(s => s.assignment?.data.passedAt != null).length;
});

function toggleVocabulary()
{
    showVocabulary.value = !showVocabulary.value;
}

function changeLevel(levelDelta: number)
{
    displayedLevel.value += levelDelta;
}

</script>