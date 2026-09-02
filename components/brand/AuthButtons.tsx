// 2026-09-03: auth lives on the CENTRAL platform, not on each satellite.
//
// An ecosystem sweep with Javari Verify found /login and /signup returning 404 on
// every vertical that renders this component. The links were local; the pages are
// on craudiovizai.com, which is where sign-in has always happened — a satellite
// has no auth routes of its own and never had.
//
// Absolute URLs rather than relative, because the destination genuinely is another
// origin. A Next <Link> to an external origin also needs a plain anchor, which is
// why these are <a> and not <Link>.
'use client';

import React from 'react';
import Link from 'next/link';
import { CentralServices } from '@/lib/central-services';

interface AuthButtonsProps {
  isLoggedIn: boolean;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

/**
 * Auth Buttons Component
 * 
 * When logged out:
 * - Log In button
 * - Sign Up button
 * 
 * When logged in:
 * - User name display
 * - Log Out button
 */
export function AuthButtons({ isLoggedIn, userName, userEmail, onLogout }: AuthButtonsProps) {
  const handleLogout = async () => {
    try {
      await CentralServices.Auth.signOut();
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        {/* User Name */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 
                          flex items-center justify-center text-cyan-700 dark:text-cyan-300
                          text-sm font-medium">
            {userName ? userName.charAt(0).toUpperCase() : userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
            {userName || userEmail?.split('@')[0] || 'User'}
          </span>
        </div>
        
        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2
                     text-sm font-medium text-slate-600 dark:text-slate-400
                     hover:text-slate-900 dark:hover:text-slate-100
                     hover:bg-slate-100 dark:hover:bg-slate-800
                     rounded-lg transition-colors"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Log In Button */}
      <a
          href="https://craudiovizai.com/auth/login"
        className="inline-flex items-center justify-center min-h-[44px] px-4 py-2
                   text-sm font-medium text-slate-600 dark:text-slate-400
                   hover:text-slate-900 dark:hover:text-slate-100
                   hover:bg-slate-100 dark:hover:bg-slate-800
                   rounded-lg transition-colors"
      >
        Log In
      </a>
      
      {/* Sign Up Button */}
      <a
          href="https://craudiovizai.com/auth/signup"
        className="inline-flex items-center justify-center min-h-[44px] px-4 py-2
                   text-sm font-medium text-white
                   bg-cyan-600 hover:bg-cyan-700
                   dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-900
                   rounded-lg transition-colors shadow-sm"
      >
        Sign Up
      </a>
    </div>
  );
}

export default AuthButtons;
