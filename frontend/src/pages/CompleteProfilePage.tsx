import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { completeProfile, type Profile } from '@/lib/auth';
import type { User, Session } from '@supabase/supabase-js';

interface Props {
  user: User;
  session: Session;
  onComplete: (profile: Profile) => void;
}

export function CompleteProfilePage({ user, session, onComplete }: Props) {
  const [fullName, setFullName] = useState(user.user_metadata?.['full_name'] as string ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      const profile = await completeProfile(session, fullName.trim(), phoneNumber.trim());
      onComplete(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-bold">H</span>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Signed in as <strong>{user.email}</strong>.
            Please provide your contact details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
                autoComplete="tel"
              />
              <p className="text-xs text-muted-foreground">
                Used for account linking only. We do not send SMS or verify this number.
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />Saving...</>
              ) : 'Save & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
