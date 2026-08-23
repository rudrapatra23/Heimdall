import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/pages/LandingPage';
import { TermsPage } from '@/pages/TermsPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { LoginPage } from '@/pages/LoginPage';
import { CompleteProfilePage } from '@/pages/CompleteProfilePage';
import { ConnectTelegramPage } from '@/pages/ConnectTelegramPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AuthCallback } from '@/pages/AuthCallback';
import type { Profile } from '@/lib/auth';

export function App() {
  const { authState, refresh } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  // Synchronize route with browser history (popstate event for back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 1. Handle /auth/callback route from Google OAuth redirect
  if (currentPath === '/auth/callback') {
    return <AuthCallback />;
  }

  // 2. Handle /terms page
  if (currentPath === '/terms') {
    return <TermsPage onNavigate={navigate} />;
  }

  // 3. Handle /privacy page
  if (currentPath === '/privacy') {
    return <PrivacyPage onNavigate={navigate} />;
  }

  // 4. Handle /dashboard route
  if (currentPath === '/dashboard') {
    if (authState.state === 'loading') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F172A] mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-light">Loading citizen profile...</p>
          </div>
        </div>
      );
    }

    if (authState.state === 'unauthenticated') {
      return <LoginPage onNavigate={navigate} />;
    }

    if (authState.state === 'needs_profile') {
      const handleProfileComplete = (_profile: Profile) => {
        void refresh(authState.user, authState.session);
      };
      return (
        <CompleteProfilePage
          user={authState.user}
          session={authState.session}
          onComplete={handleProfileComplete}
        />
      );
    }

    if (authState.state === 'needs_telegram') {
      const handleLinked = () => {
        void refresh(authState.user, authState.session);
      };
      return (
        <ConnectTelegramPage
          user={authState.user}
          session={authState.session}
          profile={authState.profile}
          onLinked={handleLinked}
        />
      );
    }

    // Complete
    return (
      <DashboardPage
        user={authState.user}
        profile={authState.profile}
        onSignOut={() => void refresh(null, null)}
        onNavigate={navigate}
      />
    );
  }

  // 5. Handle /login route
  if (currentPath === '/login') {
    if (authState.state === 'loading') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F172A] mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-light">Checking authentication...</p>
          </div>
        </div>
      );
    }

    if (authState.state === 'needs_profile') {
      const handleProfileComplete = (_profile: Profile) => {
        void refresh(authState.user, authState.session);
      };
      return (
        <CompleteProfilePage
          user={authState.user}
          session={authState.session}
          onComplete={handleProfileComplete}
        />
      );
    }

    if (authState.state === 'needs_telegram') {
      const handleLinked = () => {
        void refresh(authState.user, authState.session);
      };
      return (
        <ConnectTelegramPage
          user={authState.user}
          session={authState.session}
          profile={authState.profile}
          onLinked={handleLinked}
        />
      );
    }

    if (authState.state === 'complete') {
      return (
        <DashboardPage
          user={authState.user}
          profile={authState.profile}
          onSignOut={() => void refresh(null, null)}
          onNavigate={navigate}
        />
      );
    }

    return <LoginPage onNavigate={navigate} />;
  }

  // 6. Default Route: Landing Page (/)
  return <LandingPage onNavigate={navigate} />;
}

export default App;
