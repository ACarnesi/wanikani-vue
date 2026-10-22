import { useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { isStudyMaterial, isWaniKaniCollectionWithData } from '@/@types/waniKaniTypeGuards';
import { requestObjectToQuery } from '@/helpers/urlHelpers';
import { defineStore } from 'pinia'
import { inject } from 'vue'

export const useStudyMaterial = defineStore('studyMaterials', () =>
{
    const useWaniKaniFetch = inject(useWaniKaniFetchKey);

    async function getAllStudyMaterials(request: WaniKani.GetAllStudyMaterialsRequest = {}, nextPage: string | null = null)
    {
        let getStudyMaterialsError: Error | null = null;
        let studyMaterials = {} as WaniKani.WaniKaniCollection<WaniKani.StudyMaterial>;

        if (!useWaniKaniFetch)
        {
            getStudyMaterialsError = new Error('WaniKani fetch function not available. Make sure it is provided in the app context.');
            return { studyMaterials, getStudyMaterialsError }
        }

        let url = nextPage ?? 'study_materials' + requestObjectToQuery(request);

        let { data, error } = await useWaniKaniFetch(url).get().json();

        if (error.value)
        {
            getStudyMaterialsError = error.value;
            return { studyMaterials, getStudyMaterialsError };
        }

        if (!isWaniKaniCollectionWithData(data.value, isStudyMaterial))
        {
            console.error('Invalid study materials data:', data.value);
            getStudyMaterialsError = new Error('Invalid study materials data received from API.');
            return { studyMaterials, getStudyMaterialsError };
        }

        studyMaterials = data.value;
        return { studyMaterials, getStudyMaterialsError };
    }

    return { getAllStudyMaterials };
});