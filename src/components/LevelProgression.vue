<template>
    <div class="m-6 p-6 border-purple-500 border-2 rounded-xl h-fit">
        <div class="mb-6"><span class="text-2xl">Level Progression</span></div>
        <div class="mb-3"><span class="text-xl">Radicals</span></div>
        <div class="mb-6 flex flex-row flex-wrap">
            <div v-for="a in radicalAssignments">
                <SubjectBadge :subject="subjectsForLevel.find(s => s.id === a.data.subjectId)!.data" :assignment="a.data" />
            </div>  
        </div>
        <div class="mb-3"><span class="text-xl">Kanji</span></div>
        <div class="mb-6 flex flex-row flex-wrap">
            <div v-for="a in kanjiAssignments">
                <SubjectBadge :subject="subjectsForLevel.find(s => s.id === a.data.subjectId)!.data" :assignment="a.data" />
            </div>  
        </div>
        <div class="mb-3"><span class="text-xl">Vocabulary</span></div>
        <div class="mb-6 flex flex-row flex-wrap">
            <div v-for="a in vocabularyAssignments">
                <SubjectBadge :subject="subjectsForLevel.find(s => s.id === a.data.subjectId)!.data" :assignment="a.data" />
            </div>  
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSubjectStore } from '@/stores/wanikani/subject';
import { useAssignmentStore } from '@stores/wanikani/assignments';
import { useUserStore } from '@stores/wanikani/users';
import SubjectBadge from './SubjectBadge.vue';

const subjectStore = useSubjectStore();
const assignmentStore = useAssignmentStore();
const userStore = useUserStore();

let displayedLevel = ref(userStore.user.userDetails?.data.level || 0);
let subjectsForLevel = ref([] as WaniKani.WaniKaniResource<WaniKani.Subject>[]);
let levelAssignments = ref([] as WaniKani.WaniKaniResource<WaniKani.Assignment>[]);

subjectStore.getSubjectsForLevel(displayedLevel.value).then(subjects => {
    subjectsForLevel.value = subjects;

    assignmentStore.getAssignmentsForSubjectKeys(subjectsForLevel.value.map(s => s.id!)).then(assignments => {
        levelAssignments.value = assignments;
    });
});

const radicalAssignments = computed(() => {
    return levelAssignments.value.filter(a => a.data.subjectType === 'radical');
});

const kanjiAssignments = computed(() => {
    return levelAssignments.value.filter(a => a.data.subjectType === 'kanji');
});

const vocabularyAssignments = computed(() => {
    return levelAssignments.value.filter(a => a.data.subjectType === 'vocabulary' || a.data.subjectType === 'kana_vocabulary');
});

//TODO Create SubjectBadge components and begin building out Level Progression UI

</script>