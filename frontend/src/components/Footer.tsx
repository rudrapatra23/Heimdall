import { useState } from 'react';
import { HeimdallLogo } from '@/components/HeimdallLogo';
import { ContactModal } from '@/components/ContactModal';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [contactOpen, setContactOpen] = useState(false);

  const handleLinkClick = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (path.startsWith('#')) {
      const el = document.getElementById(path.substring(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <>
      <footer className="w-full bg-white border-t border-slate-100 pt-20 pb-16 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Brand & Status */}
          <div className="mb-14 space-y-3">
            <a
              href="/"
              onClick={(e) => handleLinkClick('/', e)}
              className="inline-flex items-center gap-2.5 group cursor-pointer"
            >
              <HeimdallLogo size={24} color="#0F172A" />
              <span className="text-xl font-medium tracking-tight text-[#0F172A]">
                Heimdall
              </span>
            </a>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-normal text-slate-600">
                All systems operational
              </span>
            </div>
          </div>

          {/* 3 Main Link Columns matching Orchid AI */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-10 sm:gap-14 pb-16 border-b border-slate-100">
            
            {/* Column 1: Social */}
            <div className="space-y-4">
              <h4 className="text-[13px] font-semibold text-slate-900 tracking-tight">
                Social
              </h4>
              <ul className="space-y-3 text-[13px] text-slate-600">
                <li>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    X (formerly Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-4">
              <h4 className="text-[13px] font-semibold text-slate-900 tracking-tight">
                Company
              </h4>
              <ul className="space-y-3 text-[13px] text-slate-600">
                <li>
                  <a
                    href="#solutions"
                    onClick={(e) => handleLinkClick('#solutions', e)}
                    className="hover:text-black transition-colors"
                  >
                    Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    onClick={(e) => handleLinkClick('#faq', e)}
                    className="hover:text-black transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setContactOpen(true)}
                    className="hover:text-black transition-colors text-left cursor-pointer focus:outline-hidden"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <a
                    href="https://status.heimdall.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    Status
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => handleLinkClick('/terms', e)}
                    className="hover:text-black transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => handleLinkClick('/privacy', e)}
                    className="hover:text-black transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Tools */}
            <div className="space-y-4">
              <h4 className="text-[13px] font-semibold text-slate-900 tracking-tight">
                Tools
              </h4>
              <ul className="space-y-3 text-[13px] text-slate-600">
                <li>
                  <span className="hover:text-black transition-colors cursor-default">
                    Gmail
                  </span>
                </li>
                <li>
                  <span className="hover:text-black transition-colors cursor-default">
                    Google Calendar
                  </span>
                </li>
                <li>
                  <span className="hover:text-black transition-colors cursor-default">
                    Google Drive
                  </span>
                </li>
                <li>
                  <span className="hover:text-black transition-colors cursor-default">
                    Granola
                  </span>
                </li>
                <li>
                  <span className="hover:text-black transition-colors cursor-default">
                    Sentry
                  </span>
                </li>
                <li>
                  <a
                    href="https://telegram.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    Telegram &amp; iMessage
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} Heimdall AI Inc. All rights reserved.
            </p>
            <p className="text-center sm:text-right text-slate-400">
              Heimdall is your personal nutrition coach and messaging-first assistant.
            </p>
          </div>

        </div>
      </footer>

      {/* Global Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
