import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut, type Profile } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User;
  profile: Profile;
  onSignOut: () => void;
}

export function DashboardPage({ user, profile, onSignOut }: Props) {
  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-bold">H</span>
          </div>
          <CardTitle className="text-2xl">Heimdall</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Google Account</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Profile</p>
                <p className="text-xs text-muted-foreground">{profile.full_name} · {profile.phone_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Telegram</p>
                <p className="text-xs text-muted-foreground">
                  {profile.telegram_username ? `@${profile.telegram_username}` : `ID: ${profile.telegram_user_id}`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🎉 You're all set! Open Telegram and message our bot to use Heimdall.
            </p>
            {profile.telegram_username && (
              <a
                href={`https://t.me/${profile.telegram_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline mt-2 block"
              >
                Open in Telegram
              </a>
            )}
          </div>

          <Button variant="outline" onClick={handleSignOut} className="w-full">
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
