import { createMemoryHistory, createRouter } from 'vue-router';
import { type RouteLocationNormalized } from 'vue-router';
import ConnectionPage from './pages/ConnectionPage.vue';
import SummaryPage from './pages/SummaryPage.vue';
import LessonsPage from './pages/LessonsPage.vue';

const routes = [
    { path: '', component: ConnectionPage, alias: '/connection' },
    { path: '/home', component: SummaryPage },
    {
        path: '/lessons/',
        component: LessonsPage,
        props: (route: RouteLocationNormalized) => ({
            isLesson: (String(route.query.isLesson).toLowerCase() === 'true'),
            advancedLessonSelection: (String(route.query.advancedLessonSelection).toLowerCase() === 'true')
        })
    },
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

export default router;