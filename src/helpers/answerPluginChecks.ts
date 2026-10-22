import { stripOkurigana } from 'wanakana';
import { isKanji, isRadical, isVocabulary } from '@/@types/waniKaniTypeGuards';
import { getVisibleMeanings, getVisibleReadings } from '@/helpers/waniKaniHelpers';
import * as responseHelpers from '@/helpers/responseHelpers';

export interface AnswerCheckResponse
{
    multipleAnswers: boolean;
    isAccurate: boolean;
    isPassing: boolean;
    isBlocked: boolean;
    matchedAnswer: string | null;
}

export interface AnswerCheckAction
{
    type: 'pass' | 'fail' | 'retry'
    message?: string
}

export interface AnswerPluginCheckContext
{
    questionType: 'meaning' | 'reading';
    currentSubject: WaniKani.SubjectAssignmentPair | undefined;
    castedKanjiVocabSubject: WaniKani.Kanji | WaniKani.Vocabulary;
    inputHistory: string;
    studyMaterial: WaniKani.WaniKaniResource<WaniKani.StudyMaterial> | null;
    componentSubjects: WaniKani.WaniKaniResource<WaniKani.Subject>[];
    amalgamationSubjects: WaniKani.WaniKaniResource<WaniKani.Kanji | WaniKani.Vocabulary>[];
}

//Checks if the user had impossible combinations of kana 
// such as some combinations with little ゃゅょ’ｓ
export function checkImpossibleKana(context: AnswerPluginCheckContext, result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    if (!result.isPassing && context.questionType === 'reading')
    {
        if (containsImposssibleKana())
        {
            return {
                type: 'retry',
                message: 'That looks like a typo. Do you want to retry?'
            }
        }
    }

    return null;

    function containsImposssibleKana()
    {
        return containsInvalidStartingCharacter() || containsInvalidAdjacentCharacters()
            || containsInvalidSmallTSU() || containsInvalidSmallYaYuYo();
    }

    function containsInvalidSmallYaYuYo() { return normalizedAnswer.search(/[^きしちにひみりぎじぢびぴキシチニヒミリギジヂビピ][ゃ*ゅょャュョ]/) !== -1 }
    function containsInvalidSmallTSU() { return normalizedAnswer.search(/[っッ][あいうえおゃゅょぁぃぅぇぉアイウエオャュョァィゥェォ]/) !== -1 }
    function containsInvalidAdjacentCharacters() { return normalizedAnswer.search(/(んん|ンン)/) !== -1 || /[んゃゅょぁぃぅぇぉンャュョァィゥェォ][ゃゅょぁぃぅぇぉャュョァィゥェォ]/.test(normalizedAnswer) }
    function containsInvalidStartingCharacter() { return /^[んゃゅょぁぃぅぇぉっゎンャュョァィゥェォヵヶッヮ]/.test(normalizedAnswer) }
}

//Checks if the user used a non primary reading. 
// i.e. the "nanori" or "on'yomi" instead of an expected "kunyomi"
export function checkKanjiReadings(context: AnswerPluginCheckContext, result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    const niceEmphasis = { onyomi: "on'yomi", kunyomi: "kun'yomi", nanori: "nanori" }

    if (!result.isPassing && context.questionType === 'reading'
        && context.currentSubject?.subject.object.toLocaleLowerCase() === 'kanji')
    {
        let kanji = context.currentSubject.subject.data as WaniKani.Kanji;
        let primaryReadingType = kanji.readings.find(x => x.primary)?.type;
        if (!primaryReadingType)
            throw ('Exception: The provided kanji does not have a primary reading type.');

        let foundReading = kanji.readings.find(reading => reading.type !== primaryReadingType
            && reading.reading === responseHelpers.normalizeReadingToHiragana(normalizedAnswer));

        if (foundReading)
        {
            return {
                type: 'retry',
                message: `WaniKani is looking for the ${niceEmphasis[primaryReadingType]} reading.`
            }
        }
    }

    return null;
}

//Checks if the user responded with the meaning instead of the reading or vice versa
export function checkTransliterated(context: AnswerPluginCheckContext, result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    if (result.isPassing)
        return null;

    if (context.questionType === 'meaning'
        && getVisibleReadings(context.castedKanjiVocabSubject).some((reading) => responseHelpers.isIMEEquivalent(reading, normalizedAnswer)))
    {
        return {
            type: 'retry',
            message: `Oops, we want the meaning, not the reading.`
        }
    }

    const normalizedInputHistory = context.inputHistory.toLowerCase()
    let meanings = getVisibleMeanings(context.currentSubject?.subject.data!)
        .concat(context.studyMaterial?.data.meaningSynonyms ?? [])
        .map(x => responseHelpers.normalizeResponse(x));

    if (context.questionType === 'reading' && meanings.some((text) => normalizedInputHistory === text.toLowerCase()))
    {
        return {
            type: 'retry',
            message: `Oops, we want the reading, not the meaning.`
        }
    }

    return null;
}

//Checks against the matching radicals/kanji/vocabluary in any for a use answering for those by mistake
export function checkRelatedMeaningsAndReadings(context: AnswerPluginCheckContext, _result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    let subject = context.currentSubject?.subject;
    let matchingComponent = context.componentSubjects.find(x => x.data.characters === subject?.data.characters) ?? null;
    let matchingAmalgamation = context.amalgamationSubjects.find(x => x.data.characters === subject?.data.characters) ?? null;

    let message: string | null = null;
    if (matchingComponent || matchingAmalgamation)
    {
        if (isRadical(subject?.data))
        {
            if (matchingAmalgamation?.data.meanings.some(res => res.meaning.trim() === normalizedAnswer))
                message = `Oops, we want the radical meaning, not the kanji meaning.`;
        }
        else if (isKanji(subject?.data))
        {
            if (context.questionType === 'meaning')
            {
                if (matchingComponent?.data.meanings.some(res => res.meaning.trim() === normalizedAnswer))
                    message = `Oops, we want the kanji meaning, not the radical meaning.`;
                else if (matchingAmalgamation?.data.meanings.some(res => res.meaning.trim() === normalizedAnswer))
                    message = `Oops, we want the kanji meaning, not the vocabulary meaning.`;
            }
        }
        else if (isVocabulary(subject?.data))
        {
            if (context.questionType === 'meaning')
            {
                if (matchingComponent?.data.meanings.some(res => res.meaning.trim() === normalizedAnswer))
                    message = `Oops, we want the vocabulary meaning, not the kanji meaning.`;
            }
            else
            {
                let kanji = matchingComponent?.data as WaniKani.Kanji;
                if (kanji.readings.some(res => res.reading.trim() === normalizedAnswer))
                    message = `Oops, we want the vocabulary reading, not the kanji reading.`;
            }
        }
    }

    if (message != null)
    {
        return {
            type: 'retry',
            message
        }
    }

    return null;
}

//Checks the user did not enter the kanji character instead of the kana for the kanji
export function checkKanji(context: AnswerPluginCheckContext, _result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    if (normalizedAnswer === context.currentSubject?.subject.data.characters)
    {
        return {
            type: 'retry'
        }
    }

    return null;
}

//Checks if the user's response indicates the user may need instructions on typing a long dash
export function checkLongDash(context: AnswerPluginCheckContext, _result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    if (context.questionType !== 'reading')
        return null;

    let reading = getVisibleReadings(context.castedKanjiVocabSubject)
        .find((reading) => responseHelpers.containsLongDash(reading) && responseHelpers.reponseMatchesConvertedReading(reading, normalizedAnswer))

    if (reading)
    {
        return {
            type: 'retry',
            message: `Try typing “${responseHelpers.toIME(reading)}” to get that long ー.`
        }
    }

    return null;
}

export function checkVerbStartsWithTo(context: AnswerPluginCheckContext, result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    let visibleMeanings = getVisibleMeanings(context.castedKanjiVocabSubject).map(meaning => meaning.toLowerCase());

    if (!result.isPassing
        && context.questionType === 'meaning'
        && visibleMeanings.some(meaning => meaning.startsWith('to '))
        && !normalizedAnswer.startsWith("to "))
    {
        let matchedMeaning = visibleMeanings.find(meaning => meaning.startsWith('to ') && meaning.replace('to ', '') === normalizedAnswer);
        let subjectCharacters = context.castedKanjiVocabSubject.characters;
        if (matchedMeaning && subjectCharacters)
        {
            const okurigana = subjectCharacters.replace(stripOkurigana(subjectCharacters), "") || subjectCharacters;
            return {
                type: 'retry',
                message: `Almost! It ends in ${okurigana[okurigana.length - 1]}, so it's a verb. Please type "${matchedMeaning}".`
            }
        }
    }

    return null;
}

//Checks if the user mistyped a large hiragana where a little should be "りゆ" vs "りゅ"
export function checkSmallHiragana(context: AnswerPluginCheckContext, _result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    if (context.questionType !== 'reading')
        return null;

    let needsSmallCharacters = getVisibleReadings(context.castedKanjiVocabSubject)
        .map(x => responseHelpers.compareBigAndSmall(normalizedAnswer, x))
        .filter((match) => match)[0];

    if (needsSmallCharacters && needsSmallCharacters.length > 0)
    {
        const smallCharacters = needsSmallCharacters.map(({ expectedChar }) => expectedChar);
        return {
            type: 'retry',
            message: `Watch out for the small ${responseHelpers.joinWordsNicely(smallCharacters)}. Try typing “${responseHelpers.toIME(needsSmallCharacters[0]!.expectedAnswer)}” for this one.`
        }
    }

    return null;
}

//Checks for typos involving lingering "n"s not  getting converted to "ん"
export function checkN(context: AnswerPluginCheckContext, _result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    let visibleReadings = getVisibleReadings(context.castedKanjiVocabSubject);

    let readingsContainingN = visibleReadings.filter((text) => text.indexOf("ん") !== -1);
    const responseMora = [responseHelpers.toRomajiMora(normalizedAnswer)]
    const hasExactMatch = responseHelpers.findMatchingIndexInArrayOfArrays(readingsContainingN.map(responseHelpers.toRomajiMora), responseMora) !== -1

    if (context.questionType === 'reading' && visibleReadings.length > 0 && !hasExactMatch)
    {
        if (readingsContainingN.length > 0)
        {
            const indexOfReadingWithTooFewNs = responseHelpers.findIndexOfReadingWithTooFewNs(normalizedAnswer, readingsContainingN)
            if (indexOfReadingWithTooFewNs !== -1)
            {
                return {
                    type: 'retry',
                    message: `Don't forget that ん is typed as “nn”. Try typing “${responseHelpers.toIME(readingsContainingN[indexOfReadingWithTooFewNs]!)}”.`
                }
            }

            const indexOfReadingWithTooManyNs = responseHelpers.findIndexOfReadingWithTooManyNs(normalizedAnswer, readingsContainingN)
            if (indexOfReadingWithTooManyNs !== -1)
            {
                return {
                    type: 'retry',
                    message: 'That looks like a typo. Watch out for those "n"s.'
                }
            }
        }
    }
    return null
}

export function checkKanjiDoesNotStartWithTo(context: AnswerPluginCheckContext, result: AnswerCheckResponse, normalizedAnswer: string): AnswerCheckAction | null
{
    if (!result.isPassing
        && context.questionType === 'meaning'
        && context.currentSubject?.subject.object.toLocaleLowerCase() === 'kanji'
        && normalizedAnswer.startsWith('to ')
        && hasMatchedMeaning())
    {
        return {
            type: 'retry',
            message: `This is a kanji, so it doesn't start with "to".`
        }
    }

    return null;

    function hasMatchedMeaning()
    {
        const modifiedResponse = normalizedAnswer.substring(3);
        return getVisibleMeanings(context.currentSubject?.subject.data!)
            .some((meaning) => modifiedResponse === meaning.toLowerCase())
    }
}
