import { createMemoryHistory, createRouter } from 'vue-router';
import ConnectionPage from './pages/ConnectionPage.vue';
import SummaryPage from './pages/SummaryPage.vue';

const routes = [
    { path: '/home', component: SummaryPage },
    { path: '/connection', component: ConnectionPage },
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

export default router;