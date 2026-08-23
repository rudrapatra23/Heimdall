import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { signOut, type Profile } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, CheckCircle2, MessageCircle, ExternalLink, User as UserIcon, Phone, Mail, ArrowRight } from 'lucide-react';

interface Props {
  user: User;
  profile: Profile;
  onSignOut: () => void;
  onNavigate?: (path: string) => void;
}

export function DashboardPage({ user, profile, onSignOut, onNavigate }: Props) {
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0F172A]">
      <Navbar currentPath="/dashboard" onNavigate={handleNavigate} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Citizen Account Active</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 font-normal">
              Heimdall Citizen Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Your profile is verified and linked to the Heimdall civic companion network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Account Status Card */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <h3 className="font-serif text-xl text-slate-900 font-normal">
                  Linked Citizen Credentials
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Google Account</p>
                        <p className="text-sm font-medium text-slate-900">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Citizen Profile</p>
                        <p className="text-sm font-medium text-slate-900">{profile.full_name}</p>
                        <p className="text-xs text-slate-500">{profile.phone_number}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Telegram Bot Channel</p>
                        <p className="text-sm font-medium text-slate-900">
                          {profile.telegram_username ? `@${profile.telegram_username}` : `Telegram ID: ${profile.telegram_user_id}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram Assistant Box */}
            <div className="space-y-6">
              <div className="bg-[#0F172A] text-white rounded-2xl p-6 space-y-4 shadow-md">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-normal text-white">
                    Start Chatting
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Open Telegram and message Heimdall anytime to ask civic questions, report local hazards, or get document checklists.
                  </p>
                </div>

                <a
                  href={`https://t.me/${profile.telegram_username || 'HeimdallCivicBot'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#0F172A] hover:bg-slate-100 py-2.5 px-4 text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Open in Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Quick Navigation
                </h4>
                <div className="flex flex-col gap-2 text-xs">
                  <button
                    onClick={() => handleNavigate('/')}
                    className="text-left py-1 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-between"
                  >
                    <span>Civic Landing Page</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleNavigate('/terms')}
                    className="text-left py-1 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-between"
                  >
                    <span>Terms & Conditions</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleNavigate('/privacy')}
                    className="text-left py-1 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-between"
                  >
                    <span>Privacy Policy</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full rounded-full border-slate-200 text-slate-600 hover:text-slate-900 text-xs"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
