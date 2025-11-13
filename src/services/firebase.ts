import { initializeApp } from 'firebase/app';
import { getToken, onMessage, getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyD_your_firebase_api_key",
  authDomain: "smartsales-backend-21.firebaseapp.com",
  projectId: "smartsales-backend-21",
  storageBucket: "smartsales-backend-21.appspot.com",
  messagingSenderId: "891739940726",
  appId: "1:891739940726:web:your_app_id"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// VAPID Key del backend
const VAPID_KEY = 'BAy2aACkD_nBjgeWUFvPXxjwBBhVPEXhUVZD7Ldsu9IwlY7sSvgVJ5DPLop82OTWAoG0Qb4Wyr6aaJ8kJiAlEJw';

export { getToken, messaging, onMessage, VAPID_KEY };