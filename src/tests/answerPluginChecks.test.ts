import { describe, expect, it } from 'vitest';
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
    type AnswerCheckResponse,
    type AnswerPluginCheckContext
} from '@/helpers/answerPluginChecks';

const failure: AnswerCheckResponse = {
    multipleAnswers: false,
    isAccurate: false,
    isPassing: false,
    isBlocked: false,
    matchedAnswer: null
};

function meaning(text: string): WaniKani.Meaning
{
    return { meaning: text, primary: true, acceptedAnswer: true };
}

function baseSubject(characters: string, meanings: WaniKani.Meaning[] = [meaning('example')]): WaniKani.Subject
{
    return {
        auxiliaryMeanings: [],
        characters,
        createdAt: new Date(),
        documentUrl: '',
        lessonPosition: 1,
        level: 1,
        meanings,
        meaningMnemonic: '',
        slug: characters,
        spacedRepetitionSystemId: 1
    };
}

function radical(
    characters: string,
    meanings: WaniKani.Meaning[] = [meaning('example')]
): WaniKani.Radical
{
    return {
        ...baseSubject(characters, meanings),
        amalgamationSubjectIds: [],
        characterImages: []
    };
}

function kanji(
    characters: string,
    readings: WaniKani.KanjiReading[] = [],
    meanings: WaniKani.Meaning[] = [meaning('example')]
): WaniKani.Kanji
{
    return {
        ...baseSubject(characters, meanings),
        amalgamationSubjectIds: [],
        componentSubjectIds: [],
        readingMnemonic: '',
        readings,
        visuallySimilarSubjectIds: []
    };
}

function vocabulary(
    characters: string,
    readings: WaniKani.VocabularyReading[] = [],
    meanings: WaniKani.Meaning[] = [meaning('example')]
): WaniKani.Vocabulary
{
    return {
        ...baseSubject(characters, meanings),
        componentSubjectIds: [],
        contextSentences: [],
        partsOfSpeech: [],
        pronunciationAudios: [],
        readingMnemonic: '',
        readings
    };
}

function subjectResource(object: string, data: WaniKani.Subject): WaniKani.WaniKaniResource<WaniKani.Subject>
{
    return { object, url: '', data };
}

function amalgamationResource(object: string, data: WaniKani.Kanji | WaniKani.Vocabulary): WaniKani.WaniKaniResource<WaniKani.Kanji | WaniKani.Vocabulary>
{
    return { object, url: '', data };
}

function context(overrides: Partial<AnswerPluginCheckContext> = {}): AnswerPluginCheckContext
{
    const data = kanji('水', [{ type: 'kunyomi', primary: true, acceptedAnswer: true, reading: 'みず' }]);
    return {
        questionType: 'meaning',
        currentSubject: { subject: subjectResource('kanji', data), assignment: undefined },
        castedKanjiVocabSubject: data,
        inputHistory: '',
        studyMaterial: null,
        componentSubjects: [],
        amalgamationSubjects: [],
        ...overrides
    };
}

describe('answer plugin checks', () =>
{
    it('detects impossible kana combinations', () =>
    {
        expect(checkImpossibleKana(context({ questionType: 'reading' }), failure, 'んあ')).toEqual({
            type: 'retry',
            message: 'That looks like a typo. Do you want to retry?'
        });
    });

    it('detects a non-primary kanji reading', () =>
    {
        const data = kanji('水', [
            { reading: 'すい', primary: true, acceptedAnswer: true, type: 'onyomi' },
            { reading: 'みず', primary: false, acceptedAnswer: false, type: 'kunyomi' }
        ]);
        const checkContext = context({
            questionType: 'reading',
            currentSubject: { subject: subjectResource('kanji', data), assignment: undefined },
            castedKanjiVocabSubject: data
        });

        expect(checkKanjiReadings(checkContext, failure, 'みず')).toEqual({
            type: 'retry',
            message: "WaniKani is looking for the on'yomi reading."
        });
    });

    it('detects a reading entered for a meaning question', () =>
    {
        const data = vocabulary('水', [{ primary: true, acceptedAnswer: true, reading: 'みず' }]);
        expect(checkTransliterated(context({ questionType: 'meaning', castedKanjiVocabSubject: data }), failure, 'みず')).toEqual({
            type: 'retry',
            message: 'Oops, we want the meaning, not the reading.'
        });
    });

    it('detects a meaning entered for a reading question', () =>
    {
        const data = vocabulary('水', [{ primary: true, acceptedAnswer: true, reading: 'みず' }], [meaning('water')]);
        const contextData = context({
            questionType: 'reading',
            currentSubject: { subject: subjectResource('vocabulary', data), assignment: undefined },
            inputHistory: 'water',
            castedKanjiVocabSubject: data,
        });

        expect(checkTransliterated(contextData, failure, 'water')).toEqual({
            type: 'retry',
            message: 'Oops, we want the reading, not the meaning.'
        });
    });

    it('detects a related kanji meaning entered for a matching component radical', () =>
    {
        const data = kanji('水');
        const componentSubjectsData = radical('水', [meaning('water')]);
        const checkContext = context({
            currentSubject: { subject: subjectResource('kanji', data), assignment: undefined },
            castedKanjiVocabSubject: data,
            componentSubjects: [subjectResource('radical', componentSubjectsData)]
        });

        expect(checkRelatedMeaningsAndReadings(checkContext, failure, 'water')).toEqual({
            type: 'retry',
            message: 'Oops, we want the kanji meaning, not the radical meaning.'
        });
    });

    it('detects a related kanji meaning entered for a matching amalgamation vocabulary', () =>
    {
        const data = kanji('水');
        const amalgamationSubjectsData = vocabulary('水', [{ reading: 'みず', primary: true, acceptedAnswer: true }], [meaning('water')]);
        const checkContext = context({
            currentSubject: { subject: subjectResource('kanji', data), assignment: undefined },
            castedKanjiVocabSubject: data,
            amalgamationSubjects: [amalgamationResource('vocabulary', amalgamationSubjectsData)]
        });

        expect(checkRelatedMeaningsAndReadings(checkContext, failure, 'water')).toEqual({
            type: 'retry',
            message: 'Oops, we want the kanji meaning, not the vocabulary meaning.'
        });
    });

    it('detects a related vocabulary meaning entered for a matching component kanji', () =>
    {
        const data = vocabulary('中');
        const componentSubjectsData = kanji('中', [
            { reading: 'ちゅう', primary: true, acceptedAnswer: true, type: 'onyomi' },
            { reading: 'なか', primary: false, acceptedAnswer: false, type: 'kunyomi' }
        ], [
            meaning('middle'),
            meaning('in'),
            meaning('inside'),
            meaning('center')
        ]);
        const checkContext = context({
            currentSubject: { subject: subjectResource('vocabulary', data), assignment: undefined },
            castedKanjiVocabSubject: data,
            componentSubjects: [subjectResource('kanji', componentSubjectsData)]
        });

        expect(checkRelatedMeaningsAndReadings(checkContext, failure, 'middle')).toEqual({
            type: 'retry',
            message: 'Oops, we want the vocabulary meaning, not the kanji meaning.'
        });
    });

    it('detects a related vocabulary reading entered for a matching component kanji', () =>
    {
        const data = vocabulary('水');
        const componentSubjectsData = kanji('水', [
            { reading: 'すい', primary: true, acceptedAnswer: true, type: 'onyomi' },
            { reading: 'みず', primary: false, acceptedAnswer: false, type: 'kunyomi' }
        ], [meaning('water')]);
        const checkContext = context({
            questionType: 'reading',
            currentSubject: { subject: subjectResource('vocabulary', data), assignment: undefined },
            castedKanjiVocabSubject: data,
            componentSubjects: [subjectResource('kanji', componentSubjectsData)]
        });

        expect(checkRelatedMeaningsAndReadings(checkContext, failure, 'すい')).toEqual({
            type: 'retry',
            message: 'Oops, we want the vocabulary reading, not the kanji reading.'
        });
    });

    it('detects the kanji character entered instead of its reading', () =>
    {
        expect(checkKanji(context(), failure, '水')).toEqual({ type: 'retry' });
    });

    it('detects a reading that omits a long dash', () =>
    {
        const data = vocabulary('拉麵', [{ primary: true, acceptedAnswer: true, reading: 'らーめん' }]);
        expect(checkLongDash(context({ questionType: 'reading', castedKanjiVocabSubject: data }), failure, 'らあめん')).toEqual({
            type: 'retry',
            message: 'Try typing “ra-menn” to get that long ー.'
        });
    });

    it('suggests the to-infinitive for verb meanings', () =>
    {
        const data = vocabulary('食べる', [], [meaning('to eat')]);
        expect(checkVerbStartsWithTo(context({ castedKanjiVocabSubject: data }), failure, 'eat')).toEqual({
            type: 'retry',
            message: `Almost! It ends in る, so it's a verb. Please type "to eat".`
        });
    });

    it('detects a large hiragana used instead of a small one', () =>
    {
        const data = vocabulary('竜', [{ primary: true, acceptedAnswer: true, reading: 'りゅう' }]);
        expect(checkSmallHiragana(context({ questionType: 'reading', castedKanjiVocabSubject: data }), failure, 'りゆう')).toEqual({
            type: 'retry',
            message: 'Watch out for the small ゅ. Try typing “ryuu” for this one.'
        });
    });

    it('detects a missing n in a reading', () =>
    {
        const data = vocabulary('かんあ', [{ primary: true, acceptedAnswer: true, reading: 'かんあ' }]);
        const action = checkN(context({ questionType: 'reading', castedKanjiVocabSubject: data }), failure, 'かな');
        expect(action?.type).toBe('retry');
        expect(action?.message).toContain('Don\'t forget that ん is typed as “nn”.');
    });

    it('rejects a to-infinitive for a kanji meaning', () =>
    {
        const data = kanji('水', [], [meaning('water')]);
        const checkContext = context({
            currentSubject: { subject: subjectResource('kanji', data), assignment: undefined },
            castedKanjiVocabSubject: data
        });

        expect(checkKanjiDoesNotStartWithTo(checkContext, failure, 'to water')).toEqual({
            type: 'retry',
            message: 'This is a kanji, so it doesn\'t start with "to".'
        });
    });
});
