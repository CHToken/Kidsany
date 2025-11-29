import crypto from 'crypto';

export const generateOTP = (): string => {
  // Generate a 6-digit OTP
  return crypto.randomInt(100000, 999999).toString();
};

export const getOTPExpiry = (): Date => {
  // OTP expires in 10 minutes
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
};

export const verifyOTP = (
  inputOTP: string,
  storedOTP: string,
  expiryDate: Date
): { isValid: boolean; message?: string } => {
  if (!storedOTP) {
    return {
      isValid: false,
      message: 'No OTP found. Please request a new OTP.',
    };
  }

  if (new Date() > expiryDate) {
    return {
      isValid: false,
      message: 'OTP has expired. Please request a new OTP.',
    };
  }

  if (inputOTP !== storedOTP) {
    return {
      isValid: false,
      message: 'Invalid OTP. Please try again.',
    };
  }

  return { isValid: true };
};
