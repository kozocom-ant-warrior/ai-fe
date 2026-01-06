'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import amplifyConfig from '../../configs/amplify';
import type { UserInfo, AuthContextType } from '../types/auth.types';

// Configure Amplify
Amplify.configure(amplifyConfig);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (currentUser && session.tokens) {
          const userInfo: UserInfo = {
            email: currentUser.signInDetails?.loginId || currentUser.username || '',
            username: currentUser.username,
          };
          
          setUser(userInfo);
          setAccessToken(session.tokens.accessToken?.toString() || null);
        }
      } catch (err) {
        // User not logged in or session expired
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call signIn
      const signInResult = await signIn({ username: email, password });
      
      // Check if there is a challenge
      if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // There is NEW_PASSWORD_REQUIRED challenge
        // Set flag to show new password form
        setRequiresNewPassword(true);
        setIsLoading(false);
        return; // Don't throw error, let UI show form
      }
      
      // If login successful (isSignedIn = true)
      if (signInResult.isSignedIn) {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (session.tokens) {
          const userInfo: UserInfo = {
            email: currentUser.signInDetails?.loginId || email,
            username: currentUser.username,
          };
          
          setUser(userInfo);
          setAccessToken(session.tokens.accessToken?.toString() || null);
          router.push('/home');
          return;
        }
      }
      
      // After signIn, always try to get session and user
      // Because even with challenge, there might already be a session token
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (session.tokens) {
          // Has session token, consider login successful
          const userInfo: UserInfo = {
            email: currentUser.signInDetails?.loginId || email,
            username: currentUser.username,
          };
          
          setUser(userInfo);
          setAccessToken(session.tokens.accessToken?.toString() || null);
          router.push('/home');
          return;
        }
      } catch (sessionErr) {
        // Could not get session
        console.log('Could not get session after signIn:', sessionErr);
      }
      
      // If could not get session, throw error
      throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
    } catch (err: any) {
      // Always try to get session when there is an error
      // Because even with NEW_PASSWORD_REQUIRED challenge, there might be a session token
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (session.tokens) {
          // Has session token, consider login successful
          const userInfo: UserInfo = {
            email: currentUser.signInDetails?.loginId || email,
            username: currentUser.username,
          };
          
          setUser(userInfo);
          setAccessToken(session.tokens.accessToken?.toString() || null);
          router.push('/home');
          return;
        }
        
        // If there is user but no token, still try to allow login
        if (currentUser) {
          const userInfo: UserInfo = {
            email: currentUser.signInDetails?.loginId || email,
            username: currentUser.username,
          };
          
          setUser(userInfo);
          // Try to get token again after a short time
          setTimeout(async () => {
            try {
              const retrySession = await fetchAuthSession();
              if (retrySession.tokens) {
                setAccessToken(retrySession.tokens.accessToken?.toString() || null);
              }
            } catch (retryErr) {
              // Ignore
            }
          }, 500);
          
          router.push('/home');
          return;
        }
      } catch (sessionErr) {
        // Could not get session or user
        console.log('Could not get session/user after error:', sessionErr);
      }
      
      // Check if it is NEW_PASSWORD_REQUIRED challenge
      const errorMessage = err.message || '';
      const errorString = JSON.stringify(err).toLowerCase();
      
      if (errorMessage.includes('NEW_PASSWORD_REQUIRED') || 
          errorString.includes('new_password_required') ||
          errorString.includes('challengename') ||
          errorString.includes('challenge')) {
        // There is NEW_PASSWORD_REQUIRED challenge
        setRequiresNewPassword(true);
        setIsLoading(false);
        return; // Don't throw error, let UI show form
      }
      
      const finalErrorMessage = errorMessage || 'Có lỗi xảy ra khi đăng nhập';
      setError(new Error(finalErrorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Clear user info and token
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
      
      // Redirect to login
      router.push('/');
    }
  }, [router]);

  const confirmNewPassword = useCallback(async (newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call confirmSignIn with new password
      // In Amplify v6, challengeResponse is an object with NEW_PASSWORD
      const result = await confirmSignIn({ 
        challengeResponse: newPassword 
      });
      
      // Check result
      if (result.isSignedIn) {
        // Confirmed successfully, get user info and token
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        const userInfo: UserInfo = {
          email: currentUser.signInDetails?.loginId || currentUser.username || '',
          username: currentUser.username,
        };
        
        setUser(userInfo);
        setAccessToken(session.tokens?.accessToken?.toString() || null);
        setRequiresNewPassword(false);
        
        // Redirect to home
        router.push('/home');
      } else if (result.nextStep) {
        // There might still be other challenges
        throw new Error('Vui lòng hoàn tất các bước xác thực');
      } else {
        throw new Error('Xác nhận mật khẩu mới thất bại');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi xác nhận mật khẩu mới';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    error,
    requiresNewPassword,
    login,
    confirmNewPassword,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
