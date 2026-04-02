import { ref } from 'vue'
import camelcaseKeysDeep from 'camelcase-keys-deep';


export async function useFetch<T>(url: string, apiKey: string | null = null)
{
    const data = ref(null as T | null)
    const error = ref(null as any)

    //TODO find better way than localStorage to store api key 
    let apiKeyFromStorage = localStorage.getItem('wanikani-api-key');
    const currentApiKey = ref(apiKeyFromStorage || apiKey as string | null);

    if (currentApiKey.value === null)
    {
        error.value = new Error('API key is required but not provided.');
        return { data, error }
    }
    else if (apiKeyFromStorage !== currentApiKey.value)
    {
        localStorage.setItem('wanikani-api-key', currentApiKey.value as string);
    }

    await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })
        .then((res) => res.json())
        .then((json) => (data.value = camelcaseKeysDeep(JSON.parse(JSON.stringify(json)))))
        .catch((err) => (error.value = err))

    return { data, error }
}