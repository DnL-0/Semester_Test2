// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyFyitTw288YipaezLZew8gU7G6Ma8Jg8",
  authDomain: "shopez-e7742.firebaseapp.com",
  projectId: "shopez-e7742",
  storageBucket: "shopez-e7742.firebasestorage.app",
  messagingSenderId: "440106505975",
  appId: "1:440106505975:web:6068a92e43a36b30b7a5f2",
  measurementId: "G-7RGHS5E6FN",
  databaseURL: "https://shopez-e7742-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const database = getDatabase(app);

export { auth, database };