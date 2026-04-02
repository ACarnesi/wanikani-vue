// type guard helpers for WaniKani API models
// Type guard structure generated using GitHub agent and based off of pattern found at https://dev.to/noriste/keeping-typescript-type-guards-safe-and-up-to-date-a-simpler-solution-ja3

export const isPlainObject = (obj: unknown): obj is Record<PropertyKey, unknown> =>
{
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
};

function isDate(value: unknown): value is Date
{
    let date;

    if (isString(value))
    {
        date = new Date(value);
    }

    return date instanceof Date && !Number.isNaN(date.getTime());
}

function isString(value: unknown): value is string
{
    return typeof value === 'string';
}

function isNumber(value: unknown): value is number
{
    return typeof value === 'number' && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean
{
    return typeof value === 'boolean';
}

function isArray<T>(value: unknown, elementGuard: (el: unknown) => el is T): value is T[]
{
    return Array.isArray(value) && value.every(elementGuard);
}

// Core primitive checks
export function isSubjectType(value: unknown): value is WaniKani.SubjectType
{
    return value === 'kana_vocabulary' || value === 'kanji' || value === 'radical' || value === 'vocabulary';
}

export function isAuxiliaryMeaningType(value: unknown): value is WaniKani.AuxiliaryMeaningType
{
    return value === 'whitelist' || value === 'blacklist';
}

export function isReadingType(value: unknown): value is WaniKani.ReadingType
{
    return value === 'kunyomi' || value === 'nanori' || value === 'onyomi';
}

// Model guards
export function isAssignment(value: unknown): value is WaniKani.Assignment
{
    if (!isPlainObject(value)) return false;

    const { subjectId, subjectType, srsStage, hidden, createdAt, availableAt, burnedAt, passedAt, resurrectedAt, unlockedAt, startedAt } = value;

    if (!isNumber(subjectId)) return false;
    if (!isSubjectType(subjectType)) return false;
    if (!isNumber(srsStage)) return false;
    if (!isBoolean(hidden)) return false;
    if (!isDate(createdAt)) return false;
    if (!(availableAt === undefined || availableAt === null || isDate(availableAt))) return false;
    if (!(burnedAt === undefined || burnedAt === null || isDate(burnedAt))) return false;
    if (!(passedAt === undefined || passedAt === null || isDate(passedAt))) return false;
    if (!(resurrectedAt === undefined || resurrectedAt === null || isDate(resurrectedAt))) return false;
    if (!(unlockedAt === undefined || unlockedAt === null || isDate(unlockedAt))) return false;
    if (!(startedAt === undefined || startedAt === null || isDate(startedAt))) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Assignment = { subjectId, subjectType, srsStage, hidden, createdAt, availableAt, burnedAt, passedAt, resurrectedAt, unlockedAt, startedAt };

    return true;
}

export function isLevelProgression(value: unknown): value is WaniKani.LevelProgression
{
    if (!isPlainObject(value)) return false;
    const { level, createdAt, abandonedAt, completedAt, passedAt, startedAt, unlockedAt } = value;

    if (!isNumber(level)) return false;
    if (!isDate(createdAt)) return false;
    if (!(abandonedAt === undefined || abandonedAt === null || isDate(abandonedAt))) return false;
    if (!(completedAt === undefined || completedAt === null || isDate(completedAt))) return false;
    if (!(passedAt === undefined || passedAt === null || isDate(passedAt))) return false;
    if (!(startedAt === undefined || startedAt === null || isDate(startedAt))) return false;
    if (!(unlockedAt === undefined || unlockedAt === null || isDate(unlockedAt))) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.LevelProgression = { level, createdAt, abandonedAt, completedAt, passedAt, startedAt, unlockedAt };

    return true;
}

export function isReset(value: unknown): value is WaniKani.Reset
{
    if (!isPlainObject(value)) return false;
    const { originalLevel, targetLevel, createdAt, confirmedAt } = value;

    if (!isNumber(originalLevel)) return false;
    if (!isNumber(targetLevel)) return false;
    if (!isDate(createdAt)) return false;
    if (!(confirmedAt === undefined || confirmedAt === null || isDate(confirmedAt))) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Reset = { originalLevel, targetLevel, createdAt, confirmedAt };

    return true;
}

export function isReview(value: unknown): value is WaniKani.Review
{
    if (!isPlainObject(value)) return false;
    const { assignmentId, spacedRepetitionSystemId, subjectId, startingSrsStage, endingSrsStage, incorrectMeaningAnswers, incorrectReadingAnswers, createdAt } = value;

    if (!isNumber(assignmentId)) return false;
    if (!isNumber(spacedRepetitionSystemId)) return false;
    if (!isNumber(subjectId)) return false;
    if (!isNumber(startingSrsStage)) return false;
    if (!isNumber(endingSrsStage)) return false;
    if (!isNumber(incorrectMeaningAnswers)) return false;
    if (!isNumber(incorrectReadingAnswers)) return false;
    if (!isDate(createdAt)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Review = { assignmentId, spacedRepetitionSystemId, subjectId, startingSrsStage, endingSrsStage, incorrectMeaningAnswers, incorrectReadingAnswers, createdAt };

    return true;
}

export function isReviewStatistics(value: unknown): value is WaniKani.ReviewStatistics
{
    if (!isPlainObject(value)) return false;
    const {
        subjectId,
        subjectType,
        hidden,
        meaningCorrect,
        meaningIncorrect,
        meaningMaxStreak,
        meaningCurrentStreak,
        readingCorrect,
        readingIncorrect,
        readingMaxStreak,
        readingCurrentStreak,
        percentageCorrect,
        createdAt,
    } = value;

    if (!isNumber(subjectId)) return false;
    if (!isSubjectType(subjectType)) return false;
    if (!isBoolean(hidden)) return false;
    if (!isNumber(meaningCorrect)) return false;
    if (!isNumber(meaningIncorrect)) return false;
    if (!isNumber(meaningMaxStreak)) return false;
    if (!isNumber(meaningCurrentStreak)) return false;
    if (!isNumber(readingCorrect)) return false;
    if (!isNumber(readingIncorrect)) return false;
    if (!isNumber(readingMaxStreak)) return false;
    if (!isNumber(readingCurrentStreak)) return false;
    if (!isNumber(percentageCorrect)) return false;
    if (!isDate(createdAt)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.ReviewStatistics = {
        subjectId,
        subjectType,
        hidden,
        meaningCorrect,
        meaningIncorrect,
        meaningMaxStreak,
        meaningCurrentStreak,
        readingCorrect,
        readingIncorrect,
        readingMaxStreak,
        readingCurrentStreak,
        percentageCorrect,
        createdAt,
    };

    return true;
}

export function isStage(value: unknown): value is WaniKani.Stage
{
    if (!isPlainObject(value)) return false;
    const { position, interval, intervalUnit } = value;

    if (!isNumber(position)) return false;
    if (!(interval === undefined || interval === null || isNumber(interval))) return false;
    if (!(intervalUnit === undefined || intervalUnit === null || isString(intervalUnit))) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Stage = { position, interval, intervalUnit };

    return true;
}

export function isSpacedRepetitionSystem(value: unknown): value is WaniKani.SpacedRepetitionSystem
{
    if (!isPlainObject(value)) return false;
    const { name, description, unlockingStagePosition, startingStagePosition, passingStagePosition, burningStagePosition, createdAt, stages } = value;

    if (!isString(name)) return false;
    if (!isString(description)) return false;
    if (!isNumber(unlockingStagePosition)) return false;
    if (!isNumber(startingStagePosition)) return false;
    if (!isNumber(passingStagePosition)) return false;
    if (!isNumber(burningStagePosition)) return false;
    if (!isDate(createdAt)) return false;
    if (!isArray(stages, isStage)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.SpacedRepetitionSystem = { name, description, unlockingStagePosition, startingStagePosition, passingStagePosition, burningStagePosition, createdAt, stages };

    return true;
}

export function isMeaning(value: unknown): value is WaniKani.Meaning
{
    if (!isPlainObject(value)) return false;
    const { meaning, primary, acceptedAnswer } = value;

    if (!isString(meaning)) return false;
    if (!isBoolean(primary)) return false;
    if (!isBoolean(acceptedAnswer)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Meaning = { meaning, primary, acceptedAnswer };

    return true;
}

export function isAuxiliaryMeaning(value: unknown): value is WaniKani.AuxiliaryMeaning
{
    if (!isPlainObject(value)) return false;
    const { meaning, type } = value;

    if (!isString(meaning)) return false;
    if (!isAuxiliaryMeaningType(type)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.AuxiliaryMeaning = { meaning, type };

    return true;
}

export function isCharacterImage(value: unknown): value is WaniKani.CharacterImage
{
    if (!isPlainObject(value)) return false;
    const { url, metadata, contentType } = value;

    if (!isString(url)) return false;
    if (!isPlainObject(metadata)) return false;
    if (!isString(contentType)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.CharacterImage = { url, metadata, contentType };

    return true;
}

export function isKanjiReading(value: unknown): value is WaniKani.KanjiReading
{
    if (!isPlainObject(value)) return false;
    const { type, primary, acceptedAnswer, reading } = value;

    if (!isReadingType(type)) return false;
    if (!isBoolean(primary)) return false;
    if (!isBoolean(acceptedAnswer)) return false;
    if (!isString(reading)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.KanjiReading = { type, primary, acceptedAnswer, reading };

    return true;
}

export function isVocabularyReading(value: unknown): value is WaniKani.VocabularyReading
{
    if (!isPlainObject(value)) return false;
    const { primary, acceptedAnswer, reading } = value;

    if (!isBoolean(primary)) return false;
    if (!isBoolean(acceptedAnswer)) return false;
    if (!isString(reading)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.VocabularyReading = { primary, acceptedAnswer, reading };

    return true;
}

export function isContextSentence(value: unknown): value is WaniKani.ContextSentence
{
    if (!isPlainObject(value)) return false;
    const { en, ja } = value;

    if (!isString(en)) return false;
    if (!isString(ja)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.ContextSentence = { en, ja };

    return true;
}

export function isPronunciationAudio(value: unknown): value is WaniKani.PronunciationAudio
{
    if (!isPlainObject(value)) return false;
    const { url, contentType, metadata } = value;

    if (!isString(url)) return false;
    if (!isString(contentType)) return false;
    if (!isPronunciationAudioMetadata(metadata)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.PronunciationAudio = { url, contentType, metadata };

    return true;
}

export function isPronunciationAudioMetadata(value: unknown): value is WaniKani.PronunciationAudioMetadata
{
    if (!isPlainObject(value)) return false;
    const { gender, sourceId, pronunciation, voiceActorId, voiceActorName, voiceDescription } = value;

    if (!isString(gender)) return false;
    if (!isNumber(sourceId)) return false;
    if (!isString(pronunciation)) return false;
    if (!isNumber(voiceActorId)) return false;
    if (!isString(voiceActorName)) return false;
    if (!isString(voiceDescription)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.PronunciationAudioMetadata = { gender, sourceId, pronunciation, voiceActorId, voiceActorName, voiceDescription };

    return true;
}

export function isSubject(value: unknown): value is WaniKani.Subject
{
    if (!isPlainObject(value)) return false;
    const {
        auxiliaryMeanings,
        characters,
        createdAt,
        documentUrl,
        hiddenAt,
        lessonPosition,
        level,
        meanings,
        meaningMnemonic,
        slug,
        spacedRepetitionSystemId,
    } = value;

    if (!isArray(auxiliaryMeanings, isAuxiliaryMeaning)) return false;
    if (!(characters === undefined || characters === null || isString(characters))) return false;
    if (!isDate(createdAt)) return false;
    if (!isString(documentUrl)) return false;
    if (!(hiddenAt === undefined || hiddenAt === null || isDate(hiddenAt))) return false;
    if (!isNumber(lessonPosition)) return false;
    if (!isNumber(level)) return false;
    if (!isArray(meanings, isMeaning)) return false;
    if (!isString(meaningMnemonic)) return false;
    if (!isString(slug)) return false;
    if (!isNumber(spacedRepetitionSystemId)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Subject = {
        auxiliaryMeanings,
        characters,
        createdAt,
        documentUrl,
        hiddenAt,
        lessonPosition,
        level,
        meanings,
        meaningMnemonic,
        slug,
        spacedRepetitionSystemId,
    };

    return true;
}

export function isSubscription(value: unknown): value is WaniKani.Subscription
{
    if (!isPlainObject(value)) return false;
    const { active, type, maxLevelGranted, periodEndsAt } = value;

    if (!(active === undefined || active === null || isBoolean(active))) return false;
    if (!isString(type)) return false;
    if (!isNumber(maxLevelGranted)) return false;
    if (!(periodEndsAt === undefined || periodEndsAt === null || isDate(periodEndsAt))) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Subscription = { active, type, maxLevelGranted, periodEndsAt };

    return true;
}

export function isPreferences(value: unknown): value is WaniKani.Preferences
{
    if (!isPlainObject(value)) return false;
    const { defaultVoiceActorId, extraStudyAutoplayAudio, lessonsAutoplayAudio, lessonsBatchSize, reviewsAutoplayAudio, reviewsDisplaySrsIndicator, reviewsPresentationOrder } = value;

    if (!isNumber(defaultVoiceActorId)) return false;
    if (!isBoolean(extraStudyAutoplayAudio)) return false;
    if (!isBoolean(lessonsAutoplayAudio)) return false;
    if (!isNumber(lessonsBatchSize)) return false;
    if (!isBoolean(reviewsAutoplayAudio)) return false;
    if (!isBoolean(reviewsDisplaySrsIndicator)) return false;
    if (!isString(reviewsPresentationOrder)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Preferences = { defaultVoiceActorId, extraStudyAutoplayAudio, lessonsAutoplayAudio, lessonsBatchSize, reviewsAutoplayAudio, reviewsDisplaySrsIndicator, reviewsPresentationOrder };

    return true;
}

export function isVoiceActor(value: unknown): value is WaniKani.VoiceActor
{
    if (!isPlainObject(value)) return false;
    const { description, gender, name } = value;

    if (!isString(description)) return false;
    if (!isString(gender)) return false;
    if (!isString(name)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.VoiceActor = { description, gender, name };

    return true;
}

export function isUser(value: unknown): value is WaniKani.User
{
    if (!isPlainObject(value)) return false;
    const { id, level, subscription, profileUrl, startedAt, preferences, username, currentVacationStartedAt } = value;

    if (!isString(id)) return false;
    if (!isNumber(level)) return false;
    if (!isSubscription(subscription)) return false;
    if (!isString(profileUrl)) return false;
    if (!isDate(startedAt)) return false;
    if (!isPreferences(preferences)) return false;
    if (!isString(username)) return false;
    if (!(currentVacationStartedAt === undefined || currentVacationStartedAt === null || isDate(currentVacationStartedAt))) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.User = { id, level, subscription, profileUrl, startedAt, preferences, username, currentVacationStartedAt };

    return true;
}

export function isRadical(value: unknown): value is WaniKani.Radical
{
    if (!isPlainObject(value)) return false;
    const { auxiliaryMeanings, characters, createdAt, documentUrl, hiddenAt, lessonPosition, level, meanings, meaningMnemonic, slug, spacedRepetitionSystemId, amalgamationSubjectIds, characterImages } = value;

    if (!isArray(auxiliaryMeanings, isAuxiliaryMeaning)) return false;
    if (!(characters === undefined || characters === null || isString(characters))) return false;
    if (!isDate(createdAt)) return false;
    if (!isString(documentUrl)) return false;
    if (!(hiddenAt === undefined || hiddenAt === null || isDate(hiddenAt))) return false;
    if (!isNumber(lessonPosition)) return false;
    if (!isNumber(level)) return false;
    if (!isArray(meanings, isMeaning)) return false;
    if (!isString(meaningMnemonic)) return false;
    if (!isString(slug)) return false;
    if (!isNumber(spacedRepetitionSystemId)) return false;
    if (!isArray(amalgamationSubjectIds, isNumber)) return false;
    if (!isArray(characterImages, isCharacterImage)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Radical = { auxiliaryMeanings, characters, createdAt, documentUrl, hiddenAt, lessonPosition, level, meanings, meaningMnemonic, slug, spacedRepetitionSystemId, amalgamationSubjectIds, characterImages };

    return true;
}

export function isKanji(value: unknown): value is WaniKani.Kanji
{
    if (!isPlainObject(value)) return false;
    const { auxiliaryMeanings, characters, createdAt, documentUrl, hiddenAt, lessonPosition, level, meanings, meaningMnemonic, slug, spacedRepetitionSystemId, amalgamationSubjectIds, componentSubjectIds, meaningHint, readingHint, readingMnemonic, readings, visuallySimilarSubjectIds } = value;

    if (!isArray(auxiliaryMeanings, isAuxiliaryMeaning)) return false;
    if (!(characters === undefined || characters === null || isString(characters))) return false;
    if (!isDate(createdAt)) return false;
    if (!isString(documentUrl)) return false;
    if (!(hiddenAt === undefined || hiddenAt === null || isDate(hiddenAt))) return false;
    if (!isNumber(lessonPosition)) return false;
    if (!isNumber(level)) return false;
    if (!isArray(meanings, isMeaning)) return false;
    if (!isString(meaningMnemonic)) return false;
    if (!isString(slug)) return false;
    if (!isNumber(spacedRepetitionSystemId)) return false;
    if (!isArray(amalgamationSubjectIds, isNumber)) return false;
    if (!isArray(componentSubjectIds, isNumber)) return false;
    if (!(meaningHint === undefined || meaningHint === null || isString(meaningHint))) return false;
    if (!(readingHint === undefined || readingHint === null || isString(readingHint))) return false;
    if (!isString(readingMnemonic)) return false;
    if (!isArray(readings, isKanjiReading)) return false;
    if (!isArray(visuallySimilarSubjectIds, isNumber)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Kanji = { auxiliaryMeanings, characters, createdAt, documentUrl, hiddenAt, lessonPosition, level, meanings, meaningMnemonic, slug, spacedRepetitionSystemId, amalgamationSubjectIds, componentSubjectIds, meaningHint, readingHint, readingMnemonic, readings, visuallySimilarSubjectIds };

    return true;
}

export function isVocabulary(value: unknown): value is WaniKani.Vocabulary
{
    if (!isPlainObject(value)) return false;
    const { auxiliaryMeanings, characters, createdAt, documentUrl, hiddenAt, lessonPosition, level, meanings, meaningMnemonic, slug, spacedRepetitionSystemId, componentSubjectIds, contextSentences, partsOfSpeech, pronunciationAudios, readings, readingMnemonic } = value;

    if (!isArray(auxiliaryMeanings, isAuxiliaryMeaning)) return false;
    if (!(characters === undefined || characters === null || isString(characters))) return false;
    if (!isDate(createdAt)) return false;
    if (!isString(documentUrl)) return false;
    if (!(hiddenAt === undefined || hiddenAt === null || isDate(hiddenAt))) return false;
    if (!isNumber(lessonPosition)) return false;
    if (!isNumber(level)) return false;
    if (!isArray(meanings, isMeaning)) return false;
    if (!isString(meaningMnemonic)) return false;
    if (!isString(slug)) return false;
    if (!isNumber(spacedRepetitionSystemId)) return false;
    if (!isArray(componentSubjectIds, isNumber)) return false;
    if (!isArray(contextSentences, isContextSentence)) return false;
    if (!isArray(partsOfSpeech, isString)) return false;
    if (!isArray(pronunciationAudios, isPronunciationAudio)) return false;
    if (!isArray(readings, isVocabularyReading)) return false;
    if (!isString(readingMnemonic)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Vocabulary = { auxiliaryMeanings, characters, createdAt, documentUrl, hiddenAt, lessonPosition, level, meanings, meaningMnemonic, slug, spacedRepetitionSystemId, componentSubjectIds, contextSentences, partsOfSpeech, pronunciationAudios, readings, readingMnemonic };

    return true;
}

export function isKanaVocabulary(value: unknown): value is WaniKani.KanaVocabulary
{
    if (!isPlainObject(value)) return false;
    const { auxiliaryMeanings, characters, createdAt, documentUrl, hiddenAt, lessonPosition, level, meanings, meaningMnemonic, slug, spacedRepetitionSystemId, contextSentences, partsOfSpeech, pronunciationAudios } = value;

    if (!isArray(auxiliaryMeanings, isAuxiliaryMeaning)) return false;
    if (!(characters === undefined || characters === null || isString(characters))) return false;
    if (!isDate(createdAt)) return false;
    if (!isString(documentUrl)) return false;
    if (!(hiddenAt === undefined || hiddenAt === null || isDate(hiddenAt))) return false;
    if (!isNumber(lessonPosition)) return false;
    if (!isNumber(level)) return false;
    if (!isArray(meanings, isMeaning)) return false;
    if (!isString(meaningMnemonic)) return false;
    if (!isString(slug)) return false;
    if (!isNumber(spacedRepetitionSystemId)) return false;
    if (!isArray(contextSentences, isContextSentence)) return false;
    if (!isArray(partsOfSpeech, isString)) return false;
    if (!isArray(pronunciationAudios, isPronunciationAudio)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.KanaVocabulary = { auxiliaryMeanings, characters, createdAt, documentUrl, hiddenAt, lessonPosition, level, meanings, meaningMnemonic, slug, spacedRepetitionSystemId, contextSentences, partsOfSpeech, pronunciationAudios };

    return true;
}

export function isSummary(value: unknown): value is WaniKani.Summary
{
    if (!isPlainObject(value)) return false;
    const { lessons, reviews, nextReviewAt } = value;

    if (!isArray(lessons, isLessonReview)) return false;
    if (!isArray(reviews, isLessonReview)) return false;
    if (!isDate(nextReviewAt)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.Summary = { lessons, reviews, nextReviewAt };

    return true;
}

export function isLessonReview(value: unknown): value is WaniKani.LessonReview
{
    if (!isPlainObject(value)) return false;
    const { availableAt, subjectIds } = value;

    if (!isDate(availableAt)) return false;
    if (!isArray(subjectIds, isNumber)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.LessonReview = { availableAt, subjectIds };

    return true;
}



export function isWaniKaniResourceWithData<T>(value: unknown, dataGuard: (payload: unknown) => payload is T): value is WaniKani.WaniKaniResource<T>
{
    if (!isPlainObject(value)) return false;
    const { object, url, dateUpdatedAt, id, data } = value;

    if (!isString(object)) return false;
    if (!isString(url)) return false;
    if (!(dateUpdatedAt === undefined || dateUpdatedAt === null || isDate(dateUpdatedAt))) return false;
    if (!(id === undefined || id === null || isNumber(id))) return false;
    if (!isPlainObject(data) || !dataGuard(data)) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.WaniKaniResource<T> = { object, url, dateUpdatedAt, id, data };

    return true;
}

export function isWaniKaniCollectionWithData<T>(value: unknown, dataGuard: (payload: unknown) => payload is T): value is WaniKani.WaniKaniCollection<T>
{
    if (!isPlainObject(value)) return false;
    const { object, url, dateUpdatedAt, totalCount, data, pages } = value;

    if (!isString(object)) return false;
    if (!isString(url)) return false;
    if (!(dateUpdatedAt === undefined || dateUpdatedAt === null || isDate(dateUpdatedAt))) return false;
    if (!isNumber(totalCount)) return false;
    if (!isArray(data, (item) => isWaniKaniResourceWithData(item, dataGuard))) return false;
    if (!isPlainObject(pages)) return false;

    const { perPage, nextUrl, previousUrl } = pages;

    if (!isNumber(perPage)) return false;
    if (!(nextUrl === undefined || nextUrl === null || isString(nextUrl))) return false;
    if (!(previousUrl === undefined || previousUrl === null || isString(previousUrl))) return false;

    // @ts-expect-error: turn off "obj is declared but never used."
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const obj: WaniKani.WaniKaniCollection<T> = { object, url, totalCount, data, pages };

    return true;
}
