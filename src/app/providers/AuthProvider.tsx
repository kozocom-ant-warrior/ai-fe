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

  // Kiểm tra xem user đã đăng nhập chưa
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
        // User chưa đăng nhập hoặc session đã hết hạn
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
      
      // Gọi signIn
      const signInResult = await signIn({ username: email, password });
      
      // Kiểm tra nếu có challenge
      if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Có challenge NEW_PASSWORD_REQUIRED
        // Set flag để hiển thị form nhập mật khẩu mới
        setRequiresNewPassword(true);
        setIsLoading(false);
        return; // Không throw error, để UI hiển thị form
      }
      
      // Nếu đăng nhập thành công (isSignedIn = true)
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
      
      // Sau khi signIn, luôn thử lấy session và user
      // Vì ngay cả khi có challenge, vẫn có thể đã có session token
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (session.tokens) {
          // Có session token, coi như đăng nhập thành công
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
        // Không lấy được session
        console.log('Could not get session after signIn:', sessionErr);
      }
      
      // Nếu không lấy được session, throw error
      throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
    } catch (err: any) {
      // Luôn thử lấy session khi có lỗi
      // Vì ngay cả khi có challenge NEW_PASSWORD_REQUIRED, vẫn có thể có session token
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (session.tokens) {
          // Có session token, coi như đăng nhập thành công
          const userInfo: UserInfo = {
            email: currentUser.signInDetails?.loginId || email,
            username: currentUser.username,
          };
          
          setUser(userInfo);
          setAccessToken(session.tokens.accessToken?.toString() || null);
          router.push('/home');
          return;
        }
        
        // Nếu có user nhưng không có token, vẫn thử cho phép đăng nhập
        if (currentUser) {
          const userInfo: UserInfo = {
            email: currentUser.signInDetails?.loginId || email,
            username: currentUser.username,
          };
          
          setUser(userInfo);
          // Thử lấy token một lần nữa sau một chút thời gian
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
        // Không lấy được session hoặc user
        console.log('Could not get session/user after error:', sessionErr);
      }
      
      // Kiểm tra xem có phải là challenge NEW_PASSWORD_REQUIRED không
      const errorMessage = err.message || '';
      const errorString = JSON.stringify(err).toLowerCase();
      
      if (errorMessage.includes('NEW_PASSWORD_REQUIRED') || 
          errorString.includes('new_password_required') ||
          errorString.includes('challengename') ||
          errorString.includes('challenge')) {
        // Có challenge NEW_PASSWORD_REQUIRED
        setRequiresNewPassword(true);
        setIsLoading(false);
        return; // Không throw error, để UI hiển thị form
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
      // Xóa user info và token
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
      
      // Gọi confirmSignIn với mật khẩu mới
      // Trong Amplify v6, challengeResponse là object với NEW_PASSWORD
      const result = await confirmSignIn({ 
        challengeResponse: newPassword 
      });
      
      // Kiểm tra kết quả
      if (result.isSignedIn) {
        // Đã xác nhận thành công, lấy thông tin user và token
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
        // Có thể vẫn còn challenge khác
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
