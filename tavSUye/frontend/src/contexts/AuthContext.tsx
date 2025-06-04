import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../services/api';
import { setUser, setError, setTwoFactorRequired } from '../store/slices/authSlice';
import type { User, AuthResponse } from '../types';

// Context setup
interface AuthContextProps {
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  verify2FA: (email: string, code: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  checkResetCode: (email: string, code: string) => Promise<{ valid: boolean; message?: string }>;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial auth check
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Clear any demo mode flags first
      localStorage.removeItem('demo_user_mode');
      
      const localUser = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const sessionTimestamp = localStorage.getItem('sessionTimestamp');
      
      // Check if session is still valid (24 hours)
      const isSessionValid = sessionTimestamp && 
        (Date.now() - parseInt(sessionTimestamp)) < (24 * 60 * 60 * 1000);
      
      // Only restore session if we have user data, auth flag, and valid session
      if (localUser && isAuthenticated && isSessionValid) {
        try {
          const parsedUser = JSON.parse(localUser);
          
          // Validate that the parsed user has required fields
          if (parsedUser.userId !== undefined && parsedUser.role) {
            // Try to validate session with backend by making a simple authenticated request
            try {
              // Test if our session is still valid with backend
              // Use a simpler endpoint that's less likely to fail
              const profileData = await authApi.getProfile();
              
              // If we get profile data, update the user with fresh data
              if (profileData) {
                const updatedUser = {
                  ...parsedUser,
                  name: profileData.name || parsedUser.name,
                  surname: profileData.surname || parsedUser.surname,
                  email: profileData.email || parsedUser.email,
                  username: profileData.username || parsedUser.username,
                  is2FAEnabled: profileData.is_2fa_enabled || parsedUser.is2FAEnabled
                };
                setUserState(updatedUser);
                dispatch(setUser(updatedUser));
                localStorage.setItem('user', JSON.stringify(updatedUser));
              } else {
                // Profile endpoint worked but returned no data, use stored user
                setUserState(parsedUser);
                dispatch(setUser(parsedUser));
              }
              
              setIsAuth(true);
            } catch (sessionError) {
              if (localUser) {
                try {
                  const parsedUser = JSON.parse(localUser);
                  if (parsedUser && parsedUser.userId) {
                    setUserState(parsedUser);
                    dispatch(setUser(parsedUser));
                    setIsAuth(true);
                  } else {
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAuthenticated');
                  }
                } catch (parseError) {
                  localStorage.removeItem('user');
                  localStorage.removeItem('isAuthenticated');
                }
              }
            }
          } else {
            console.log('Invalid user data in localStorage, clearing session');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('sessionTimestamp');
            setIsAuth(false);
            setUserState(null);
          }
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('sessionTimestamp');
          setIsAuth(false);
          setUserState(null);
        }
      } else {
        // Clear any stale data and ensure we're not authenticated
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('sessionTimestamp');
        setUserState(null);
        setIsAuth(false);
        console.log('No valid session found, user must login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    const checkAuthFlag = () => {
      const authFlag = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuth(authFlag);
    };
    
    checkAuthFlag();
    
    // Listen for storage events to handle auth changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated') {
        checkAuthFlag();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(usernameOrEmail, password);
      
      // Handle HTTP 202 - 2FA required
      if (response.requires2FA) {
        dispatch(setTwoFactorRequired(true));
        
        // Store email for 2FA verification
        localStorage.setItem('2fa_email', usernameOrEmail.includes('@') ? usernameOrEmail : usernameOrEmail);
        
        // Reset loading state since we're redirecting to 2FA
        setIsLoading(false);
        navigate('/verify-2fa');
        return;
      }
      
      // Handle HTTP 200 - Successful login
      // Since backend doesn't return user object, create one from available data
      if (!response || !response.role) {
        throw new Error('No role data returned from login');
      }
      
      // Create a minimal user object from the available data
      // The backend stores user info in session, so we create a basic user object
      const userData: User = {
        userId: 0, // Will be populated from session/profile endpoint if needed
        username: usernameOrEmail.includes('@') ? '' : usernameOrEmail, // Use username if not email
        email: usernameOrEmail.includes('@') ? usernameOrEmail : '', // Use email if provided
        name: '', // Will be populated later if needed
        surname: '', // Will be populated later if needed
        role: response.role,
        accountStatus: 'ACTIVE' as const,
        is2FAEnabled: false,
        emailVerified: true
      };
      
      setUserState(userData);
      dispatch(setUser(userData));
      setIsAuth(true);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store session timestamp for session validation
      localStorage.setItem('sessionTimestamp', Date.now().toString());
      
      console.log('User data set, redirecting based on role...');
      
      // Redirect based on role as per specifications
      if (userData.role === 'ADMIN') {
        navigate('/admin', { replace: true }); // Admin Main Page
      } else if (userData.role === 'USER') {
        navigate('/', { replace: true }); // Main Page
      } else {
        // Fallback for unknown roles
        navigate('/', { replace: true });
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to login. Please check your credentials.';
      
      if (error.response?.status === 401) {
        const responseMessage = error.response?.data?.message || error.response?.data;
        if (typeof responseMessage === 'string' && responseMessage.includes('Invalid credentials')) {
          errorMessage = 'Invalid username/email or password. Please check your credentials and try again.';
        } else {
          errorMessage = 'Invalid username/email or password.';
        }
      } else if (error.response?.status === 403) {
        const responseMessage = error.response?.data?.message || error.response?.data;
        if (typeof responseMessage === 'string') {
          if (responseMessage.includes('banned')) {
            errorMessage = 'Your account has been banned. Please contact support for assistance.';
          } else if (responseMessage.includes('suspended') || responseMessage.includes('verify your email')) {
            errorMessage = 'Your account is suspended. Please verify your email to reactivate your account.';
          } else {
            errorMessage = responseMessage;
          }
        } else {
          errorMessage = 'Your account access is restricted. Please contact support.';
        }
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your input and try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support if the problem persists.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      dispatch(setError(errorMessage));
      
      // Update auth state
      setIsAuth(false);
      
      // Clear any partial auth state
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('2fa_email');
      
      throw error; // Re-throw to allow the Login component to handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Always clear frontend state first
      setUserState(null);
      setIsAuth(false);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('sessionTimestamp');
      localStorage.removeItem('demo_user_mode');
      
      // Try to call logout endpoint, but don't fail if it returns 403
      try {
        await authApi.logout();
      } catch (logoutError: any) {
        // If logout fails with 403, it means we're already logged out on the backend
        // or the session is invalid, which is fine for our purposes
        if (logoutError.response?.status === 403) {
          // Session already invalid, continue with frontend logout
        } else {
          console.error('Backend logout failed:', logoutError);
        }
      }
      
      // Always redirect to login regardless of backend response
      navigate('/login'); // As per specifications: redirect to Login Page after logout
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if everything fails, ensure frontend is cleared
      setUserState(null);
      setIsAuth(false);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('sessionTimestamp');
      localStorage.removeItem('demo_user_mode');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      await authApi.register(userData);
      
      // As per specifications: redirect to Email Verification Page after successful registration
      navigate(`/verify-email?email=${encodeURIComponent(userData.email)}`);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.status === 403) {
        const responseMessage = error.response?.data?.message || error.response?.data;
        if (typeof responseMessage === 'string' && responseMessage.includes('Sabancı University')) {
          errorMessage = 'Only Sabancı University email addresses are allowed for registration.';
        } else {
          errorMessage = 'Registration not allowed. Please check your email domain.';
        }
      } else if (error.response?.status === 409) {
        const responseMessage = error.response?.data?.message || error.response?.data;
        if (typeof responseMessage === 'string') {
          if (responseMessage.includes('Email is already registered')) {
            errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
          } else if (responseMessage.includes('Username is already taken')) {
            errorMessage = 'This username is already taken. Please choose a different username.';
          } else if (responseMessage.includes('User already exists')) {
            errorMessage = 'An account with this email already exists. Please check your email for verification instructions.';
          } else {
            errorMessage = responseMessage;
          }
        } else {
          errorMessage = 'An account with this information already exists.';
        }
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid registration data. Please check your input and try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during registration. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      dispatch(setError(errorMessage));
      throw error; // Re-throw to allow the Register component to handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verify2FA(email, code);
      
      // Since backend doesn't return user object, create one from available data
      if (!response || !response.role) {
        throw new Error('No role data returned from 2FA verification');
      }
      
      // Create a minimal user object from the available data
      const userData: User = {
        userId: 0, // Will be populated from session/profile endpoint if needed
        username: '', // Will be populated later if needed
        email: email,
        name: '', // Will be populated later if needed
        surname: '', // Will be populated later if needed
        role: response.role,
        accountStatus: 'ACTIVE' as const,
        is2FAEnabled: true, // Since they just completed 2FA
        emailVerified: true
      };
      
      // Store user information
      setUserState(userData);
      dispatch(setUser(userData));
      setIsAuth(true);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store session timestamp for session validation
      localStorage.setItem('sessionTimestamp', Date.now().toString());
      
      // Clear 2FA email from storage
      localStorage.removeItem('2fa_email');
      
      // Redirect based on role as per specifications
      if (userData.role === 'ADMIN') {
        navigate('/admin'); // Admin Main Page
      } else if (userData.role === 'USER') {
        navigate('/'); // Main Page
      } else {
        // Fallback for unknown roles
        navigate('/');
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      
      let errorMessage = 'Failed to verify 2FA code.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Invalid 2FA code. Please check the code and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid or expired 2FA code. Please request a new code.';
      } else if (error.response?.status === 404) {
        errorMessage = 'No 2FA request found. Please try logging in again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during 2FA verification. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      await authApi.verifyEmail(email, code);
      
      // As per specifications: redirect to Login Page after successful email verification
      navigate('/login');
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      let errorMessage = 'Failed to verify email.';
      
      if (error.response?.status === 400) {
        const responseMessage = error.response?.data?.message || error.response?.data;
        if (typeof responseMessage === 'string') {
          if (responseMessage.includes('expired')) {
            errorMessage = 'The verification code has expired. Please register again to get a new code.';
          } else if (responseMessage.includes('Invalid')) {
            errorMessage = 'Invalid verification code. Please check the code and try again.';
          } else {
            errorMessage = responseMessage;
          }
        } else {
          errorMessage = 'Invalid verification code. Please check the code and try again.';
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'No verification request found. Please register again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during email verification. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      dispatch(setError(errorMessage));
      throw error; // Re-throw to allow the VerifyEmail component to handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.forgotPassword(email);
      setIsLoading(false);
      
      // As per specifications: redirect to Reset Password Page for both HTTP 200 and 
      // HTTP 400 "A password reset code has already been sent" responses
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      return result;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      // Handle HTTP 400 Bad Request: "A password reset code has already been sent"
      if (error.response?.status === 400 && 
          error.response?.data?.includes && 
          error.response.data.includes("password reset code has already been sent")) {
        setIsLoading(false);
        // Still redirect to reset password page as per specifications
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        return { codeAlreadySent: true, message: error.response.data };
      }
      
      let errorMessage = 'Failed to process forgot password request.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      dispatch(setError(errorMessage));
      setIsLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      
      // As per specifications: redirect to Login Page after successful password reset
      navigate('/login');
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Failed to reset password.';
      
      if (error.response?.status === 400) {
        const responseMessage = error.response?.data?.message || error.response?.data;
        if (typeof responseMessage === 'string') {
          if (responseMessage.includes('expired')) {
            errorMessage = 'The reset code has expired. Please request a new password reset.';
          } else if (responseMessage.includes('Invalid')) {
            errorMessage = 'Invalid reset code. Please check the code and try again.';
          } else {
            errorMessage = responseMessage;
          }
        } else {
          errorMessage = 'Invalid reset code or password. Please check your input and try again.';
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'No password reset request found. Please request a new password reset.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during password reset. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      dispatch(setError(errorMessage));
      throw error; // Re-throw to allow the ResetPassword component to handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const checkResetCode = async (email: string, code: string) => {
    try {
      return await authApi.checkResetCode(email, code);
    } catch (error: any) {
      console.error('Check reset code error:', error);
      return { valid: false, message: error.message || 'Failed to check reset code' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,
        isAuthenticated: isAuth,
        login,
        logout,
        register,
        verify2FA,
        verifyEmail,
        forgotPassword,
        resetPassword,
        checkResetCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 