import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyApOKS1h4x6gizXvThGBMCdDatTCEJx7IY",
    authDomain: "ecommerce-notifications-f3540.firebaseapp.com",
    projectId: "ecommerce-notifications-f3540",
    storageBucket: "ecommerce-notifications-f3540.firebasestorage.app",
    messagingSenderId: "133478672619",
    appId: "1:133478672619:web:817782f938b9637f2736ae"
};

export const app = initializeApp(firebaseConfig);