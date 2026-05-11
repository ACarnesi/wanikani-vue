<template>
    <div class="m-6 p-6 border-emerald-600 border-2 rounded-xl w-100 h-75">
        <div>
            <span class="text-2xl">Review Forecast</span>
            <Switch></Switch>
        </div>
        <div>
            <ul>
                <li v-for="value in sortedForecast">
                    {{ value[0]?.data.availableAt?.toLocaleString('en-US', {hour: 'numeric', hour12: true}) }}: {{ value?.length }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSummaryStore } from '@stores/wanikani/summary';
import Switch from './Switch.vue';

const summaryStore = useSummaryStore();

let sortedForecast = computed(() => {
    return Object.values(summaryStore.dayForecast).sort((a, b) => {
        let availableAtA = a[0]?.data.availableAt?.getTime() ?? 0;
        let availableAtB = b[0]?.data.availableAt?.getTime() ?? 0;

        return availableAtA - availableAtB;
    });
});
</script>