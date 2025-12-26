'use client';

import { useAuth } from "react-oidc-context";

export default function Login() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "40d5q9prdkl811tenqkj1b9uvs";
    const logoutUri = typeof window !== 'undefined' ? window.location.origin : "https://d84l1y8p4kdic.cloudfront.net";
    const cognitoDomain = "https://<user pool domain>";
    if (typeof window !== 'undefined') {
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    }
  };

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-bold mb-2">Lỗi xác thực</h2>
            <p>{auth.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Đăng nhập thành công</h1>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Email:</div>
              <div className="text-gray-900 break-all">{auth.user?.profile.email}</div>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">ID Token:</div>
              <pre className="text-xs text-gray-600 break-all overflow-auto max-h-32">
                {auth.user?.id_token}
              </pre>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Access Token:</div>
              <pre className="text-xs text-gray-600 break-all overflow-auto max-h-32">
                {auth.user?.access_token}
              </pre>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Refresh Token:</div>
              <pre className="text-xs text-gray-600 break-all overflow-auto max-h-32">
                {auth.user?.refresh_token}
              </pre>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => auth.removeUser()}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            >
              Đăng xuất
            </button>
            <button
              onClick={() => signOutRedirect()}
              className="flex-1 rounded-lg bg-gray-600 px-4 py-3 font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
            >
              Đăng xuất (Redirect)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Đăng nhập</h1>
          <p className="mt-2 text-gray-600">Chào mừng trở lại</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => auth.signinRedirect()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
          >
            Đăng nhập với Cognito
          </button>
          <button
            onClick={() => signOutRedirect()}
            className="w-full rounded-lg bg-gray-600 px-4 py-3 font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
