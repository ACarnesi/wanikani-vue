import camelcaseKeysDeep from 'camelcase-keys-deep';
import { createFetch } from '@vueuse/core';
import { logEvent, type Analytics } from 'firebase/analytics';

export default function createWaniKaniFetch(firebaseAnalytics: Analytics)
{
    return createFetch({
        baseUrl: 'https://api.wanikani.com/v2/',
        options: {
            async beforeFetch({ options }: { options: RequestInit })
            {
                const myToken = localStorage.getItem('wanikani-api-key');
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${myToken}`
                };

                return { options };
            },
            afterFetch({ data })
            {
                data = camelcaseKeysDeep(JSON.parse(JSON.stringify(data)));
                return { data };
            },
            onFetchError(ctx)
            {
                logEvent(firebaseAnalytics, 'fetch_error', { error: ctx.error.message });
                return ctx;
            }
        },
        fetchOptions: {
            mode: 'cors',
        },
    });
}