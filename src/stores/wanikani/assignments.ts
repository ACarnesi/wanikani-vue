import { defineStore } from 'pinia'
import { inject, ref, toRaw } from 'vue'
import { useAssignment } from '@/composables/assignment';
import { useUserStore } from './users';
import { useWaniKaniDbKey } from '@/@types/injectionKeys';

export const useAssignmentStore = defineStore('assignment', () =>
{
    const waniKaniDB = inject(useWaniKaniDbKey);
    const assignmentApi = useAssignment();
    const userStore = useUserStore();

    let assignmentError = ref(null as Error | null);

    async function getAssignments()
    {
        let request = {} as WaniKani.GetAllAssignmentsRequest;

        //If we've pulled assignments before, retrieve only updated assignments since last pull
        if (userStore.user.assignmentsLastUpdated)
        {
            request.updatedAfter = userStore.user.assignmentsLastUpdated;
        }

        let getAllAssignmentsResponse = {} as WaniKani.WaniKaniCollection<WaniKani.Assignment>;

        let updatedAssignments: WaniKani.WaniKaniResource<WaniKani.Assignment>[] = [];

        do
        {
            let getAllAssignmentsResult = await assignmentApi.getAssignments(request, getAllAssignmentsResponse?.pages?.nextUrl);
            getAllAssignmentsResponse = getAllAssignmentsResult.assignments;

            if (getAllAssignmentsResult.getAssignmentsError)
            {
                console.error('Error encountered while fetching new/updated assignments:', getAllAssignmentsResult);
                assignmentError.value = getAllAssignmentsResult.getAssignmentsError
                break;
            }

            getAllAssignmentsResponse.data.forEach(a =>
            {
                updatedAssignments.push(a);
            });
        } while (getAllAssignmentsResponse.pages.nextUrl);

        if (!assignmentError.value)
        {
            let tx = waniKaniDB?.transaction(['assignments', 'user'], 'readwrite');
            await Promise.all([
                updatedAssignments.map(a => tx?.objectStore('assignments').put(toRaw(a))),
                userStore.setAssignmentsLastUpdated(new Date(), tx),
                tx!.done
            ]);
        }
    }

    async function getAssignmentsForSubjectKeys(subjectKeys: number[])
    {
        let tx = waniKaniDB?.transaction('assignments', 'readonly');
        let index = tx?.store.index('subject-id');

        let assignmentQueries = subjectKeys.map(key => index?.get(key));
        let assignmentsForSubjects: WaniKani.WaniKaniResource<WaniKani.Assignment>[] = [];
        await Promise.all(assignmentQueries).then((results) =>
        {
            assignmentsForSubjects = results.map((queryResult) =>
            {
                return queryResult as WaniKani.WaniKaniResource<WaniKani.Assignment> | undefined;
            }).filter(assignment => assignment !== undefined);
        });

        return assignmentsForSubjects;
    }

    async function getAvailableAssignmentsForPeriod(isStarted: boolean = true, after: Date | null = null, before: Date | null = null, count: number | undefined = undefined)
    {
        let tx = waniKaniDB?.transaction('assignments', 'readonly').store.index('available-at');
        let bound: IDBKeyRange | null = null;

        if (after && before)
        {
            bound = IDBKeyRange.bound(after, before);
        }
        else if (after)
        {
            bound = IDBKeyRange.lowerBound(after);
        }
        else if (before)
        {
            bound = IDBKeyRange.upperBound(before);
        }

        let availableAssignments = await tx?.getAll(bound, count) as WaniKani.WaniKaniResource<WaniKani.Assignment>[];
        //Filter by flags 
        availableAssignments = availableAssignments.filter(a =>
        {
            if (isStarted && a.data.startedAt == null)
            {
                return false;
            }

            return true;
        });

        return availableAssignments;
    }

    return { assignmentError, getAssignments, getAssignmentsForSubjectKeys, getAvailableAssignmentsForPeriod };
});