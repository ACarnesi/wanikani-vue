<template>
    <div>
        <div v-if="displayAsTabs" class="flex flex-row justify-between border">
            <ArrowLeftIcon class="hover:stroke-purple-500 m-3 w-6 h-6 cursor-pointer" @click="previousTab()" />
            <div class="flex justify-around flex-[.5]">
                <div v-for="(header, index) in tabHeaders" class="subject-header cursor-pointer p-3"
                    :selected="tabIndex === index" @click="tabIndex = index">
                    {{ header }}
                </div>
            </div>
            <ArrowRightIcon class="hover:stroke-purple-500 m-3 w-6 h-6 cursor-pointer" @click="nextTab()" />
        </div>
        <div>
            <!-- TODO: Add user based notes and synonyms functionality -->
            <div v-show="!displayAsTabs || (displayAsTabs && tabIndex === 0)">
                <!-- RADICAL -->
                <div v-if="isRadical(subject.data)" class="m-6">
                    <div class="text-xl my-3">Mnemonic</div>
                    <hr>
                    <div class="m-3">
                        <WaniKaniText :text="subject.data.meaningMnemonic"></WaniKaniText>
                    </div>
                </div>

                <!-- KANJI -->
                <div v-if="isKanji(subject.data)" class="m-6">
                    <div class="text-xl my-3">Radical Composition</div>
                    <hr>
                    <div class="m-3">
                        <div class="m-3">This kanji is composed of the following radicals:</div>
                        <div class="flex">
                            <div v-for="sub in componentSubjects" :key="sub.id">
                                <SubjectBadge :subject="sub" />
                                <div class="text-center">{{sub.data.meanings.find(s => s.primary)?.meaning}}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- VOCAB -->
                <div v-if="isVocabulary(subject.data)" class="m-6">
                    <div class="text-xl my-3">Kanji Composition</div>
                    <hr>
                    <div class="m-3">
                        <div class="m-3">This vocabulary is composed of the following kanji:</div>
                        <div class="flex">
                            <div v-for="sub in componentSubjects" :key="sub.id">
                                <SubjectBadge :subject="sub" />
                                <div class="text-center">{{sub.data.meanings.find(s => s.primary)?.meaning}}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="!displayAsTabs || (displayAsTabs && tabIndex === 1)">
                <!-- RADICAL -->
                <div v-if="isRadical(subject.data)" class="m-6">
                    <div class="text-xl my-3">Kanji Examples</div>
                    <hr>
                    <div class="m-3">Here are some examples of Kanji that utilize the <b>{{ primaryMeaning }}</b>
                        radical.</div>
                    <div class="flex">
                        <div v-for="sub in amalgamationSubjects" :key="sub.id">
                            <SubjectBadge :subject="sub" />
                            <div class="text-center">{{sub.data.meanings.find(s => s.primary)?.meaning}}</div>
                        </div>
                    </div>
                </div>

                <!-- KANJI -->
                <div v-if="isKanji(subject.data)" class="m-6">
                    <div class="text-xl my-3">Meaning Mnemonic</div>
                    <hr>
                    <div class="m-3">
                        <WaniKaniText :text="subject.data.meaningMnemonic"></WaniKaniText>
                        <div v-if="subject.data.meaningHint" class="m-3 p-3 border rounded-lg italic bg-gray-700">
                            <div class="font-bold">Hint: </div>{{
                                subject.data.meaningHint
                            }}
                        </div>
                    </div>
                </div>

                <!-- VOCAB -->
                <div v-if="isVocabulary(subject.data)" class="m-6 flex flex-row">
                    <div class="w-45 mx-3 shrink-0">
                        <div>
                            <div class="text-xl my-3">Word Type</div>
                            <hr>
                            <div>{{ subject.data.partsOfSpeech.join(', ') }}</div>
                        </div>
                    </div>
                    <div>
                        <div class="text-xl my-3">Meaning Mnemonic</div>
                        <hr>
                        <div class="m-3">
                            <WaniKaniText :text="subject.data.meaningMnemonic"></WaniKaniText>
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="!displayAsTabs || (displayAsTabs && tabIndex === 2)">
                <!-- KANJI -->
                <div v-if="isKanji(subject.data)" class="m-6 flex flex-row">
                    <div class="w-45 mx-3 shrink-0">
                        <div v-if="!isInLesson || kanjiReadingType === 'onyomi'">
                            <div class="text-xl my-3">Readings ({{ kanjiReadingType }})</div>
                            <hr>
                            <div>{{ onyomiReadings.join(', ') }}</div>
                        </div>
                        <div v-if="!isInLesson || kanjiReadingType === 'kunyomi'">
                            <div class="text-xl my-3">Readings ({{ kanjiReadingType }})</div>
                            <hr>
                            <div>{{ kunyomiReadings.join(', ') }}</div>
                        </div>
                        <div v-if="!isInLesson || kanjiReadingType === 'nanori'">
                            <div class="text-xl my-3">Readings ({{ kanjiReadingType }})</div>
                            <hr>
                            <div>{{ nanoriReadings.join(', ') }}</div>
                        </div>
                    </div>
                    <div>
                        <div class="text-xl my-3">Reading Mnemonic</div>
                        <hr>
                        <div class="m-3">
                            <WaniKaniText :text="subject.data.readingMnemonic"></WaniKaniText>
                            <div v-if="subject.data.readingHint" class="m-3 p-3 border rounded-lg italic bg-gray-700">
                                <div class="font-bold">Hint: </div>{{
                                    subject.data.readingHint
                                }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- VOCAB -->
                <div v-if="isVocabulary(subject.data)" class="m-6 flex flex-row">
                    <div class="w-45 mx-3 shrink-0">
                        <div>
                            <div class="text-xl my-3">Vocab Reading</div>
                            <hr>
                            <div>{{ primaryReading?.reading }}</div>
                            <!-- TODO: Add voice actor audio buttons -->
                        </div>
                    </div>
                    <div>
                        <div class="text-xl my-3">Reading Mnemonic</div>
                        <hr>
                        <div class="m-3">
                            <WaniKaniText :text="subject.data.readingMnemonic"></WaniKaniText>
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="!displayAsTabs || (displayAsTabs && tabIndex === 3)">
                <!-- KANJI -->
                <div v-if="isKanji(subject.data)" class="m-6">
                    <div class="text-xl my-3">Vocabulary Examples</div>
                    <hr>
                    <div class="m-3">Here is a glimpse of vocbaulary that utilize the <b>{{ primaryMeaning }}</b>
                        kanji.</div>
                    <div class="flex">
                        <div v-for="sub in amalgamationSubjects" :key="sub.id">
                            <SubjectBadge :subject="sub" />
                            <div class="text-center">{{sub.data.meanings.find(s => s.primary)?.meaning}}</div>
                        </div>
                    </div>
                </div>

                <!-- VOCAB -->
                <div v-if="isVocabulary(subject.data)" class="m-6">
                    <!-- TODO: If patterns of use are ever added to API, add them here -->
                    <div class="text-xl my-3">Context Sentences</div>
                    <hr>
                    <div>
                        <div class="m-3">Hover to reveal the english translations.</div>
                        <div v-for="(cs, index) in subject.data.contextSentences" :key="index" class="m-3">
                            <div class="flex">
                                <div class="self-center mr-3"><b>JA: </b></div>
                                <div class="my-1">{{ cs.ja }}</div>
                            </div>
                            <div class="flex **:hover:opacity-100">
                                <div class="self-center mr-3"><b>EN: </b></div>
                                <div class="border px-1 my-1"><span class="opacity-0">{{ cs.en
                                }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.subject-header[selected=true] {
    color: var(--color-purple-400);
    border-left: 1px solid var(--color-purple-400);
    border-right: 1px solid var(--color-purple-400);
}
</style>

<script setup lang="ts">
import { isRadical, isKanji, isVocabulary, isKanjiReading } from '@/@types/waniKaniTypeGuards';
import { useSubjectStore } from '@/stores/wanikani/subject';
import SubjectBadge from '@/components/SubjectBadge.vue';
import WaniKaniText from '@/components/WaniKaniText.vue';
import { ref, computed, watch } from 'vue';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
    subject: WaniKani.WaniKaniResource<WaniKani.Subject>,
    assignment: WaniKani.WaniKaniResource<WaniKani.Assignment> | undefined,
    isInLesson: boolean,
    displayAsTabs: boolean
}>();

const emit = defineEmits(['previousSubject', 'nextSubject']);

const subjectStore = useSubjectStore();

const tabIndex = ref(0);
let amalgamationSubjects = ref([] as WaniKani.WaniKaniResource<WaniKani.Subject>[]);
let componentSubjects = ref([] as WaniKani.WaniKaniResource<WaniKani.Subject>[]);

const primaryMeaning = computed(() =>
{
    return props.subject.data.meanings.find(s => s.primary)?.meaning;
})

const primaryReading = computed(() =>
{
    if (isKanji(props.subject.data) || isVocabulary(props.subject.data))
        return props.subject.data.readings.find(s => s.primary);

    return null;
});

const kanjiReadingType = computed(() =>
{
    if (isKanjiReading(primaryReading.value))
        return primaryReading.value.type;

    return null;
});

const readings = computed(() => 
{
    if (isKanji(props.subject.data) || isVocabulary(props.subject.data)) 
    {
        return props.subject.data.readings.sort((x, y) =>
        {
            return (x.primary === y.primary) ? 0 : x.primary ? -1 : 1;
        });
    }

    return [];
});

const onyomiReadings = computed(() =>
{
    return readings.value.every(r => isKanjiReading(r)) ? readings.value.filter(r => r.type === 'onyomi').map(r => r.reading) : [];
})

const kunyomiReadings = computed(() =>
{
    return readings.value.every(r => isKanjiReading(r)) ? readings.value.filter(r => r.type === 'kunyomi').map(r => r.reading) : [];
})

const nanoriReadings = computed(() =>
{
    return readings.value.every(r => isKanjiReading(r)) ? readings.value.filter(r => r.type === 'nanori').map(r => r.reading) : [];
})

if (isRadical(props.subject.data) || isKanji(props.subject.data))
{
    subjectStore.getSubjectsForIds(props.subject.data.amalgamationSubjectIds ?? []).then(subjects =>
    {
        amalgamationSubjects.value = subjects;
    });
}

if (isKanji(props.subject.data) || isVocabulary(props.subject.data))
{
    subjectStore.getSubjectsForIds(props.subject.data.componentSubjectIds ?? []).then(subjects =>
    {
        componentSubjects.value = subjects;
    });
}

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
        console.log('EMITING previous subject event')
        emit('previousSubject');
        tabIndex.value = tabHeaders.value.length - 1;
        return;
    }

    tabIndex.value--;
}

function nextTab()
{
    if (tabIndex.value >= tabHeaders.value.length - 1)
    {
        console.log('EMITING next subject event')
        emit('nextSubject');
        tabIndex.value = 0;
        return;
    }

    tabIndex.value++;
}

let keyDownEventListener = (evt: KeyboardEvent) =>
{
    if (evt.defaultPrevented)
    {
        return; // Do nothing if event already handled
    }

    switch (evt.code)
    {
        case "KeyA":
        case "ArrowLeft":
            previousTab();
            break;
        case "KeyD":
        case "ArrowRight":
            nextTab();
            break;
    }
}

watch(
    () => props.displayAsTabs,
    (newValue) =>
    {
        console.log(newValue);
        if (newValue && props.isInLesson)
        {
            window.addEventListener('keydown', keyDownEventListener)
        }
        else if (!newValue && props.isInLesson)
        {
            console.log(newValue);
            window.removeEventListener('keydown', keyDownEventListener);
        }
    },
    { immediate: true, flush: 'post' }
);


if (props.isInLesson)
{
}
</script>