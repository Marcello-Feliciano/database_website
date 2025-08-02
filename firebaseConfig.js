// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpFQYyFyMQWUHjNuIwMyb8UrT7l92ASao",
  authDomain: "gmbcreviews.firebaseapp.com",
  projectId: "gmbcreviews",
  storageBucket: "gmbcreviews.firebasestorage.app",
  messagingSenderId: "156411101412",
  appId: "1:156411101412:web:dfea6aa2c4b3518a042cf1",
  measurementId: "G-DH9W04ZEWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);