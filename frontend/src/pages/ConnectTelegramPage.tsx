import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { startTelegramLinking, signOut, type Profile } from '@/lib/auth';
import type { User, Session } from '@supabase/supabase-js';

interface Props {
  user: User;
  session: Session;
  profile: Profile;
  onLinked: () => void;
}

export function ConnectTelegramPage({ user, session, profile, onLinked }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkOpened, setLinkOpened] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const deepLink = await startTelegramLinking(session);
      setLinkOpened(true);
      // Open Telegram deep link — this will open Telegram app/web
      window.open(deepLink, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate Telegram link');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = () => {
    // Trigger a full re-check of auth state
    onLinked();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-bold">H</span>
          </div>
          <CardTitle className="text-2xl">Connect Telegram</CardTitle>
          <CardDescription>
            Almost there! Connect your Telegram account to start using Heimdall.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <div><span className="text-muted-foreground">Name:</span> {profile.full_name}</div>
            <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
            <div><span className="text-muted-foreground">Phone:</span> {profile.phone_number}</div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleConnect}
            disabled={loading}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <TelegramIcon />
            )}
            {loading ? 'Generating link...' : 'Connect Telegram'}
          </Button>

          {linkOpened && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Telegram should have opened. Send the <code>/start</code> message to the bot.
                Once connected, click below to refresh.
              </p>
              <Button variant="outline" onClick={handleCheckStatus} className="w-full">
                I've connected — Check status
              </Button>
            </div>
          )}

          <div className="pt-2 border-t">
            <Button variant="ghost" onClick={handleSignOut} className="w-full text-muted-foreground text-sm">
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
    </svg>
  );
}
