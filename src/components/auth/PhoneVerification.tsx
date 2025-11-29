import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerificationComplete: () => void;
  onBack: () => void;
  isNewUser?: boolean;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phoneNumber,
  onVerificationComplete,
  onBack,
  isNewUser = false
}) => {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTime, setResendTime] = useState(30);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const navigate = useNavigate();

  // Start the countdown for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTime > 0) {
      timer = setTimeout(() => setResendTime(resendTime - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTime]);

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Auto-submit when all digits are entered
    if (index === 5 && value) {
      handleVerify();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 5) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/phone/verify-code/', {
        phone_number: phoneNumber,
        verification_code: verificationCode,
      });

      if (response.data.success) {
        setVerificationSuccess(true);
        // Wait for the success animation to complete
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      } else {
        setError(response.data.message || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTime > 0) return;
    
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/phone/start-verification/', {
        phone_number: phoneNumber,
      });
      setResendTime(30);
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mb-6"
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Verified Successfully!</h2>
        <p className="text-gray-600 mb-8">
          Your phone number has been verified successfully.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </button>
        
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Verify Your Phone</h2>
        <p className="text-gray-600 text-center mb-6">
          We've sent a verification code to <span className="font-medium">{phoneNumber}</span>
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex justify-between space-x-2 mb-8">
          {[0, 1, 2, 3, 4].map((index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[index]}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-16 text-2xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          ))}
        </div>
        
        <button
          onClick={handleVerify}
          disabled={isLoading || code.some(digit => !digit)}
          className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            (isLoading || code.some(digit => !digit)) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin mr-2 h-5 w-5" />
              Verifying...
            </div>
          ) : (
            'Verify Code'
          )}
        </button>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Didn't receive a code?{' '}
            <button
              onClick={handleResendCode}
              disabled={resendTime > 0 || isLoading}
              className={`text-blue-600 font-medium hover:text-blue-700 focus:outline-none ${
                resendTime > 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {resendTime > 0 ? `Resend in ${resendTime}s` : 'Resend Code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification;
