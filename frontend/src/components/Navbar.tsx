import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/ContactModal';
import { HeimdallLogo } from '@/components/HeimdallLogo';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { signOut } from '@/lib/auth';

interface NavbarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Navbar({ currentPath = window.location.pathname, onNavigate }: NavbarProps) {
  const { authState, refresh } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);

    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    await refresh(null, null);
    handleLinkClick('/');
  };

  const isAuthenticated = authState.state === 'complete' || authState.state === 'needs_profile' || authState.state === 'needs_telegram';

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <a
            href="/"
            onClick={(e) => handleLinkClick('/', e)}
            className="flex items-center gap-2.5 group focus:outline-hidden cursor-pointer"
          >
            <div className="text-[#0F172A] transition-transform duration-200 group-hover:scale-105">
              <HeimdallLogo size={24} />
            </div>
            <span className="text-xl font-medium tracking-tight text-[#0F172A]">
              Heimdall
            </span>
          </a>

          {/* Navigation Links: Terms & Conditions | Privacy Policy | Contact Us */}
          <nav className="hidden md:flex items-center gap-8 text-[14.5px] font-normal text-slate-700">
            <a
              href="/terms"
              onClick={(e) => handleLinkClick('/terms', e)}
              className={`transition-colors hover:text-black ${
                currentPath === '/terms' ? 'text-black font-medium' : ''
              }`}
            >
              Terms &amp; Conditions
            </a>
            <a
              href="/privacy"
              onClick={(e) => handleLinkClick('/privacy', e)}
              className={`transition-colors hover:text-black ${
                currentPath === '/privacy' ? 'text-black font-medium' : ''
              }`}
            >
              Privacy Policy
            </a>
            <button
              onClick={() => setContactOpen(true)}
              className="transition-colors hover:text-black cursor-pointer focus:outline-hidden"
            >
              Contact Us
            </button>
          </nav>

          {/* Top Right Buttons: Login | Get Started */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLinkClick('/dashboard')}
                  className="rounded-full text-slate-700 hover:text-black hover:bg-slate-100 flex items-center gap-1.5 px-4"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-full border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 px-3.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <>
                <button
                  onClick={(e) => handleLinkClick('/login', e)}
                  className="text-[14.5px] font-normal text-slate-800 hover:text-black px-3 py-1.5 transition-colors cursor-pointer focus:outline-hidden"
                >
                  Login
                </button>
                <Button
                  onClick={(e) => handleLinkClick('/login', e)}
                  className="rounded-full bg-[#0F172A] hover:bg-black text-white px-5 py-2 text-sm font-medium transition-all shadow-xs hover:shadow-md cursor-pointer inline-flex items-center"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4 text-base text-slate-700">
              <a
                href="/terms"
                onClick={(e) => handleLinkClick('/terms', e)}
                className={`py-1 transition-colors hover:text-[#0F172A] ${
                  currentPath === '/terms' ? 'font-semibold text-[#0F172A]' : ''
                }`}
              >
                Terms &amp; Conditions
              </a>
              <a
                href="/privacy"
                onClick={(e) => handleLinkClick('/privacy', e)}
                className={`py-1 transition-colors hover:text-[#0F172A] ${
                  currentPath === '/privacy' ? 'font-semibold text-[#0F172A]' : ''
                }`}
              >
                Privacy Policy
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactOpen(true);
                }}
                className="py-1 text-left transition-colors hover:text-[#0F172A]"
              >
                Contact Us
              </button>
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => handleLinkClick('/dashboard')}
                    className="w-full rounded-full bg-[#0F172A] text-white flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Dashboard</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full rounded-full border-slate-200 text-slate-700 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={(e) => handleLinkClick('/login', e)}
                    className="w-full rounded-full border-slate-200 text-slate-700"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={(e) => handleLinkClick('/login', e)}
                    className="w-full rounded-full bg-[#0F172A] text-white flex items-center justify-center"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
