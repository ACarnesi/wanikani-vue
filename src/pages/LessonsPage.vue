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
            <div class="w-screen py-9" :subject-type="currentSubject?.subject.object">
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
                <input v-show="questionType === 'reading'" id="user-reading-input" type="text" lang='ja'
                    class="w-full text-center text-black text-2xl p-1" :value="kanaNormalizedInput"
                    :status="answerStatus" @input="handleAnswerInput" @keypress.enter="checkAnswer">
                <input v-show="questionType === 'meaning'" id="user-meaning-input" type="text" lang='en'
                    class="w-full text-center text-black text-2xl p-1" v-model="answerInput" :status="answerStatus"
                    @keypress.enter="checkAnswer">
                <div>{{ toRomaji(answerInput) }}</div>
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

input[status="warning"] {
    background-color: lightsalmon;
}

input[status="incorrect"] {
    background-color: lightcoral;
}

input[status="correct"] {
    background-color: lightgreen;
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAssignmentStore } from '@/stores/wanikani/assignments';
import { useSummaryStore } from '@stores/wanikani/summary';
import { useSubjectStore } from '@/stores/wanikani/subject';
import { useStudyMaterialStore } from '@/stores/wanikani/studyMaterial';
import { HomeIcon, EyeIcon } from '@heroicons/vue/24/outline';
import { sortBySubjectId, getBlockedMeanings, getVisibleMeanings, getVisibleReadings } from '@/helpers/waniKaniHelpers';
import * as responseHelpers from '@/helpers/responseHelpers';
import
{
    checkImpossibleKana,
    checkKanjiReadings,
    checkTransliterated,
    checkRelatedMeaningsAndReadings,
    checkKanji,
    checkLongDash,
    checkVerbStartsWithTo,
    checkSmallHiragana,
    checkN,
    checkKanjiDoesNotStartWithTo,
    type AnswerCheckAction,
    type AnswerCheckResponse,
    type AnswerPluginCheckContext
} from '@/helpers/answerPluginChecks';
import SubjectBadge from '@/components/SubjectBadge.vue';
import SubjectDetails from '@/components/SubjectDetails.vue';
import { toRomaji } from 'wanakana';
import { isKanji, isRadical, isVocabulary } from '@/@types/waniKaniTypeGuards';

const props = defineProps<{
    isLesson: boolean,
    advancedLessonSelection: boolean
}>()

const router = useRouter();
const subjectStore = useSubjectStore();
const summaryStore = useSummaryStore();
const assignmentStore = useAssignmentStore();
const studyMaterialStore = useStudyMaterialStore();

let selectedSubjectIds = ref([] as number[]);
let isAdvancedSelection = ref(props.advancedLessonSelection);
let isInReview = ref(!props.isLesson);
let isDisplayDetailsOn = ref(false);

let currentSubjectIndex = ref(0 as number);
let studyMaterial = ref(null as WaniKani.WaniKaniResource<WaniKani.StudyMaterial> | null);
let amalgamationSubjects = ref([] as WaniKani.WaniKaniResource<WaniKani.Kanji | WaniKani.Vocabulary>[]);
let componentSubjects = ref([] as WaniKani.WaniKaniResource<WaniKani.Subject>[]);
let subjectsAndAssignments = ref([] as ReviewProgress[]);
let currentBatch = ref([] as ReviewProgress[]);
let questionType = ref('meaning' as 'meaning' | 'reading');
let answerInput = ref('');
let inputHistory = ref('');
let answerSubmitted = ref(false);
let answerStatus = ref('clear' as 'clear' | 'warning' | 'correct' | 'incorrect');

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

let kanaNormalizedInput = computed(() => responseHelpers.normalizeReadingToHiragana(answerInput.value))

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

//Only use if sure the subject is not a radical
let castedKanjiVocabSubject = computed(() =>
{
    return currentSubject.value?.subject.object === 'kanji'
        ? currentSubject.value?.subject.data as WaniKani.Kanji
        : currentSubject.value?.subject.data as WaniKani.Vocabulary
})

watch(
    () => currentSubjectIndex.value,
    (newValue, oldValue) =>
    {
        if (newValue && newValue != oldValue)
        {
            let subject = currentSubject.value!.subject ?? null;
            if (isRadical(subject.data) || isKanji(subject.data))
            {
                subjectStore.getSubjectsForIds(subject.data.amalgamationSubjectIds ?? []).then(subjects =>
                {
                    amalgamationSubjects.value = subjects.map(s =>
                    {
                        return s.object === 'kanji'
                            ? s as WaniKani.WaniKaniResource<WaniKani.Kanji>
                            : s as WaniKani.WaniKaniResource<WaniKani.Vocabulary>
                    });
                });
            }

            if (isKanji(subject.data) || isVocabulary(subject.data))
            {
                subjectStore.getSubjectsForIds(subject.data.componentSubjectIds ?? []).then(subjects =>
                {
                    componentSubjects.value = subjects;
                });
            }

            studyMaterialStore.getStudyMaterial(newValue).then(r => studyMaterial.value = r);
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

    if (subjectForReview?.meaningAnswered && !['radical', 'kana_vocabulary'].includes(subjectForReview.subject.object))
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

function handleAnswerInput(event: InputEvent)
{
    answerInput.value = (event.target as HTMLInputElement).value;
    inputHistory.value += event.data;
}

function checkAnswer(): void
{
    let isMeaningType = questionType.value === 'meaning'

    // If answer previously submitted, navigate to next item or finish batch and prompt for next batch if no items left
    if (answerSubmitted.value)
    {
        //TODO: Clear any exceptions or styling based on submitted answer
        answerSubmitted.value = false;
        answerStatus.value = 'clear';
        answerInput.value = '';
        inputHistory.value = '';
        getNextReviewSubject();
        return;
    }
    // Normalize reading/meaning (trim, convert 'n's to ん for reading question types etc.)
    // Ensure meaning answers do not have japanese characters vice versa for reading answers
    answerInput.value = isMeaningType
        ? responseHelpers.normalizeResponse(answerInput.value)
        : responseHelpers.normalizeReadingResponse(kanaNormalizedInput.value);

    if (!responseHelpers.questionTypeAndResponseMatch(questionType.value, answerInput.value))
    {
        //TODO More appropriately implement warning style and messaging
        answerStatus.value = 'warning';
        return;
    }

    let checkResult = isMeaningType ? checkMeaning() : checkReading();
    let pluginCheckResult: AnswerCheckAction | null = null;
    if (!checkResult.isAccurate && !checkResult.isBlocked)
    {
        pluginCheckResult = checkPluginFunctionality(checkResult, answerInput.value);
    }

    if (pluginCheckResult)
    {

    }

    //TODO Add functionality for pass and fail outcomes

    answerSubmitted.value = true;
}

function checkMeaning(): AnswerCheckResponse
{
    let retObj: AnswerCheckResponse = {
        isAccurate: false,
        isBlocked: false,
        isPassing: false,
        multipleAnswers: false,
        matchedAnswer: null
    }

    let normalizedAnswer = responseHelpers.normalizeResponse(answerInput.value);
    let visibleMeanings = getVisibleMeanings(currentSubject.value?.subject.data!)
        .concat(studyMaterial.value?.data.meaningSynonyms ?? [])
        .map(x => responseHelpers.normalizeResponse(x));
    let blockedMeanings = getBlockedMeanings(currentSubject.value?.subject.data!)
        .map(x => responseHelpers.normalizeResponse(x));
    retObj.multipleAnswers = visibleMeanings.length > 1;

    //check if blocked
    let match = blockedMeanings.find(bm => responseHelpers.normalizeResponse(bm) === normalizedAnswer);
    if (match)
    {
        retObj.matchedAnswer = match;
        return retObj;
    }

    //Check if accurate
    match = visibleMeanings.find(vm => responseHelpers.normalizeResponse(vm) === normalizedAnswer);
    if (match)
    {
        retObj.isAccurate = true;
    }

    retObj.isPassing = retObj.isAccurate || checkIsPassing(normalizedAnswer, visibleMeanings)

    return retObj;
}

function checkIsPassing(response: string, visibleMeanings: string[]): boolean
{
    let meaningsWithDigits = visibleMeanings.filter(vm => hasDigits(vm));
    let checkAgainstDigits = hasDigits(response) && meaningsWithDigits.length > 0;

    //Return false if both response and meaning have digits but none match as expected
    if (checkAgainstDigits && !meaningsWithDigits.some(mwd => digitsMatch(response, mwd)))
    {
        return false;
    }

    let answerList = checkAgainstDigits ? meaningsWithDigits : visibleMeanings;
    const tolerance = responseHelpers.getLevenshteinTolerance(response);
    return answerList.some((answer) => responseHelpers.getLevenshteinDistance(answer, response) <= tolerance);
}

function checkReading(): AnswerCheckResponse
{
    let retObj: AnswerCheckResponse = {
        isAccurate: false,
        isBlocked: false,
        isPassing: false,
        multipleAnswers: false,
        matchedAnswer: null
    }

    //We should only reach this point if the subject object is kanji or vocabulary
    //Return false if we hit an unexpected situation
    if (!['kanji', 'vocabulary'].includes(currentSubject.value?.subject.object!))
    {
        return retObj;
    }

    let castedSubject = currentSubject.value?.subject.object === 'kanji'
        ? currentSubject.value?.subject.data as WaniKani.Kanji
        : currentSubject.value?.subject.data as WaniKani.Vocabulary

    let normalizedAnswer = responseHelpers.normalizeReadingResponse(answerInput.value);
    let visibleReadings = getVisibleReadings(castedSubject)
        .map(x => responseHelpers.normalizeReadingResponse(x));

    retObj.multipleAnswers = visibleReadings.length > 1;
    retObj.matchedAnswer = visibleReadings.find(vr => responseHelpers.normalizeResponse(vr) === normalizedAnswer) ?? null;
    retObj.isAccurate = retObj.matchedAnswer !== null;
    retObj.isPassing = retObj.isAccurate;

    return retObj;
}

function checkPluginFunctionality(result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    const context: AnswerPluginCheckContext = {
        questionType: questionType.value,
        currentSubject: currentSubject.value,
        castedKanjiVocabSubject: castedKanjiVocabSubject.value,
        inputHistory: inputHistory.value,
        studyMaterial: studyMaterial.value,
        componentSubjects: componentSubjects.value,
        amalgamationSubjects: amalgamationSubjects.value
    };

    return checkImpossibleKana(context, result, normalizedAnswer) ??
        checkKanjiReadings(context, result, normalizedAnswer) ??
        checkTransliterated(context, result, normalizedAnswer) ??
        checkRelatedMeaningsAndReadings(context, result, normalizedAnswer) ??
        checkKanji(context, result, normalizedAnswer) ??
        checkLongDash(context, result, normalizedAnswer) ??
        checkVerbStartsWithTo(context, result, normalizedAnswer) ??
        checkSmallHiragana(context, result, normalizedAnswer) ??
        checkN(context, result, normalizedAnswer) ??
        checkKanjiDoesNotStartWithTo(context, result, normalizedAnswer);
}

function toggleDisplayDetails(): void
{
    if (!answerSubmitted.value)
        return;
    else
        isDisplayDetailsOn.value = !isDisplayDetailsOn.value
}

function filterDigits(string: string)
{
    const matches = string.match(/\d+/g);
    if (matches)
    {
        return matches.sort();
    }
    return [];
}

function hasDigits(string: string)
{
    return filterDigits(string).length > 0;
}

function digitsMatch(string1: string, string2: string)
{
    return filterDigits(string1).toString() === filterDigits(string2).toString();
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