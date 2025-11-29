import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize App Check with reCAPTCHA Enterprise
// This is required for Firebase Phone Authentication to work with reCAPTCHA Enterprise
if (typeof window !== 'undefined') {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  
  if (recaptchaSiteKey) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log('✅ App Check initialized with reCAPTCHA Enterprise');
    } catch (error) {
      console.warn('⚠️ App Check initialization failed:', error);
      console.log('Continuing without App Check - phone auth may not work');
    }
  } else {
    console.warn('⚠️ VITE_RECAPTCHA_SITE_KEY not found in environment variables');
  }
}

console.log('✅ Firebase initialized successfully');

export default app;
