import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import createWaniKaniFetch from './helpers/createWaniKaniFetch';
import { useWaniKaniFetchKey } from './@types/injectionKeys';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCm295gWmYUozJ5fzwfRK7sxN-tpT-JAs8",
    authDomain: "wanikani-vue.firebaseapp.com",
    projectId: "wanikani-vue",
    storageBucket: "wanikani-vue.firebasestorage.app",
    messagingSenderId: "638775966660",
    appId: "1:638775966660:web:0c3a8d44b2ce8778f50291",
    measurementId: "G-Y1HLTJKXEV"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const useWaniKaniFetch = createWaniKaniFetch(analytics);

const pinia = createPinia()
const app = createApp(App)

app.provide(useWaniKaniFetchKey, useWaniKaniFetch);

app.use(pinia)
app.mount('#app')