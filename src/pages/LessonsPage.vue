<template>
    <div v-if="isLesson && advancedLessonSelection">
        Lesson Selection
    </div>
    <div v-else>
        <!-- Home button -->
        <div class="flex flex-col bg-purple-800">
            <div class="float-left absolute m-3 w-6 h-6 cursor-pointer">
                <HomeIcon class="hover:stroke-purple-500" @click="navigateHome" />
            </div>
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
        <div v-if="subjects.length > 0">
            <!-- Lesson Content -->
            <SubjectDetails :subject="currentSubject" :assignment="currentAssignment" :isInLesson="false"
                :displayAsTabs="false" />
        </div>
        {{ isLesson }}
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSummaryStore } from '@stores/wanikani/summary';
import { useSubjectStore } from '@/stores/wanikani/subject';
import { HomeIcon } from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';
import SubjectDetails from '@/components/SubjectDetails.vue';

const props = defineProps<{
    isLesson: boolean,
    advancedLessonSelection: boolean
}>()

const router = useRouter();
const subjectStore = useSubjectStore();
const summaryStore = useSummaryStore();

let subjects = ref([] as WaniKani.WaniKaniResource<WaniKani.Subject>[]);
let currentSubject = {} as WaniKani.WaniKaniResource<WaniKani.Subject>;
let currentAssignment = {} as WaniKani.WaniKaniResource<WaniKani.Assignment>;

let lessonSubjectIds = props.isLesson ? props.lessonSubjectIds : summaryStore.reviews[0]?.subjectIds;
subjectStore.getSubjectsForIds(lessonSubjectIds ?? []).then(s =>
{
    subjects.value = s;
    currentSubject = subjects.value[0]!;
})


function navigateHome()
{
    router.push('/home');
}
</script>