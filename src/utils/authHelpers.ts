// Development helpers to avoid rate limiting during testing

// 1. Email randomization for testing
export const generateTestEmail = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test+${timestamp}+${random}@example.com`;
};

type SignUpFn = (
  email: string,
  password: string,
  userData: Record<string, unknown>,
) => Promise<{ error: Error | null }>;

// 2. Rate limit detection and automatic retry with backoff
export const signUpWithRetry = async (
  signUpFunction: SignUpFn,
  email: string,
  password: string,
  userData: Record<string, unknown>,
  maxRetries = 3,
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await signUpFunction(email, password, userData);
      
      if (!result.error) {
        return result; // Success
      }
      
      // If it's a rate limit error and we have retries left
      if (result.error.message.toLowerCase().includes('rate limit') && attempt < maxRetries) {
        const backoffTime = attempt * 2000; // 2s, 4s, 6s
        console.log(`Rate limit hit, waiting ${backoffTime/1000}s before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      
      return result; // Return error if not rate limit or no retries left
      
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
};

// 3. Development mode detection
export const isDevelopment = import.meta.env.DEV;

// 4. Mock signup for development testing
export const createMockSignup = () => {
  if (isDevelopment) {
    return {
      email: generateTestEmail(),
      password: 'testpass123',
      name: `Test User ${Date.now()}`,
      mobileNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `${Math.floor(Math.random() * 999) + 1} Test St, Test City`
    };
  }
  return null;
};