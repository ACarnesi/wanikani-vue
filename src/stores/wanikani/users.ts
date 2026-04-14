import { defineStore } from 'pinia'
import { ref, inject } from 'vue'
import { isUser, isWaniKaniResourceWithData } from '@/@types/waniKaniTypeGuards';
import { useWaniKaniFetchKey } from '@/@types/injectionKeys';
import { STORAGE_KEY_API_TOKEN } from '@/helpers/constants';

export const useUserStore = defineStore('user', () =>
{
    let user = ref({} as WaniKani.User);
    let userError = ref(null as Error | null);
    const useWaniKaniFetch = inject(useWaniKaniFetchKey);

    async function getUser(apiKey: string | null = null)
    {
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

        user.value = data.value.data as WaniKani.User;
    }

    function clearUser()
    {
        localStorage.removeItem(STORAGE_KEY_API_TOKEN);
        user.value = {} as WaniKani.User;
    }

    return { user, userError, getUser, clearUser };
});