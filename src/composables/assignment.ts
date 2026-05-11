import { inject } from 'vue'
import { useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { isAssignment, isWaniKaniCollectionWithData } from '@/@types/waniKaniTypeGuards';
import { requestObjectToQuery } from '@helpers/urlHelpers.ts';

//TODO Update function to account for pagination and needing to perform multiple requests to get all data
export function useAssignment()
{
    const useWaniKaniFetch = inject(useWaniKaniFetchKey);

    async function getAssignments(request: WaniKani.GetAllAssignmentsRequest = {})
    {
        let getAssignmentsError: Error | null = null;
        let assignments = [] as WaniKani.WaniKaniResource<WaniKani.Assignment>[];

        if (!useWaniKaniFetch)
        {
            getAssignmentsError = new Error('WaniKani fetch function not available. Make sure it is provided in the app context.');
            return { assignments, getAssignmentsError }
        }

        let { data, error } = await useWaniKaniFetch('assignments' + requestObjectToQuery(request)).get().json();

        if (error.value)
        {
            getAssignmentsError = error.value;
            return { assignments, getAssignmentsError };
        }

        if (!isWaniKaniCollectionWithData(data.value, isAssignment))
        {
            console.error('Invalid assignments data:', data.value);
            getAssignmentsError = new Error('Invalid assignments data received from API.');
            return { assignments, getAssignmentsError };
        }

        return { assignments: data.value.data, getAssignmentsError };
    }

    return { getAssignments };
}