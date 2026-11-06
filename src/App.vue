<template>
  <div class="bg-gray-950 min-h-lvh flex">
    <RouterView />
  </div>

</template>

<script setup lang="ts">
import { useUserStore } from '@stores/wanikani/users';
import { STORAGE_KEY_API_TOKEN } from '@helpers/constants';

const userStore = useUserStore();

let apiToken = localStorage.getItem(STORAGE_KEY_API_TOKEN);

if (apiToken)
{
  userStore.getUser();
}

</script>