'use client';

import { useAuth } from '../providers/AuthProvider';

export default function Header() {
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.logout();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Hire Graph</h1>
          <div className="flex items-center gap-4">
            {auth.user?.email && (
              <span className="text-sm text-gray-600">
                {auth.user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

