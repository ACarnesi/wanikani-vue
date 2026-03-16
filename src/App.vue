<script setup lang="ts">
import Lessons from './components/Lessons.vue';
import NavBar from './components/NavBar.vue';
import ReviewForecast from './components/ReviewForecast.vue';
import Reviews from './components/Reviews.vue';

</script>

<template>
  <NavBar class="py-1 px-3 sticky w-full left-0 top-0 bg-gray-800"></NavBar>
  <div class="bg-gray-700 m-9 rounded-xl border-gray-900 flex">
    <Lessons></Lessons>
    <Reviews></Reviews>
    <ReviewForecast></ReviewForecast>
  </div>
</template>