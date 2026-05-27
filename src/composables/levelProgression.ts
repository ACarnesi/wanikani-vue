import { inject } from 'vue'
import { useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { isLevelProgression, isWaniKaniCollectionWithData } from '@/@types/waniKaniTypeGuards';
import { requestObjectToQuery } from '@helpers/urlHelpers.ts';

export function useLevelProgression() 
{
    const useWaniKaniFetch = inject(useWaniKaniFetchKey);

    async function getLevelProgression(request: WaniKani.GetAllLevelProgressionsRequest = {})
    {
        let getLevelProgressionError: Error | null = null;
        let levelProgression = [] as WaniKani.WaniKaniResource<WaniKani.LevelProgression>[];

        if (!useWaniKaniFetch)
        {
            getLevelProgressionError = new Error('WaniKani fetch function not available. Make sure it is provided in the app context.');
            return { levelProgression, getLevelProgressionError }
        }

        let { data, error } = await useWaniKaniFetch('level_progressions' + requestObjectToQuery(request)).get().json();

        if (error.value)
        {
            getLevelProgressionError = error.value;
            return { levelProgression, getLevelProgressionError };
        }

        if (!isWaniKaniCollectionWithData(data.value, isLevelProgression))
        {
            console.error('Invalid level progression data:', data.value);
            getLevelProgressionError = new Error('Invalid level progression data received from API.');
            return { levelProgression, getLevelProgressionError };
        }

        return { levelProgression: data.value.data, getLevelProgressionError };
    }

    return { getLevelProgression };
}