import { useCallback } from 'react';
import './index.css';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/pages/LoginPage';
import { CompleteProfilePage } from '@/pages/CompleteProfilePage';
import { ConnectTelegramPage } from '@/pages/ConnectTelegramPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AuthCallback } from '@/pages/AuthCallback';
import type { Profile } from '@/lib/auth';

export function App() {
  const { authState, refresh } = useAuth();

  // Handle /auth/callback route
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  if (authState.state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (authState.state === 'unauthenticated') {
    return <LoginPage />;
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

  // state === 'complete'
  return (
    <DashboardPage
      user={authState.user}
      profile={authState.profile}
      onSignOut={() => void refresh(null, null)}
    />
  );
}

export default App;
