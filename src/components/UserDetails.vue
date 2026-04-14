<template>
      <div>
        <h2 class="text-2xl font-bold mb-4">User Information</h2>
        <div v-if="store.user.level">
          <div v-if="store.userError" class="text-red-500">
            Error fetching user data: {{ store.userError.message }}
          </div>
          <div v-else-if="store.user != null" class="bg-gray-800 p-4 rounded-lg">
            <p><strong>Username:</strong> {{ store.user.username }}</p>
            <p><strong>Level:</strong> {{ store.user.level }}</p>
            <p><strong>Profile URL:</strong> <a :href="store.user.profileUrl" class="text-blue-400">{{ store.user.profileUrl }}</a></p>
            
            <button type="submit" @click.prevent="() => clearUser()">Clear User Data</button>
          </div>
        </div>
        <div v-else>
          Please provide a valid API token for fetching data.
          <form>
            <label for="apiToken">API Token:</label>
            <input type="text" id="apiToken" v-model="apiToken" />
            <button type="submit" @click.prevent="() => store.getUser(apiToken)">Fetch User Data</button>
          </form>
        </div>
      </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@stores/wanikani/users';
import { STORAGE_KEY_API_TOKEN } from '@helpers/constants';

const store = useUserStore();

let apiToken = ref(localStorage.getItem(STORAGE_KEY_API_TOKEN));

function clearUser() {
  apiToken.value = '';
  store.clearUser();
}
</script>