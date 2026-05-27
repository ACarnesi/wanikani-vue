import { inject } from 'vue'
import { useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { isAssignment, isWaniKaniCollectionWithData } from '@/@types/waniKaniTypeGuards';
import { requestObjectToQuery } from '@helpers/urlHelpers.ts';

//TODO Update function to account for pagination and needing to perform multiple requests to get all data
export function useAssignment()
{
    const useWaniKaniFetch = inject(useWaniKaniFetchKey);

    async function getAssignments(request: WaniKani.GetAllAssignmentsRequest = {}, nextPage: string | null = null)
    {
        let getAssignmentsError: Error | null = null;
        let assignments = {} as WaniKani.WaniKaniCollection<WaniKani.Assignment>;

        if (!useWaniKaniFetch)
        {
            getAssignmentsError = new Error('WaniKani fetch function not available. Make sure it is provided in the app context.');
            return { assignments, getAssignmentsError }
        }

        let url = nextPage ?? 'assignments' + requestObjectToQuery(request);

        let { data, error } = await useWaniKaniFetch(url).get().json();

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

        assignments = data.value;

        return { assignments, getAssignmentsError };
    }

    return { getAssignments };
}