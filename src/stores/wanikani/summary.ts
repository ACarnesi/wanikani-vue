import { defineStore } from 'pinia'
import { inject, ref } from 'vue'
import { isSummary, isWaniKaniResourceWithData } from '@/@types/waniKaniTypeGuards';
import { useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { useUserStore } from './users';

export const useSummaryStore = defineStore('summary', () =>
{
    const lessons = ref([] as WaniKani.LessonReview[]);
    const reviews = ref([] as WaniKani.LessonReview[]);
    const nextReviews = ref({} as Date | null);
    const useWaniKaniFetch = inject(useWaniKaniFetchKey);
    const userStore = useUserStore();

    let summaryError = ref(null as Error | null);

    async function getSummary()
    {
        if (!useWaniKaniFetch)
        {
            summaryError.value = new Error('WaniKani fetch function not available. Make sure it is provided in the app context.');
            return { lessons, reviews, nextReviews, summaryError }
        }

        let { data, error } = await useWaniKaniFetch('summary').get().json();

        if (error.value)
        {
            summaryError.value = error.value;
            return { lessons, reviews, nextReviews, summaryError };
        }

        if (!isWaniKaniResourceWithData(data.value, isSummary))
        {
            console.error('Invalid summary data:', data.value);
            summaryError.value = new Error('Invalid summary data received from API.');
            return { lessons, reviews, nextReviews, summaryError };
        }

        lessons.value = data.value.data.lessons as WaniKani.LessonReview[];
        reviews.value = data.value.data.reviews as WaniKani.LessonReview[];
        nextReviews.value = data.value.data.nextReviewsAt as Date | null;
    }

    function clearSummary()
    {
        lessons.value = {} as WaniKani.LessonReview[];
        reviews.value = {} as WaniKani.LessonReview[];
        nextReviews.value = null;
    }

    // Watchers  
    userStore.$subscribe((mutation, state) =>
    {
        console.log('User store changed:', mutation, state);
        if (mutation.storeId === 'user')
        {
            if (state.user.id)
            {
                getSummary();
            }
            else
            {
                clearSummary();
            }
        }
    });

    return { lessons, reviews, nextReviews, summaryError, getSummary, clearSummary };
});