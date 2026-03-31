
namespace WaniKani
{

    /**
     * Assignments contain information about a user's progress on a particular subject.
     *
     * This information includes their current state and timestamps for various progress milestones.
     * Assignments are created when a user has passed all the components of the given subject and
     * the assignment is at or below their current level for the first time.
     */
    export interface Assignment
    {
        /**
         * Timestamp when the related subject will be available in the user's review queue.
         */
        availableAt?: Date;

        /**
         * Timestamp when the user reaches SRS stage 9 the first time.
         */
        burnedAt?: Date;

        /**
         * Timestamp when the assignment was created.
         */
        createdAt: Date;

        /**
         * Timestamp when the user reaches SRS stage 5 for the first time.
         */
        passedAt?: Date;

        /**
         * Timestamp when the subject is resurrected and placed back in the user's review queue.
         */
        resurrectedAt?: Date;

        /**
         * The timestamp when the related subject has its prerequisites satisfied and is made available in lessons.
         *
         * Prerequisites are:
         * - The subject components have reached SRS stage 5 once (they have been "passed").
         * - The user's level is equal to or greater than the level of the assignment's subject.
         */
        unlockedAt?: Date;

        /**
         * Timestamp when the user completes the lesson for the related subject.
         */
        startedAt?: Date;

        /**
         * Unique identifier of the associated subject.
         */
        subjectId: number;

        /**
         * The type of the associated subject, one of: kana_vocabulary, kanji, radical, or vocabulary.
         */
        subjectType: SubjectType;

        /**
         * The current SRS stage interval. The interval range is determined by the related subject's spaced repetition system.
         */
        srsStage: number;

        /**
         * Indicates if the associated subject has been hidden, preventing it from appearing in lessons or reviews.
         */
        hidden: boolean;
    }

    export interface GetAllAssignmentsRequest
    {
        availableAfter?: Date;
        availableBefore?: Date;
        updatedAfter?: Date;
        burned?: boolean;
        hidden?: boolean;
        unlocked?: boolean;
        started?: boolean;
        inReview?: boolean;
        immediatelyAvailableForLessons?: boolean;
        immediatelyAvailableForReview?: boolean;
        ids?: number[];
        levels?: number[];
        srsStages?: number[];
        subjectIds?: number[];
        subjectTypes?: string[];
    }

    /**
     * Level progressions contain information about a user's progress through the WaniKani levels.
     *
     * A level progression is created when a user has met the prerequisites for leveling up, which are:
     * - Reach a 90% passing rate on assignments for a user's current level with
     * a `subject_type` of `kanji`. Passed assignments have `data.passed` equal to `true`
     * and a `data.passed_at` that's in the past.
     * - Have access to the level. Under `/user`, the `data.level` must be less than or equal
     * to `data.subscription.max_level_granted`.
     */
    export interface LevelProgression
    {
        /**
         * Timestamp when the user abandons the level. This is primary used when the user initiates
         * a reset.
         */
        abandonedAt?: Date;

        /**
         * Timestamp when the user burns 100% of the assignments belonging to the associated
         * subject's level.
         */
        completedAt?: Date;

        /**
         * Timestamp when the level progression is created
         */
        createdAt: Date;

        /**
         * The level of the progression, with possible values from `1` to `60`.
         */
        level: number;

        /**
         * Timestamp when the user passes at least 90% of the assignments with a type of `kanji`
         * belonging to the associated subject's level.
         */
        passedAt?: Date;

        /**
         * Timestamp when the user starts their first lesson of a subject belonging to the level.
         */
        startedAt?: Date;

        /**
         * Timestamp when the user can access lessons and reviews for the `level`.
         */
        unlockedAt?: Date;
    }

    export interface GetAllLevelProgressionsRequest
    {
        ids?: number[];
        updatedAfter?: Date;
    }

    /**
     * Contains information from a user resetting their progress back to any level below their current.
     *
     * Users can reset their progress back to any level at or below their current level.
     * When they reset to a particular level, all of the `assignments` and `review_statistics` at
     * that level or higher are set back to their default state.
     *
     * Resets contain information about when those resets happen, the starting level, and the target level.
     */
    export interface Reset
    {
        /**
         * Timestamp when the reset was created.
         */
        createdAt: Date;

        /**
         * The user's level before the reset, from `1` to `60`
         */
        originalLevel: number;

        /**
         * The user's level after the reset, from `1` to `60`. It must be
         * less than or equal to `original_level`.
         */
        targetLevel: number;

        /**
         * Timestamp when the user confirmed the reset.
         */
        confirmedAt?: Date;
    }

    export interface GetAllResetsRequest
    {
        ids?: number[];
        updatedAfter?: Date;
    }

    /**
     * Reviews log all the correct and incorrect answers provided through the 'Reviews' section of WaniKani.
     *
     * Review records are created when a user answers all the parts of a subject correctly once;
     * some subjects have both meaning or reading parts, and some only have one or the other.
     * Note that reviews are not created for the quizzes in lessons.
     */
    export interface Review
    {
        /**
         * Timestamp when the review was created.
         */
        createdAt: Date;

        /**
         * Unique identifier of the associated assignment.
         */
        assignmentId: number;

        /**
         * Unique identifier of the associated spaced_repetition_system.
         */
        spacedRepetitionSystemId: number;

        /**
         * Unique identifier of the associated subject.
         */
        subjectId: number;

        /**
         * The starting SRS stage interval, with valid values ranging from `1` to `8`
         */
        startingSrsStage: number;

        /**
         * The SRS stage interval calculated from the number of correct and
         * incorrect answers, with valid values ranging from `1` to `9`
         */
        endingSrsStage: number;

        /**
         * The number of times the user has answered the meaning incorrectly.
         */
        incorrectMeaningAnswers: number;

        /**
         * The number of times the user has answered the reading incorrectly.
         */
        incorrectReadingAnswers: number;
    }

    /**
     * Review statistics summarize the activity recorded in reviews.
     *
     * They contain sum the number of correct and incorrect answers for both meaning and reading.
     * They track current and maximum streaks of correct answers. They store the overall percentage
     * of correct answers versus total answers.
     *
     * A review statistic is created when the user has done their first review on the related subject.
     */
    export interface ReviewStatistics
    {
        /**
         * Timestamp when the review statistic was created.
         */
        createdAt: Date;

        /**
         * Unique identifier of the associated subject.
         */
        subjectId: number;

        /**
         * The type of the associated subject.
         */
        subjectType: SubjectType;

        /**
         * Total number of correct answers submitted for the meaning of the associated subject.
         */
        meaningCorrect: number;

        /**
         * Total number of incorrect answers submitted for the meaning of the associated subject.
         */
        meaningIncorrect: number;

        /**
         * The longest, uninterrupted series of correct answers ever given for the meaning of the associated subject.
         */
        meaningMaxStreak: number;

        /**
         * The current, uninterrupted series of correct answers given for the meaning of the associated subject.
         */
        meaningCurrentStreak: number;

        /**
         * Total number of correct answers submitted for the reading of the associated subject.
         */
        readingCorrect: number;

        /**
         * Total number of incorrect answers submitted for the reading of the associated subject.
         */
        readingIncorrect: number;

        /**
         * The longest, uninterrupted series of correct answers ever given for the reading of the associated subject.
         */
        readingMaxStreak: number;

        /**
         * The current, uninterrupted series of correct answers given for the reading of the associated subject.
         */
        readingCurrentStreak: number;

        /**
         * The overall correct answer rate by the user for the subject, including both meaning and reading.
         */
        percentageCorrect: number;

        /**
         * Indicates if the associated subject has been hidden, preventing it from appearing in lessons or reviews.
         */
        hidden: boolean;
    }

    export interface GetAllReviewsRequest
    {
        assignmentIds?: number[];
        ids?: number[];
        subjectIds?: number[];
        updatedAfter?: Date;
    }

    export interface CreateReviewRequest
    {
        assignmentId: number;
        subjectId: number;
        incorrectMeaningAnswers: number;
        incorrectReadingAnswers: number;
        updatedAfter?: Date;
    }

    export interface GetAllReviewStatisticsRequest
    {
        hidden?: boolean;
        ids?: number[];
        percentagesGreaterThan?: number;
        percentagesLessThan?: number;
        subjectIds?: number[];
        /**
         * kana_vocabulary, kanji, radical, or vocabulary
         */
        subjectTypes?: string[];
        updatedAfter?: Date;
    }

    /**
     * Available spaced repetition systems used for calculating srs_stage changes to Assignments and Reviews.
     *
     * Has relationship with Subjects.
     *
     * The `_position` fields align with the timestamps on assignment: `unlocking_stage_position`
     * => `unlocked_at`, `passing_stage_position` => `passed_at`, etc.
     */
    export interface SpacedRepetitionSystem
    {
        /**
         * Timestamp when the spaced_repetition_system was created.
         */
        createdAt: Date;

        /**
         * The name of the spaced repetition system
         */
        name: string;

        /**
         * Details about the spaced repetition system.
         */
        description: string;

        /**
         * `position` of the unlocking stage.
         */
        unlockingStagePosition: number;

        /**
         * `position` of the starting stage.
         */
        startingStagePosition: number;

        /**
         * `position` of the passing stage.
         */
        passingStagePosition: number;

        /**
         * `position` of the burning stage.
         */
        burningStagePosition: number;

        /**
         * A collection of stages.
         */
        stages: Stage[];
    }

    /**
     * On object containing information on a specific Spaced Repetition System Stage
     */
    export interface Stage
    {
        /**
         * The length of time added to the time of review registration, adjusted to the beginning of the hour.
         */
        interval?: number;

        /**
         * The position of the stage within the continuous order.
         */
        position: number;

        /**
         * Unit of time. Can be the following: milliseconds, seconds, minutes, hours, days, and weeks.
         */
        intervalUnit?: string;
    }

    export interface GetAllSpacedRepetitionSystemsRequest
    {
        ids?: number[];
        updatedAfter?: Date;
    }

    /**
     * Study materials store user-specific notes and synonyms for a given subject.
     *
     * The records are created as soon as the user enters any study information.
     */
    export interface StudyMaterial
    {
        /**
         * Timestamp when the study material was created.
         */
        createdAt: Date;

        /**
         * Unique identifier of the associated subject.
         */
        subjectId: number;

        /**
         * The type of the associated subject.
         */
        subjectType: SubjectType;

        /**
         * Free form note related to the meaning(s) of the associated subject.
         */
        meaningNote: string[];

        /**
         * Free form note related to the reading(s) of the associated subject.
         */
        readingNote: string;

        /**
         * Synonyms for the meaning of the subject. These are used as additional correct answers during reviews.
         */
        meaningSynonyms: string;

        /**
         * Indicates if the associated subject has been hidden, preventing it from appearing in lessons or reviews.
         */
        hidden?: boolean;
    }

    export interface GetAllStudyMaterialsRequest
    {
        hidden?: boolean;
        ids?: number[];
        subjectIds?: number[];
        /**
         * kana_vocabulary, kanji, radical, or vocabulary
         */
        subjectTypes?: string[];
        updatedAfter?: Date;
    }

    export interface CreateStudyMaterialRequest
    {
        subjectId: number;
        readingNote?: string;
        meaningNote?: string;
        meaningSynonyms?: string[];
    }

    export interface UpdateStudyMaterialRequest
    {
        id: number;
        readingNote?: string;
        meaningNote?: string;
        meaningSynonyms?: string[];
    }

    /**
     * Subjects are the `radicals`, `kanji`, `vocabulary`, and `kana_vocabulary` that are learned through lessons and reviews.
     *
     * They contain basic dictionary information, such as meanings and/or readings, and information
     * about their relationship to other items with WaniKani, like their level.
     *
     * The exact structure of a subject depends on the subject type. The available subject types
     * are `kana_vocabulary`, `kanji`, `radical`, and `vocabulary`. Note that any attributes called out
     * for the specific subject type behaves differently than the common attribute of the same name.
     */
    export interface Subject
    {
        /**
         * Collection of auxiliary meanings.
         */
        auxiliaryMeanings: AuxiliaryMeaning[];

        /**
         * The UTF-8 characters for the subject, including kanji and hiragana.
         */
        characters?: string;

        /**
         * Timestamp when the subject was created.
         */
        createdAt: Date;

        /**
         * A URL pointing to the page on wanikani.com that provides detailed information about this subject.
         */
        documentUrl: string;

        /**
         * Timestamp when the subject was hidden, indicating associated assignments will no longer
         * appear in lessons or reviews and that the subject page is no longer visible on wanikani.com.
         */
        hiddenAt?: Date;

        /**
         * The position that the subject appears in lessons.
         *
         * Note that the value is scoped to the level of the subject, so there are duplicate values across levels.
         */
        lessonPosition: number;

        /**
         * The level of the subject, from `1` to `60`.
         */
        level: number;

        /**
         * The subject meanings.
         */
        meanings: Meaning[];

        /**
         * The subject's meaning mnemonic.
         */
        meaningMnemonic: string;

        /**
         * The string that is used when generating the document URL for the subject.
         *
         * Radicals use their meaning, downcased. Kanji and vocabulary use their characters.
         */
        slug: string;

        /**
         * Unique identifier of the associated spaced_repetition_system.
         */
        spacedRepetitionSystemId: number;
    }

    export interface Meaning
    {
        /**
         * A singular subject meaning.
         */
        meaning: string;

        /**
         * Indicates priority in the WaniKani system.
         */
        primary: boolean;

        /**
         * Indicates if the meaning is used to evaluate user input for correctness.
         */
        acceptedAnswer: boolean;
    }

    export interface AuxiliaryMeaning
    {
        /**
         * A singular subject meaning.
         */
        meaning: string;

        /**
         * Either `whitelist` or `blacklist`.
         *
         * When evaluating user input, whitelisted meanings are used to match for correctness.
         * Blacklisted meanings are used to match for incorrectness.
         */
        type: AuxiliaryMeaningType;
    }

    export enum AuxiliaryMeaningType
    {
        Whitelist = 'whitelist',
        Blacklist = 'blacklist',
    }

    export interface Radical extends Subject
    {
        /**
         * An array of numeric identifiers for the kanji that have the radical as a component.
         */
        amalgamationSubjectIds: number[];

        /**
         * A collection of images of the radical.
         */
        characterImages: CharacterImage[];
    }

    export interface CharacterImage
    {
        /**
         * The location of the image.
         */
        url: string;

        /**
         * Details about the image. Each `content_type` returns a uniquely structured object.
         */
        metadata: Record<string, unknown>;

        /**
         * The content type of the image. The API only delivers `image/svg+xml`.
         */
        contentType: string;
    }

    export interface Kanji extends Subject
    {
        /**
         * An array of numeric identifiers for the kanji that have the radical as a component.
         */
        amalgamationSubjectIds: number[];

        /**
         * An array of numeric identifiers for the radicals that make up this kanji.
         *
         * Note that these are the subjects that must have passed assignments in order to unlock
         * this subject's assignment.
         */
        componentSubjectIds: number[];

        /**
         * Meaning hint for the kanji.
         */
        meaningHint?: string;

        /**
         * Reading hint for the kanji.
         */
        readingHint?: string;

        /**
         * The kanji's reading mnemonic.
         */
        readingMnemonic: string;

        /**
         * Selected readings for the kanji.
         */
        readings: KanjiReading[];

        /**
         * An array of numeric identifiers for kanji which are visually similar to the kanji in question.
         */
        visuallySimilarSubjectIds: number[];
    }

    export interface KanjiReading
    {
        /**
         * The kanji reading's classification: `kunyomi`, `nanori`, or `onyomi`.
         */
        type: ReadingType;

        /**
         * Indicates priority in the WaniKani system.
         */
        primary: boolean;

        /**
         * Indicates if the reading is used to evaluate user input for correctness.
         */
        acceptedAnswer: boolean;

        /**
         * A singular subject reading.
         */
        reading: string;
    }

    export enum ReadingType
    {
        Kunyomi = 'kunyomi',
        Nanori = 'nanori',
        Onyomi = 'onyomi',
    }

    export interface Vocabulary extends Subject
    {
        /**
         * An array of numeric identifiers for the kanji that make up this vocabulary.
         *
         * Note that these are the subjects that must be have passed assignments in order to
         * unlock this subject's assignment.
         */
        componentSubjectIds: number[];

        /**
         * A collection of context sentences.
         */
        contextSentences: ContextSentence[];

        /**
         * Parts of speech.
         */
        partsOfSpeech: string[];

        /**
         * A collection of pronunciation audio.
         */
        pronunciationAudios: PronunciationAudio[];

        /**
         * Selected readings for the vocabulary.
         */
        readings: VocabularyReading[];

        /**
         * The subject's reading mnemonic.
         */
        readingMnemonic: string;
    }

    export interface VocabularyReading
    {
        /**
         * Indicates priority in the WaniKani system.
         */
        primary: boolean;

        /**
         * A singular subject reading.
         */
        reading: string;

        /**
         * Indicates if the reading is used to evaluate user input for correctness.
         */
        acceptedAnswer: boolean;
    }

    export interface ContextSentence
    {
        /**
         * English context sentence.
         */
        en: string;

        /**
         * Japanese context sentence.
         */
        ja: string;
    }

    export interface PronunciationAudio
    {
        /**
         * The location of the audio.
         */
        url: string;

        /**
         * The content type of the audio. Currently the API delivers `audio/mpeg` and `audio/ogg`.
         */
        contentType: string;

        /**
         * Details about the pronunciation audio.
         */
        metadata: PronunciationAudioMetadata;
    }

    export interface PronunciationAudioMetadata
    {
        /**
         * The gender of the voice actor.
         */
        gender: string;

        /**
         * A unique ID shared between same source pronunciation audio.
         */
        sourceId: number;

        /**
         * Vocabulary being pronounced in kana.
         */
        pronunciation: string;

        /**
         * A unique ID belonging to the voice actor.
         */
        voiceActorId: number;

        /**
         * Humanized name of the voice actor.
         */
        voiceActorName: string;

        /**
         * Description of the voice.
         */
        voiceDescription: string;
    }

    export interface KanaVocabulary extends Subject
    {
        /**
         * A collection of context sentences.
         */
        contextSentences: ContextSentence[];

        /**
         * Parts of speech.
         */
        partsOfSpeech: string[];

        /**
         * A collection of pronunciation audio.
         */
        pronunciationAudios: PronunciationAudio[];
    }

    export interface GetAllSubjectsRequest
    {
        ids?: number[];
        types?: string[];
        slugs?: string[];
        levels?: number[];
        hidden?: boolean;
        updatedAfter?: Date;
    }

    /**
     * The summary report contains currently available lessons and reviews
     * and the reviews that will become available in the next 24 hours, grouped by the hour.
     */
    export interface Summary
    {
        /**
         * Details about subjects available for lessons.
         */
        lessons: LessonReview[];

        /**
         * Details about subjects available for reviews now and in the next 24 hours by the hour (total of 25 objects).
         */
        reviews: LessonReview[];

        /**
         * Earliest date when the reviews are available. Is `null` when the user has no reviews scheduled.
         */
        nextReviewsAt?: Date;
    }

    export interface LessonReview
    {
        /**
         * When the paired subject_ids are available for lessons.
         *
         * Always beginning of the current hour when the API endpoint is accessed.
         */
        availableAt: Date;

        /**
         * Collection of unique identifiers for subjects.
         */
        subjectIds: number[];
    }

    /**
     * The user summary returns basic information for the user making the API request, identified by their API key.
     */
    export interface User
    {
        id: string;

        /**
         * The current level of the user. This ignores subscription status.
         */
        level: number;

        /**
         * Details about the user's subscription state.
         */
        subscription: Subscription;

        /**
         * The URL to the user's public facing profile page.
         */
        profileUrl: string;

        /**
         * The signup date for the user.
         */
        startedAt: Date;

        /**
         * User settings specific to the WaniKani application.
         */
        preferences: Preferences;

        /**
         * The user's username.
         */
        username: string;

        /**
         * If the user is on vacation, this will be the timestamp of when that vacation started.
         *
         * If the user is not on vacation, this is `null`.
         */
        currentVacationStartedAt?: Date;
    }

    /**
     * Details about the user's subscription state.
     */
    export interface Subscription
    {
        /**
         * Whether or not the user currently has a paid subscription.
         */
        active?: boolean;

        /**
         * The type of subscription the user has. Options are following: `free`, `recurring`, and `lifetime`.
         */
        type: string;

        /**
         * The maximum level of content accessible to the user for lessons, reviews, and content review.
         *
         * For unsubscribed/free users, the maximum level is `3`. For subscribed users, this is `60`.
         * **Any application that uses data from the WaniKani API must respect these access limits.**
         */
        maxLevelGranted: number;

        /**
         * The date when the user's subscription period ends.
         *
         * If the user has subscription type `lifetime` or `free` then the value is `null`.
         */
        periodEndsAt?: Date;
    }

    /**
     * User settings specific to the WaniKani application.
     */
    export interface Preferences
    {
        /**
         * This is a deprecated user preference. It will always return `1` and cannot be set. It exists only to ensure existing consumers of this API don't break.
         */
        defaultVoiceActorId: number;

        /**
         * Automatically play pronunciation audio for vocabulary during extra study.
         */
        extraStudyAutoplayAudio: boolean;

        /**
         * Automatically play pronunciation audio for vocabulary during lessons.
         */
        lessonsAutoplayAudio: boolean;

        /**
         * Number of subjects introduced to the user during lessons before quizzing.
         */
        lessonsBatchSize: number;

        /**
         * Automatically play pronunciation audio for vocabulary during reviews
         */
        reviewsAutoplayAudio: boolean;

        /**
         * Toggle for display SRS change indicator after a subject has been completely answered during review.
         */
        reviewsDisplaySrsIndicator: boolean;

        /**
         * The order in which reviews are presented. The options are `shuffled` and `lower_levels_first`.
         *
         * The default is `shuffled`.
         */
        reviewsPresentationOrder: string;
    }

    export interface UpdateUserRequest
    {
        extraStudyAutoplayAudio?: boolean;
        lessonsAutoplayAudio?: boolean;
        lessonsBatchSize?: boolean;
        reviewsAutoplayAudio?: boolean;
        reviewsDisplaySrsIndicator?: number;
        reviewsPresentationOrder?: string;
    }

    /**
     * Available voice actors used for vocabulary reading pronunciation audio.
     */
    export interface VoiceActor
    {
        /**
         * Details about the voice actor.
         */
        description: string;

        /**
         * `male` or `female`
         */
        gender: string;

        /**
         * The voice actor's name
         */
        name: string;
    }

    export interface GetAllVoiceActorsRequest
    {
        ids?: number[];
        updatedAfter?: Date;
    }

    /**
     * The type of the associated subject, one of: kana_vocabulary, kanji, radical, or vocabulary.
     */
    export enum SubjectType
    {
        Radical = 'radical',
        Kanji = 'kanji',
        Vocabulary = 'vocabulary',
        KanaVocabulary = 'kana_vocabulary',
    }

    /**
     * A base class with common values across WaniKani models e.g. "assignment"
     */
    export interface WaniKaniBase<T>
    {
        /**
         * The kind of object returned.
         *
         * See the [object types section](https://docs.api.wanikani.com/20170710/#object-types) for
         * all the kinds.
         */
        object: string;

        /**
         * The URL of the request.
         *
         * For collections, that will contain all the filters and options you've passed to the API.
         * Resources have a single URL and don't need to be filtered, so the URL will be the same
         * in both resource and collection responses.
         */
        url: string;

        /**
         * DateTime the object was last updated.
         *
         * For collections, this is the timestamp of the most recently updated resource
         * in the specified scope and is not limited by pagination. If no resources were
         * returned for the specified scope, then this will be null. For a resource, then
         * this is the last time that particular resource was updated.
         */
        dateUpdatedAt?: Date;
    }

    /**
     * A base class for Response types of the API that do not have id's e.g. the summary report
     */
    export interface WaniKaniResponse<T> extends WaniKaniBase<T>
    {
        /**
         * The attributes that are specific to that particular instance and kind of resource.
         */
        data?: T;
    }

    /**
     * A resource returned by the WaniKani API with an associated id.
     */
    export interface WaniKaniResource<T> extends WaniKaniBase<T>
    {
        /**
         * The attributes that are specific to that particular instance and kind of resource.
         */
        data: T;

        /**
         * Identifier unique to a resource.
         */
        id: number;
    }

    /**
     * A collection returned by the WaniKani API with pagination information.
     */
    export interface WaniKaniCollection<T> extends WaniKaniBase<T>
    {
        /**
         * Pagination details for the collection.
         */
        pages: WaniKaniPage;

        /**
         * A count of all resources available within the specified scope, **NOT** limited to pagination.
         */
        totalCount: number;

        /**
         * The resources returned by the specified scope.
         */
        data: WaniKaniResource<T>[];
    }

    /**
     * Pagination details for WaniKaniCollections
     */
    export interface WaniKaniPage
    {
        /**
         * Maximum number of resources delivered for this collection.
         */
        perPage: number;

        /**
         * The URL of the next page of results. If there are no more results, the value is null.
         */
        nextUrl?: string;

        /**
         * The URL of the previous page of results. If there are no results at all or no previous page to go to, the value is null.
         */
        previousUrl?: string;
    }
}