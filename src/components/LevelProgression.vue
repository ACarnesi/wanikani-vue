<template>
    <div class="m-6 p-6 border-purple-500 border-2 rounded-xl h-fit">
        <div class="mb-6"><span class="text-2xl">Level Progression</span></div>
        <div class="mb-3"><span class="text-xl">Radicals</span></div>
        <div class="mb-6 flex flex-row flex-wrap">
            <div v-for="r in radicals" :key="r.subject.id">
                <SubjectBadge :subject="r.subject" :assignment="r.assignment" />
            </div>  
        </div>
        <div class="mb-3"><span class="text-xl">Kanji</span></div>
        <div class="mb-6 flex flex-row flex-wrap">
            <div v-for="k in kanji" :key="k.subject.id">
                <SubjectBadge :subject="k.subject" :assignment="k.assignment" />
            </div>  
        </div>
        <div class="mb-3"><span class="text-xl">Vocabulary</span></div>
        <div class="mb-6 flex flex-row flex-wrap">
            <div v-for="v in vocabulary" :key="v.subject.id">
                <SubjectBadge :subject="v.subject" :assignment="v.assignment" />
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

interface SubjectAssignmentPair {
    subject: WaniKani.WaniKaniResource<WaniKani.Subject>,
    assignment: WaniKani.WaniKaniResource<WaniKani.Assignment> | undefined
}

let dataForLevel = ref([] as SubjectAssignmentPair[]);

subjectStore.getSubjectsForLevel(displayedLevel.value).then(subjects => {
    assignmentStore.getAssignmentsForSubjectKeys(subjects.map(s => s.id!)).then(assignments => {
        dataForLevel.value = subjects.map(s => {
            return {
                subject: s,
                assignment: assignments.find(a => a.data.subjectId === s.id)
            }
        }).sort(sortBySubjectId(true));
    });
});

const radicals = computed(() => {
    return dataForLevel.value.filter(s => s.subject.object === 'radical');
});

const kanji = computed(() => {
    return dataForLevel.value.filter(s => s.subject.object === 'kanji');
});

const vocabulary = computed(() => {
    return dataForLevel.value.filter(data => data.subject.object === 'vocabulary' || data.subject.object === 'kana_vocabulary');
});

//TODO Create SubjectBadge components and begin building out Level Progression UI
function sortBySubjectId(ascending: boolean) {
    return function(a: SubjectAssignmentPair, b: SubjectAssignmentPair) {
        let aVal = a.assignment?.data.subjectId ?? null; 
        let bVal = b.assignment?.data.subjectId ?? null;
        
        if (aVal === bVal) {
            return 0;
        }

        // nulls sort after anything else
        if (aVal === null) {
            return 1;
        }
        if (bVal === null) {
            return -1;
        }

        if (a.assignment?.data.startedAt != null && b.assignment?.data.startedAt == null) {
            return -1;
        }
        else if (a.assignment?.data.startedAt == null && b.assignment?.data.startedAt != null) {
            return 1;
        }

        // otherwise, if we're ascending, lowest sorts first
        if (ascending) {
            return aVal < bVal ? -1 : 1;
        }

        // if descending, highest sorts first
        return aVal < bVal ? 1 : -1;
    }
}

</script>