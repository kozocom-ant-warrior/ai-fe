// Auth related types

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    user?: {
      email: string;
      username: string;
      [key: string]: any;
    };
  };
  message?: string;
}

export interface UserInfo {
  email: string;
  username: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  requiresNewPassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  confirmNewPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

