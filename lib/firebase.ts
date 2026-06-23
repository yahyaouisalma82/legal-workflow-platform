// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAUAH1Z5mEqX2G0_ZxCdBp_qph7E8Owwc0",
    authDomain: "legal-workflow-platform.firebaseapp.com",
    projectId: "legal-workflow-platform",
    storageBucket: "legal-workflow-platform.firebasestorage.app",
    messagingSenderId: "452509928572",
    appId: "1:452509928572:web:50cf6fcd056bf622120df9",
    measurementId: "G-YZM47HRTQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
