<template>
    <div class="flex flex-col">
        <NavBar class="py-1 px-3 sticky w-dvw left-0 top-0 bg-gray-800"></NavBar>
        <div class="bg-gray-700 m-9 rounded-xl border-gray-900 flex">
            <div>
                <Lessons :lessons="summaryStore.lessons"></Lessons>
                <Reviews :reviews="summaryStore.reviews"></Reviews>
            </div>
            <ReviewForecast></ReviewForecast>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSummaryStore } from '@stores/wanikani/summary';
import Lessons from '@/components/Lessons.vue';
import NavBar from '@/components/NavBar.vue';
import ReviewForecast from '@/components/ReviewForecast.vue';
import Reviews from '@/components/Reviews.vue';

const summaryStore = useSummaryStore();
summaryStore.getSummary();

</script>