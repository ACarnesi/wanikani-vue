import { defineStore } from 'pinia'
import { ref, inject, computed, toRaw } from 'vue'
import { isUser, isWaniKaniResourceWithData } from '@/@types/waniKaniTypeGuards';
import { useWaniKaniDbKey, useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { STORAGE_KEY_API_TOKEN, USER_KEY } from '@/helpers/constants';
import type { IDBPTransaction } from 'idb/build/entry.js';


export const useUserStore = defineStore('user', () =>
{
    let user = ref({} as WaniKani.UserStore);
    let userError = ref(null as Error | null);

    const useWaniKaniFetch = inject(useWaniKaniFetchKey);
    const waniKaniDb = inject(useWaniKaniDbKey);

    const isLoggedIn = computed(() => !!user.value.userDetails?.id);

    async function getUser(apiKey: string | null = null)
    {
        if (!waniKaniDb)
        {
            userError.value = new Error('WaniKani database not available. Make sure it is provided in the app context.');
            return { user, userError };
        }

        //TODO Question: Do we even want to store user data in the IDb? We need to pull data regularly regardless for settings changes and level progression
        await waniKaniDb.get('user', USER_KEY).then(dbUser =>
        {
            if (dbUser)
            {
                user.value = dbUser as WaniKani.UserStore;
            }
        });

        //Temporarily disabled to allow pulling new user data while determining above TODO question
        // if (user.value.userDetails)
        // {
        //     return { user, userError };
        // }

        if (!useWaniKaniFetch)
        {
            userError.value = new Error('WaniKani fetch function not available. Make sure it is provided in the app context.');
            return { user, userError }
        }

        let apiTokenFromStorage = localStorage.getItem(STORAGE_KEY_API_TOKEN);
        const currentApiKey = ref(apiTokenFromStorage || apiKey as string | null);

        if (currentApiKey.value === null)
        {
            userError.value = new Error('API key is required but not provided.');
            return { user, userError }
        }
        else if (apiTokenFromStorage !== currentApiKey.value)
        {
            localStorage.setItem(STORAGE_KEY_API_TOKEN, currentApiKey.value as string);
        }

        //TODO update to action for fetching on demand instead of on store initialization
        let { data, error } = await useWaniKaniFetch('user').get().json();

        if (error.value)
        {
            userError.value = error.value;
            return { user, userError };
        }

        if (!isWaniKaniResourceWithData(data.value, isUser))
        {
            console.error('Invalid user data:', data.value);
            userError.value = new Error('Invalid user data received from API.');
            return { user, userError };
        }

        user.value.userDetails = data.value as WaniKani.WaniKaniResource<WaniKani.User>;
        await waniKaniDb.put('user', toRaw(user.value), USER_KEY);
    }

    function clearUser()
    {
        localStorage.removeItem(STORAGE_KEY_API_TOKEN);
        user.value = {} as WaniKani.UserStore;
    }

    async function setSubjectsLastUpdated(date: Date, tx?: IDBPTransaction<WaniKani.WaniKaniDBSchema, string[], "readwrite">)
    {
        user.value.subjectsLastUpdated = date;
        if (tx)
        {
            await tx.objectStore('user').put(toRaw(user.value), USER_KEY);
        }
        else
        {
            await waniKaniDb?.put('user', toRaw(user.value), USER_KEY);
        }
    }

    async function setAssignmentsLastUpdated(date: Date, tx?: IDBPTransaction<WaniKani.WaniKaniDBSchema, string[], "readwrite">)
    {
        user.value.assignmentsLastUpdated = date;
        if (tx)
        {
            await tx.objectStore('user').put(toRaw(user.value), USER_KEY);
        }
        else
        {
            await waniKaniDb?.put('user', toRaw(user.value), USER_KEY);
        }
    }

    return { user, userError, isLoggedIn, getUser, clearUser, setSubjectsLastUpdated, setAssignmentsLastUpdated };
});