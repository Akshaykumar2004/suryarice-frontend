import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult 
} from 'firebase/auth';
import { auth } from '../config/firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/**
 * Initialize reCAPTCHA verifier
 * Call this once when component mounts
 */
export const initializeRecaptcha = (containerId: string = 'recaptcha-container') => {
  // If verifier already exists and is valid, return it
  if (recaptchaVerifier) {
    console.log('Using existing reCAPTCHA verifier');
    return recaptchaVerifier;
  }

  // Check if container exists
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`reCAPTCHA container with id "${containerId}" not found`);
  }

  // Clear any existing reCAPTCHA widget in the container
  container.innerHTML = '';

  try {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible', // Use invisible for better UX
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        // Don't set to null here, let cleanup handle it
      }
    });
    console.log('reCAPTCHA verifier initialized successfully');
  } catch (error) {
    console.error('Failed to initialize reCAPTCHA:', error);
    throw new Error('Failed to initialize reCAPTCHA. Please refresh the page.');
  }
  
  return recaptchaVerifier;
};

/**
 * Send OTP to phone number
 * @param phoneNumber - Phone number with country code (e.g., +919876543210)
 */
export const sendOTP = async (phoneNumber: string): Promise<boolean> => {
  try {
    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+91${phoneNumber.replace(/\D/g, '')}`;

    console.log('Sending OTP to:', formattedPhone);

    // Get or create reCAPTCHA verifier
    const appVerifier = initializeRecaptcha();
    
    // Send verification code
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    
    console.log('OTP sent successfully');
    return true;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    
    // If reCAPTCHA error, clean up and let user try again
    if (error.code === 'auth/invalid-app-credential' || 
        error.message?.includes('reCAPTCHA')) {
      cleanupRecaptcha();
    }
    
    // Handle specific errors
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please try again later');
    } else if (error.code === 'auth/invalid-app-credential') {
      throw new Error('reCAPTCHA verification failed. Please refresh the page and try again.');
    }
    
    throw new Error(error.message || 'Failed to send OTP');
  }
};

/**
 * Verify OTP code
 * @param code - 6-digit OTP code
 * @returns Firebase ID token to send to backend
 */
export const verifyOTP = async (code: string): Promise<string> => {
  try {
    if (!confirmationResult) {
      throw new Error('No confirmation result. Please request OTP first.');
    }

    console.log('Verifying OTP code');
    const result = await confirmationResult.confirm(code);
    const idToken = await result.user.getIdToken();
    
    console.log('OTP verified successfully');
    return idToken;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid OTP code');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('OTP code expired. Please request a new one');
    }
    
    throw new Error(error.message || 'Failed to verify OTP');
  }
};

/**
 * Cleanup reCAPTCHA and confirmation result
 * Call this when component unmounts or on error
 */
export const cleanupRecaptcha = () => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      console.error('Error clearing recaptcha:', e);
    }
    recaptchaVerifier = null;
  }
  confirmationResult = null;
};

/**
 * Reset for new attempt
 */
export const resetAuth = () => {
  cleanupRecaptcha();
  confirmationResult = null;
};
