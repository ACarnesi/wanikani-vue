import { inject } from 'vue'
import { useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { isSubject, isWaniKaniCollectionWithData } from '@/@types/waniKaniTypeGuards';
import { requestObjectToQuery } from '@helpers/urlHelpers.ts';

export function useSubject()
{
    const useWaniKaniFetch = inject(useWaniKaniFetchKey);

    async function getAllSubjects(request: WaniKani.GetAllSubjectsRequest = {}, nextPage: string | null = null)
    {
        let getSubjectsError: Error | null = null;
        let subjects = {} as WaniKani.WaniKaniCollection<WaniKani.Subject>;

        if (!useWaniKaniFetch)
        {
            getSubjectsError = new Error('WaniKani fetch function not available. Make sure it is provided in the app context.');
            return { subjects, getSubjectsError }
        }

        let url = nextPage ?? 'subjects' + requestObjectToQuery(request);

        let { data, error } = await useWaniKaniFetch(url).get().json();

        if (error.value)
        {
            getSubjectsError = error.value;
            return { subjects, getSubjectsError };
        }

        if (!isWaniKaniCollectionWithData(data.value, isSubject))
        {
            console.error('Invalid subjects data:', data.value);
            getSubjectsError = new Error('Invalid subjects data received from API.');
            return { subjects, getSubjectsError };
        }

        subjects = data.value;

        return { subjects, getSubjectsError };
    }

    return { getAllSubjects };
};