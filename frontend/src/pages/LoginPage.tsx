import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithGoogle } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import { HeimdallLogo } from '@/components/HeimdallLogo';

interface LoginPageProps {
  onNavigate?: (path: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FFFFFF] text-[#0F172A] relative">
      
      {/* Top back button */}
      <button
        onClick={() => handleNavigate('/')}
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </button>

      <Card className="w-full max-w-md bg-white border-slate-200/80 shadow-xl rounded-3xl overflow-hidden p-2">
        <CardHeader className="text-center space-y-3 pt-8 pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
            <HeimdallLogo size={24} color="#FFFFFF" />
          </div>
          <div>
            <CardTitle className="font-serif text-3xl text-slate-900 font-normal">
              Welcome to Heimdall
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm mt-1 font-light">
              Your personal assistant &amp; nutrition coach through messages
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 px-6 pb-8">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200/60 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-full bg-[#0F172A] hover:bg-black text-white py-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            size="lg"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <GoogleIcon />
            )}
            <span className="font-medium text-sm">
              {loading ? 'Connecting...' : 'Continue with Google'}
            </span>
          </Button>

          <div className="text-center space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              By continuing, you agree to Heimdall&apos;s{' '}
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/terms');
                }}
                className="text-slate-600 hover:text-slate-900 underline underline-offset-2"
              >
                Terms &amp; Conditions
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/privacy');
                }}
                className="text-slate-600 hover:text-slate-900 underline underline-offset-2"
              >
                Privacy Policy
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
