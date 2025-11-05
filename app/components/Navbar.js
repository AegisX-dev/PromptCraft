'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useQuota } from '../context/QuotaContext';

export default function Navbar() {
  const { data: session } = useSession();
  const { basicQuota, proQuota } = useQuota();

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
              PromptCraft
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {session ? (
              // Logged In State
              <>
                <div className="text-sm text-gray-300">
                  <span className="font-semibold">{session.user.name}</span>
                </div>
                <div className="text-xs text-gray-400 border-l border-gray-700 pl-4">
                  <span className="font-mono">Basic: {basicQuota} | Pro: {proQuota}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              // Logged Out State
              <>
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
