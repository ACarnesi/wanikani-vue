<template>
    <div class="float-left absolute m-3 w-6 h-6 cursor-pointer">
        <HomeIcon class="hover:stroke-purple-500" @click="navigateHome" />
    </div>
    <div v-if="isLesson && advancedLessonSelection">
        <div class="mx-auto w-fit">
            <h1>Lesson Selection</h1>
        </div>
        <div v-for="[level, data] in Object.entries(dataByLevel)">
            <div class="text-2xl">Level {{ level }}</div>
            <div v-if="data.radicals?.length > 0">
                <hr class="mb-3" />
                <div class="mb-6 flex flex-row flex-wrap">
                    <div v-for="r in data.radicals" :key="r.subject.id">
                        <SubjectBadge :class="selectedSubjectIds.includes(r.subject.id!) ? 'selected' : 'unselected'"
                            :subject="r.subject" :assignment="r.assignment" @click="selectSubject(r.subject.id!)" />
                    </div>
                </div>
            </div>
            <div v-if="data.kanji?.length > 0">
                <hr class="mb-3" />
                <div class="mb-6 flex flex-row flex-wrap">
                    <div v-for="k in data.kanji" :key="k.subject.id">
                        <SubjectBadge :class="selectedSubjectIds.includes(k.subject.id!) ? 'selected' : 'unselected'"
                            :subject="k.subject" :assignment="k.assignment" @click="selectSubject(k.subject.id!)" />
                    </div>
                </div>
            </div>
            <div v-if="data.vocabulary?.length > 0">
                <hr class="mb-3" />
                <div class="mb-6 flex flex-row flex-wrap">
                    <div v-for="v in data.vocabulary" :key="v.subject.id">
                        <SubjectBadge :class="selectedSubjectIds.includes(v.subject.id!) ? 'selected' : 'unselected'"
                            :subject="v.subject" :assignment="v.assignment" @click="selectSubject(v.subject.id!)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <!-- Home button -->
        <div class="flex flex-col bg-purple-800">
            <div class="w-screen flex">
                <h1 class="text-3xl font-bold mx-auto">Lessons Page</h1>
            </div>
            <div class="w-screen h-48  flex">
                <!-- Current Subject -->
                <span class="text-8xl m-auto">女権</span>
            </div>
        </div>
        <div class="bg-white h-12 border-2 border-y-purple-700">
            <!-- User Response -->
        </div>
        <div v-if="Object.entries(dataByLevel).length > 0">
            <!-- Lesson Content -->
            <SubjectDetails :subject="currentSubject" :assignment="currentAssignment" :isInLesson="false"
                :displayAsTabs="false" />
        </div>
        {{ isLesson }}
    </div>
</template>

<style scoped>
.unselected {
    opacity: 50%;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAssignmentStore } from '@/stores/wanikani/assignments';
import { useSummaryStore } from '@stores/wanikani/summary';
import { useSubjectStore } from '@/stores/wanikani/subject';
import { HomeIcon } from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';
import { sortBySubjectId } from '@/helpers/waniKaniHelpers';
import SubjectBadge from '@/components/SubjectBadge.vue';
import SubjectDetails from '@/components/SubjectDetails.vue';

const props = defineProps<{
    isLesson: boolean,
    advancedLessonSelection: boolean
}>()

const router = useRouter();
const subjectStore = useSubjectStore();
const summaryStore = useSummaryStore();
const assignmentStore = useAssignmentStore();

let currentSubject = {} as WaniKani.WaniKaniResource<WaniKani.Subject>;
let currentAssignment = {} as WaniKani.WaniKaniResource<WaniKani.Assignment>;
let selectedSubjectIds = ref([] as number[]);

let subjectsAndAssignments = ref([] as WaniKani.SubjectAssignmentPair[]);

//Retreive either all initial lessons or reviews
let lessonSubjectIds = props.isLesson ? summaryStore.lessons[0]?.subjectIds : summaryStore.reviews[0]?.subjectIds;
subjectStore.getSubjectsForIds(lessonSubjectIds ?? []).then(subjects =>
{
    currentSubject = subjects[0]!;

    assignmentStore.getAssignmentsForSubjectKeys(subjects.map(subjects => subjects.id!)).then(assignments =>
    {
        subjectsAndAssignments.value = subjects.map(s =>
        {
            return {
                subject: s,
                assignment: assignments.find(a => a.data.subjectId === s.id)
            }
        }).sort(sortBySubjectId(true));
    });
});

let dataByLevel = computed(() =>
{
    return subjectsAndAssignments.value.reduce((acc: Record<number, LevelData>, record) =>
    {
        let level = record.subject.data.level;
        let levelData = acc[level] ??= {} as LevelData;

        switch (record.subject.object)
        {
            case 'radical':
                (levelData.radicals ??= []).push(record);
                break;
            case 'kanji':
                (levelData.kanji ??= []).push(record);
                break;
            case 'vocabulary':
            case 'kana_vocabulary':
                (levelData.vocabulary ??= []).push(record);
                break;
        }

        return acc;
    }, {});
});

function selectSubject(subjectId: number)
{
    let index = selectedSubjectIds.value.indexOf(subjectId);

    index > -1 ? selectedSubjectIds.value.splice(index, 1) : selectedSubjectIds.value.push(subjectId);
}

function navigateHome()
{
    router.push('/home');
}

interface LevelData
{
    radicals: WaniKani.SubjectAssignmentPair[],
    kanji: WaniKani.SubjectAssignmentPair[],
    vocabulary: WaniKani.SubjectAssignmentPair[]
}

</script>