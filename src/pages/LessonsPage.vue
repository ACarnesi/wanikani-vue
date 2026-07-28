<template>
    <div class="flex">
        <!-- Home button -->
        <div class="float-left absolute m-3 w-6 h-6 cursor-pointer">
            <HomeIcon class="hover:stroke-purple-500" @click="navigateHome" />
        </div>
        <div v-if="isLesson && isAdvancedSelection">
            <div class="mx-auto w-fit">
                <h1>Lesson Selection</h1>
            </div>
            <div v-for="[level, data] in Object.entries(dataByLevel)" class="m-3">
                <div class="text-2xl">Level {{ level }}</div>
                <div v-if="data.radicals?.length > 0" class="m-3">
                    <span class="text-lg">Radicals</span>
                    <hr class="mb-3" />
                    <div class="mb-6 flex flex-row flex-wrap">
                        <div v-for="r in data.radicals" :key="r.subject.id">
                            <SubjectBadge
                                :class="selectedSubjectIds.includes(r.subject.id!) ? 'selected' : 'unselected'"
                                :subject="r.subject" :assignment="r.assignment" @click="selectSubject(r.subject.id!)" />
                        </div>
                    </div>
                </div>
                <div v-if="data.kanji?.length > 0" class="m-3">
                    <span class="text-lg">Kanji</span>
                    <hr class="mb-3" />
                    <div class="mb-6 flex flex-row flex-wrap">
                        <div v-for="k in data.kanji" :key="k.subject.id">
                            <SubjectBadge
                                :class="selectedSubjectIds.includes(k.subject.id!) ? 'selected' : 'unselected'"
                                :subject="k.subject" :assignment="k.assignment" @click="selectSubject(k.subject.id!)" />
                        </div>
                    </div>
                </div>
                <div v-if="data.vocabulary?.length > 0" class="m-3">
                    <span class="text-lg">Vocabulary</span>
                    <hr class="mb-3" />
                    <div class="mb-6 flex flex-row flex-wrap">
                        <div v-for="v in data.vocabulary" :key="v.subject.id">
                            <SubjectBadge
                                :class="selectedSubjectIds.includes(v.subject.id!) ? 'selected' : 'unselected'"
                                :subject="v.subject" :assignment="v.assignment" @click="selectSubject(v.subject.id!)" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="m-3 flex justify-center">
                <button id="begin-lessons-btn" :disabled="selectedSubjectIds.length <= 0"
                    @click="finalizeSelection()">Begin {{
                        selectedSubjectIds.length > 0 ?
                            selectedSubjectIds.length :
                            '' }}
                    Lessons</button>
            </div>
        </div>
        <div class="flex flex-col" v-else>
            <!-- Current Subject -->
            <div class="w-screen" :subject-type="currentSubject?.subject.object">
                <div class=" h-48  flex">
                    <span class="text-8xl m-auto" lang="ja">{{ currentSubject?.subject.data.characters }}</span>
                </div>
                <div class="flex">
                    <span class="text-4xl pb-3 m-auto">{{currentSubject?.subject.data.meanings.find(m =>
                        m.primary)?.meaning
                    }}</span>
                </div>
            </div>
            <div v-show="isInReview" class="bg-white h-fit border-y-2 border-y-gray-900">
                <!-- User Response -->
                <div class="bg-gray-900 w-full flex justify-center">
                    <div class="capitalize text-2xl p-2">{{ questionType }}</div>
                </div>
                <input id="user-reading-input" type="text" :lang="questionType === 'meaning' ? 'en' : 'ja'"
                    class="w-full text-center text-black text-2xl p-1" @keypress.enter="checkAnswer">
                <!-- TODO: Add second input for meanings -->
            </div>
            <!-- In Review Buttons -->
            <div class="flex justify-center w-full my-1" v-show="isInReview">
                <div class="flex justify-center w-[20%] mx-3 bg-gray-800 hover:bg-gray-700 hover:**:stroke-purple-500"
                    :disabled="!answerSubmitted" @click="toggleDisplayDetails">
                    <div class="w-6 h-6">
                        <EyeIcon />
                    </div>
                </div>
            </div>
            <div v-if="currentSubject != null" class="grow flex-auto">
                <!-- Lesson Content -->
                <SubjectDetails v-show="showSubjectDetails" :subject="currentSubject.subject"
                    :assignment="currentSubject.assignment" :isInLesson="isLesson" :displayAsTabs="!isInReview"
                    @previousSubject="updateCurrentSubject(currentSubjectIndex - 1)"
                    @nextSubject="updateCurrentSubject(currentSubjectIndex + 1)" />
            </div>
            <div class="flex align-bottom justify-center w-full" v-if="!isInReview">
                <div v-for="(data, index) in Object.values(currentBatch)">
                    <SubjectBadge :class="selectedSubjectIds.includes(data.subject.id!) ? 'selected' : 'unselected'"
                        :subject="data.subject" :assignment="data.assignment" @click="updateCurrentSubject(index)" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.unselected {
    opacity: 50%;
}

#begin-lessons-btn {
    background-color: var(--color-purple-500);
}

#begin-lessons-btn:disabled {
    opacity: 50%;
    cursor: not-allowed;
}

div[subject-type="radical"] {
    background-color: var(--color-radical-primary)
}

div[subject-type="kanji"] {
    background-color: var(--color-pink-500)
}

div[subject-type="vocabulary"],
div[subject-type="kana_vocabulary"] {
    background-color: var(--color-purple-700)
}

div[disabled=true] {
    cursor: not-allowed;
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAssignmentStore } from '@/stores/wanikani/assignments';
import { useSummaryStore } from '@stores/wanikani/summary';
import { useSubjectStore } from '@/stores/wanikani/subject';
import { HomeIcon, EyeIcon } from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';
import { sortBySubjectId } from '@/helpers/waniKaniHelpers';
import SubjectBadge from '@/components/SubjectBadge.vue';
import SubjectDetails from '@/components/SubjectDetails.vue';
import { bind } from 'wanakana';

//TODO update model used for batches to take whether the reading/meaning have yet to be answered 
// and also contains the model that will be sent to the WaniKani API when the assignment is complete

const props = defineProps<{
    isLesson: boolean,
    advancedLessonSelection: boolean
}>()

const router = useRouter();
const subjectStore = useSubjectStore();
const summaryStore = useSummaryStore();
const assignmentStore = useAssignmentStore();

let currentSubjectIndex = ref(0 as number);
let selectedSubjectIds = ref([] as number[]);
let isAdvancedSelection = ref(props.advancedLessonSelection);
let isInReview = ref(!props.isLesson);
let isDisplayDetailsOn = ref(false);

let subjectsAndAssignments = ref([] as ReviewProgress[]);
let currentBatch = ref([] as ReviewProgress[]);
let questionType = ref('meaning' as 'meaning' | 'reading');
let answerSubmitted = ref(false);

//Retreive either all initial lessons or reviews
let lessonSubjectIds = props.isLesson ? summaryStore.lessons[0]?.subjectIds : summaryStore.reviews[0]?.subjectIds;
subjectStore.getSubjectsForIds(lessonSubjectIds ?? []).then(subjects =>
{
    assignmentStore.getAssignmentsForSubjectKeys(subjects.map(subjects => subjects.id!)).then(assignments =>
    {
        subjectsAndAssignments.value = subjects.map(s =>
        {
            return {
                subject: s,
                assignment: assignments.find(a => a.data.subjectId === s.id),
                reviewRequest: {} as WaniKani.CreateReviewRequest,
                readingAnswered: false,
                meaningAnswered: false
            } as ReviewProgress;
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

let currentSubject = computed(() =>
{
    return currentBatch.value[currentSubjectIndex.value];
})

let showSubjectDetails = computed(() =>
{
    return (props.isLesson && !isInReview.value) || (isInReview.value && isDisplayDetailsOn.value)
})

watch(
    isAdvancedSelection,
    (newValue) =>
    {
        if (!newValue)
        {
            let userReadingInputElement = document.getElementById('user-reading-input') as HTMLInputElement;
            bind(userReadingInputElement);
        }
    },
    { immediate: true, flush: 'post' }
);

function navigateHome()
{
    router.push('/home');
}

function selectSubject(subjectId: number)
{
    let index = selectedSubjectIds.value.indexOf(subjectId);

    index > -1 ? selectedSubjectIds.value.splice(index, 1) : selectedSubjectIds.value.push(subjectId);
}

function finalizeSelection()
{
    subjectsAndAssignments.value = subjectsAndAssignments.value.filter(sa => selectedSubjectIds.value.includes(sa.subject.id!));

    //TODO: Implement batching settings based on user preferences.
    currentBatch.value = subjectsAndAssignments.value.splice(0, 5).map(sa =>
    {
        return {
            ...sa,
            reviewRequest: {} as WaniKani.CreateReviewRequest,
            readingAnswered: false,
            meaningAnswered: false
        } as ReviewProgress;
    });
    isAdvancedSelection.value = false;
}

function updateCurrentSubject(i: number)
{
    if (i < 0)
    {
        return;
    }

    else if (i > currentBatch.value.length - 1)
    {
        //TODO: update to go to reviews
        isInReview.value = true;
        getNextReviewSubject();
        return;
    }

    currentSubjectIndex.value = i;
}

function getNextReviewSubject()
{
    //TODO: Update logic based on user preference (linear, random, etc.) current logic is limited-random

    //Limited-Random: 
    //Select a random index from 1 to 10 (or max length of batch size if smaller) 
    //Select randomly between reading and meaning (or whichever is remaining if one is already answered)
    let maxRange = Math.min(currentBatch.value.length - 1, 10);
    let index = Math.floor(Math.random() * maxRange);

    let subjectForReview = currentBatch.value[index];
    currentSubjectIndex.value = index;

    if (subjectForReview?.meaningAnswered)
        questionType.value = 'reading';
    else if (subjectForReview?.readingAnswered)
        questionType.value = 'meaning';
    else
    {
        questionType.value = Math.floor(Math.random() * 2) === 0 ? 'meaning' : 'reading';
    }

    answerSubmitted.value = false;
    isDisplayDetailsOn.value = false;
}

function checkAnswer()
{
    console.log('answer submitted');

    // If answer previously submitted, navigate to next item or finish batch and prompt for next batch if no items left
    // Clear any exceptions or styling based on submitted answer
    // Normalize reading/meaning (trim, convert 'n's to ん for reading question types etc.)
    // Ensure meaning answers do not have japanese characters vice versa for reading answers

    /* WaniKani sourced unicode characters, ranges, and Regular Expressions
        const punctuationRange = '\u3000-\u303f'; // https://jrgraphix.net/r/Unicode/3000-303F
        const fullAndHalfWidthRange = '\uff00-\uff9f'; // https://jrgraphix.net/r/Unicode/FF00-FFEF
        const hiraganaRange = '\u3040-\u309f'; // https://jrgraphix.net/r/Unicode/3040-309F
        const katakanaRange = '\u30a0-\u30ff'; // https://jrgraphix.net/r/Unicode/30A0-30FF

        const hiraganaUnassigned = '\u3040';
        const hiraganaDakutens = '\u3099\u309b';
        const hiraganaHandakutens = '\u309a\u309c';
        const katakanaDoubleHyphen = '\u30a0';
        const katakanaInterpunct = '\u30fb';

        const nonKanaPattern = new RegExp(`[^${hiraganaRange}${katakanaRange}]|[${hiraganaUnassigned}|${hiraganaDakutens}|${hiraganaHandakutens}|${katakanaDoubleHyphen}|${katakanaInterpunct}]`);
        const kanaPatternExtended = new RegExp(`[${punctuationRange}${hiraganaRange}${katakanaRange}${fullAndHalfWidthRange}]`);
    */

    answerSubmitted.value = !answerSubmitted.value;
}

function toggleDisplayDetails()
{
    if (!answerSubmitted.value)
        return;
    else
        isDisplayDetailsOn.value = !isDisplayDetailsOn.value
}

interface LevelData
{
    radicals: WaniKani.SubjectAssignmentPair[],
    kanji: WaniKani.SubjectAssignmentPair[],
    vocabulary: WaniKani.SubjectAssignmentPair[]
}

interface ReviewProgress extends WaniKani.SubjectAssignmentPair
{
    meaningAnswered: boolean;
    readingAnswered: boolean;
    reviewRequest: WaniKani.CreateReviewRequest;
}

</script>