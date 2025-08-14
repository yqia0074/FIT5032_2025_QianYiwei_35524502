import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'


const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJa7NkwQ8V_BI8iMBQE7ktl2UUHlugn_8",
  authDomain: "qian-yiwei-s-project.firebaseapp.com",
  projectId: "qian-yiwei-s-project",
  storageBucket: "qian-yiwei-s-project.firebasestorage.app",
  messagingSenderId: "780498273657",
  appId: "1:780498273657:web:575e77972f52c0e6e55ba8"
};

// Initialize Firebase
initializeApp(firebaseConfig);
