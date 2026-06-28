import { defineStore } from 'pinia'
import { inject, ref, toRaw } from 'vue'
import { useSubject } from '@/composables/subject';
import { useUserStore } from './users';
import { useWaniKaniDbKey } from '@/@types/injectionKeys';


export const useSubjectStore = defineStore('subject', () =>
{
    const waniKaniDB = inject(useWaniKaniDbKey);
    const subjectApi = useSubject();
    const userStore = useUserStore();

    //let subjects = ref({ data: {} } as WaniKani.SubjectStore);
    let subjectError = ref(null as Error | null);

    async function getSubjects()
    {
        let request = {} as WaniKani.GetAllSubjectsRequest;

        //If data is in cache, retrieve only updated subjects since last pull
        if (userStore.user.subjectsLastUpdated)
        {
            request.updatedAfter = userStore.user.subjectsLastUpdated;
        }

        let getAllSubjectsResponse = {} as WaniKani.WaniKaniCollection<WaniKani.Subject>;

        let updatedSubjects: WaniKani.WaniKaniResource<WaniKani.Subject>[] = [];

        do
        {
            let getAllSubjectsResult = await subjectApi.getAllSubjects(request, getAllSubjectsResponse?.pages?.nextUrl);
            getAllSubjectsResponse = getAllSubjectsResult.subjects;

            if (getAllSubjectsResult.getSubjectsError)
            {
                console.error('Error encountered while fetching new/updated subjects:', getAllSubjectsResult);
                subjectError.value = getAllSubjectsResult.getSubjectsError
                break;
            }

            getAllSubjectsResponse.data.forEach(s =>
            {
                updatedSubjects.push(s);
            });
        } while (getAllSubjectsResponse.pages.nextUrl);

        if (!subjectError.value)
        {
            let tx = waniKaniDB?.transaction(['subjects', 'user'], 'readwrite');
            await Promise.all([
                updatedSubjects.map(s => tx?.objectStore('subjects').put(toRaw(s))),
                userStore.setSubjectsLastUpdated(new Date(), tx),
                tx!.done
            ]);
        }
    }

    async function getSubjectsForLevel(level: number)
    {
        let tx = waniKaniDB?.transaction('subjects', 'readonly').store.index('level');
        let subjectsForLevel = await tx?.getAll(level);

        return subjectsForLevel as WaniKani.WaniKaniResource<WaniKani.Subject>[];
    }

    async function getSubjectsForIds(subjectIds: number[])
    {
        let retObj: WaniKani.WaniKaniResource<WaniKani.Subject>[] = [];

        if (subjectIds.length == 0)
            return retObj;

        let tx = waniKaniDB?.transaction('subjects', 'readonly').store;
        let subjectQueries = await subjectIds.map(id => tx?.get(id));

        await Promise.all(subjectQueries).then((results) =>
        {
            retObj = results.map((queryResult) =>
            {
                return queryResult as WaniKani.WaniKaniResource<WaniKani.Subject> | undefined;
            }).filter(subject => subject !== undefined);
        });

        return retObj as WaniKani.WaniKaniResource<WaniKani.Subject>[];
    }

    return { subjectError, getSubjects, getSubjectsForLevel, getSubjectsForIds };
});