<template>
    <div class="m-6 p-6 border-emerald-600 border-2 rounded-xl w-100 h-fit">
        <div class="flex justify-between">
            <div class="text-2xl">Review Forecast</div>
            <div class="flex justify-between">  
                <input class="hidden" type="radio" id="css" name="fav_language" value="day" v-model="forecastType">
                <label for="css">Day</label>
                <span class="mx-3">|</span>
                <input class="hidden" type="radio" id="javascript" name="fav_language" value="week" v-model="forecastType">
                <label class="align-bottom" for="javascript">Week</label>
            </div>
        </div>
        <div>
            <table>
                <tbody>
                    <tr>
                        <th class="">Hour</th>
                        <th></th>
                        <th>Reviews</th>
                    </tr>
                    <tr v-for="value in currentForecast">
                        <td class="text-right pr-3"><span class="text-right w-100">{{ value.period }}: </span></td>
                        <td class="pr-2" :style="`width: ${forecastType === 'day' ? 60 : 50}%`">
                            <div class="h-2 bg-emerald-600 rounded-r-xl" :style="`width: ${value.reviews.length / biggestReviewPeriod * 100}%`"></div>
                        </td>
                        <td><span>{{ value?.cumulativeReviews }} +({{ value?.reviews.length }})</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
    input[type="radio"] + label {
        cursor: pointer;
    }
    
    input[type="radio"]:checked + label {
        color: var(--color-emerald-600);
    }
</style>

<script setup lang="ts">
import { ref, computed} from 'vue';
import { useSummaryStore } from '@stores/wanikani/summary';

const forecastType = ref('day');

const summaryStore = useSummaryStore();

let currentForecast = computed(() => {
    return forecastType.value === 'day' ? summaryStore.dayForecast : summaryStore.weekForecast;
});

let biggestReviewPeriod = computed(() => {
    return Math.max(...currentForecast.value.map(x => x.reviews.length));
})
</script>