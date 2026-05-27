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
        <div v-if="userStore.userError" class="text-red-500">
        Error fetching user data: {{ userStore.userError.message }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@stores/wanikani/users';
import { useAssignmentStore } from '@stores/wanikani/assignments';
import { useSubjectStore } from '@/stores/wanikani/subject';
import { useRouter } from 'vue-router';
import { STORAGE_KEY_API_TOKEN } from '@helpers/constants';

const router = useRouter();
const userStore = useUserStore();
const assignmentStore = useAssignmentStore();
const subjectStore = useSubjectStore();

let apiToken = ref(localStorage.getItem(STORAGE_KEY_API_TOKEN));

async function getUser() {
    if (!apiToken.value) {
        userStore.userError = new Error('API token is required');
        return;
    }

    let getUserResult = await userStore.getUser(apiToken.value);

    if (getUserResult?.userError.value) {
        console.error('Error fetching user data:', userStore.userError);
    }
    else {
        await Promise.all([
            subjectStore.getSubjects(),
            assignmentStore.getAssignments()
        ]);
        router.push('/home');
    }
}
</script>