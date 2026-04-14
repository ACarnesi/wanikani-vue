<template> 
  <NavBar class="py-1 px-3 sticky w-full left-0 top-0 bg-gray-800"></NavBar>
  <div class="bg-gray-700 m-9 rounded-xl border-gray-900 flex">
    <Lessons :lessons="summaryStore.lessons"></Lessons>
    <Reviews :reviews="summaryStore.reviews"></Reviews>
    <ReviewForecast></ReviewForecast>
    <Suspense>
      <UserDetails></UserDetails>
    </Suspense>
  </div>
  
</template>

<script setup lang="ts">
import Lessons from './components/Lessons.vue';
import NavBar from './components/NavBar.vue';
import ReviewForecast from './components/ReviewForecast.vue';
import Reviews from './components/Reviews.vue';
import UserDetails from './components/UserDetails.vue';
import { useSummaryStore } from '@stores/wanikani/summary';

const summaryStore = useSummaryStore();
</script>