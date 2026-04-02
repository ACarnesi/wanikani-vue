import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { useFetch } from '@composables/useFetch';
import { isUser, isWaniKaniResourceWithData } from '@/@types/WaniKaniTypeGuards';

export const useUserStore = defineStore('user', async () =>
{
    let user = reactive({} as WaniKani.WaniKaniResource<WaniKani.User>);
    let userError = ref(null as Error | null);

    //TODO update to action for fetching on demand instead of on store initialization
    let { data, error } = await useFetch('https://api.wanikani.com/v2/user', '');

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

    user = data.value;

    return { user, userError };
});