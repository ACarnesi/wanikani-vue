import { defineStore } from 'pinia'
import { inject, ref, toRaw } from 'vue'
import { useStudyMaterial } from '@/composables/studyMaterial';
import { useUserStore } from './users';
import { useWaniKaniDbKey } from '@/@types/injectionKeys';


export const useStudyMaterialStore = defineStore('studyMaterial', () =>
{
    const waniKaniDB = inject(useWaniKaniDbKey);
    const studyMaterialApi = useStudyMaterial();
    const userStore = useUserStore();

    let studyMaterialError = ref(null as Error | null);

    async function getStudyMaterials()
    {
        let request = {} as WaniKani.GetAllStudyMaterialsRequest;

        //If data is in cache, retrieve only updated study materials since last pull
        if (userStore.user.studyMaterialsLastUpdated)
        {
            request.updatedAfter = userStore.user.studyMaterialsLastUpdated;
        }

        let getAllStudyMaterialsResponse = {} as WaniKani.WaniKaniCollection<WaniKani.StudyMaterial>;

        let updatedStudyMaterials: WaniKani.WaniKaniResource<WaniKani.StudyMaterial>[] = [];

        do
        {
            let getAllStudyMaterialsResult = await studyMaterialApi.getAllStudyMaterials(request, getAllStudyMaterialsResponse?.pages?.nextUrl);
            getAllStudyMaterialsResponse = getAllStudyMaterialsResult.studyMaterials;

            if (getAllStudyMaterialsResult.getStudyMaterialsError)
            {
                console.error('Error encountered while fetching new/updated study materials:', getAllStudyMaterialsResult);
                studyMaterialError.value = getAllStudyMaterialsResult.getStudyMaterialsError
                break;
            }

            getAllStudyMaterialsResponse.data.forEach(s =>
            {
                updatedStudyMaterials.push(s);
            });
        } while (getAllStudyMaterialsResponse.pages.nextUrl);

        if (!studyMaterialError.value)
        {
            let tx = waniKaniDB?.transaction(['studyMaterials', 'user'], 'readwrite');
            await Promise.all([
                updatedStudyMaterials.map(s => tx?.objectStore('studyMaterials').put(toRaw(s))),
                userStore.setLastUpdated(new Date(), 'studyMaterialsLastUpdated', tx),
                tx!.done
            ]);
        }
    }

    async function getStudyMaterial(subjectId: number)
    {
        let tx = waniKaniDB?.transaction('studyMaterials', 'readonly').store.index('subject-id');
        let queryResult = await tx?.get(subjectId);

        return (queryResult as WaniKani.WaniKaniResource<WaniKani.StudyMaterial> | undefined) ?? null
    }

    return { studyMaterialError, getStudyMaterial, getStudyMaterials };
});