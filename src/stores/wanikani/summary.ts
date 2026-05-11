import { defineStore } from 'pinia'
import { inject, ref, computed, toValue } from 'vue'
import { isSummary, isWaniKaniResourceWithData } from '@/@types/waniKaniTypeGuards';
import { useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { useUserStore } from './users';
import { useAssignment } from '@composables/assignment';
import { getWeekday } from '@/helpers/dateHelpers';

export const useSummaryStore = defineStore('summary', () =>
{
    const useWaniKaniFetch = inject(useWaniKaniFetchKey);
    const assignmentApi = useAssignment();
    const userStore = useUserStore();

    const lessons = ref([] as WaniKani.LessonReview[]);
    const reviews = ref([] as WaniKani.LessonReview[]);
    const nextReviews = ref({} as Date | null);

    let upcomingAssignments = ref([] as WaniKani.WaniKaniResource<WaniKani.Assignment>[]);
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

        var weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        let getAssignmentsRequest: WaniKani.GetAllAssignmentsRequest = {
            started: true,
            availableBefore: weekFromNow, // Get assignments that will be available within the week
        }

        let assignmentResponse = await assignmentApi.getAssignments(getAssignmentsRequest);
        if (assignmentResponse === undefined)
        {
            summaryError.value = new Error('Failed to fetch assignments for summary.');
            return { lessons, reviews, nextReviews, summaryError };
        }
        else if (assignmentResponse.getAssignmentsError)
        {
            summaryError.value = assignmentResponse.getAssignmentsError;
            return { lessons, reviews, nextReviews, summaryError };
        }

        upcomingAssignments.value = assignmentResponse.assignments;
    }

    function clearSummary()
    {
        lessons.value = {} as WaniKani.LessonReview[];
        reviews.value = {} as WaniKani.LessonReview[];
        nextReviews.value = null;
        upcomingAssignments.value = [] as WaniKani.WaniKaniResource<WaniKani.Assignment>[];
    }

    const dayForecast = computed(() =>
    {
        if (upcomingAssignments.value.length <= 0)
        {
            return [];
        }

        var dayFromNow = new Date()
        dayFromNow.setDate(dayFromNow.getDate() + 1);
        console.log('Upcoming assignments:', toValue(upcomingAssignments));

        console.log(upcomingAssignments.value[0]?.data.availableAt);
        console.log(dayFromNow);

        let daysAssignments = upcomingAssignments.value.filter(assignment => assignment.data.availableAt
            && assignment.data.availableAt <= dayFromNow);

        let forecast = daysAssignments.reduce((acc: Record<number, WaniKani.WaniKaniResource<WaniKani.Assignment>[]>, assignment) =>
        {
            let hour = assignment.data.availableAt!.getHours();
            if (!acc[hour])
            {
                acc[hour] = [];
            }

            acc[hour].push(assignment);
            return acc;
        }, {});

        return forecast;
    });

    const weekForecast = computed(() =>
    {
        if (upcomingAssignments.value.length <= 0)
        {
            return [];
        }

        var weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        let weeksAssignments = upcomingAssignments.value.filter(assignment => assignment.data.availableAt
            && assignment.data.availableAt <= weekFromNow);

        let forecast = weeksAssignments.reduce((acc: Record<string, WaniKani.WaniKaniResource<WaniKani.Assignment>[]>, assignment) =>
        {
            let weekday = getWeekday(assignment.data.availableAt!);
            if (!acc[weekday])
            {
                acc[weekday] = [];
            }

            acc[weekday].push(assignment);
            return acc;
        }, {});

        return forecast;
    });

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

    return { lessons, reviews, upcomingAssignments, nextReviews, summaryError, dayForecast, weekForecast, getSummary, clearSummary };
});