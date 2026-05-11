<template>
    <div class="max-w-150 h-fit self-center mx-auto m-3 bg-gray-700 p-3 rounded-xl">
        <div class="font-bold text-4xl mx-auto w-fit mb-3">Welcome to WaniKani Vue!</div>
        <div class="mb-3 p-2 border rounded-md">
            In order for WaniKani Vue to interact with WaniKani, a valid API token is required. You can create one on the WaniKani website <a href="https://www.wanikani.com/settings/personal_access_tokens" target="_blank" class="text-blue-500 underline">here</a>.
        </div>
        <form>
            <div class="mb-3">
                <label for="apiToken">API Token:</label><br>
                <input class="border rounded-sm p-1 w-full" type="text" id="apiToken" v-model="apiToken" />
            </div>
            <button class="float-right" type="submit" @click.prevent="() => getUser()">Fetch User Data</button>
        </form>
        <div v-if="store.userError" class="text-red-500">
        Error fetching user data: {{ store.userError.message }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@stores/wanikani/users';
import { useRouter } from 'vue-router';
import { STORAGE_KEY_API_TOKEN } from '@helpers/constants';

const router = useRouter();
const store = useUserStore();

let apiToken = ref(localStorage.getItem(STORAGE_KEY_API_TOKEN));

async function getUser() {
    if (!apiToken.value) {
        store.userError = new Error('API token is required');
        return;
    }

    let getUserResult = await store.getUser(apiToken.value);

    console.log('getUserResult:', getUserResult);

    if (getUserResult?.userError) {
        console.error('Error fetching user data:', store.userError);
    }
    else {
        router.push('/home');
    }
}
</script>