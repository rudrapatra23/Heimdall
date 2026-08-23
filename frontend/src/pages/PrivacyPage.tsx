import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyPageProps {
  onNavigate?: (path: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  const [activeSection, setActiveSection] = useState('philosophy');

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const sections = [
    { id: 'philosophy', title: '1. Privacy Philosophy' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'usage', title: '3. How We Use Data' },
    { id: 'oauth', title: '4. Google OAuth & Scopes' },
    { id: 'telegram', title: '5. Telegram Bot Interactions' },
    { id: 'ai-privacy', title: '6. AI Processing & Zero-Training' },
    { id: 'security', title: '7. Data Security & Encryption' },
    { id: 'retention', title: '8. Data Retention & Deletion' },
    { id: 'rights', title: '9. Citizen Rights (GDPR / CCPA)' },
    { id: 'contact', title: '10. Data Protection Officer' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0F172A]">
      <Navbar currentPath="/privacy" onNavigate={handleNavigate} />

      {/* Page Header */}
      <section className="pt-12 pb-14 border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <button
              onClick={() => handleNavigate('/')}
              className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">Privacy Policy</span>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              <Lock className="w-3.5 h-3.5" />
              <span>Citizen Privacy & Data Protection</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Last Updated: August 2026</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#0F172A]">
              Privacy Policy
            </h1>

            <p className="text-slate-600 text-base sm:text-lg font-light max-w-3xl leading-relaxed">
              At Heimdall, we believe citizen privacy is fundamental to digital democracy. This policy details how we handle, protect, and respect your personal information.
            </p>
          </div>

        </div>
      </section>

      {/* Main Content with Sticky Sidebar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 pb-2 border-b border-slate-100 mb-2">
                Privacy Sections
              </p>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setActiveSection(sec.id)}
                    className={`block px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      activeSection === sec.id
                        ? 'bg-slate-100 text-[#0F172A] font-semibold'
                        : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Privacy Content */}
          <main className="lg:col-span-8 space-y-12 text-slate-700 text-sm sm:text-[15px] leading-relaxed">
            
            {/* Core Privacy Principles Callout */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 space-y-3 text-emerald-950 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-medium text-emerald-800">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Our 3 Core Privacy Commitments</span>
              </div>
              <ul className="space-y-2 text-emerald-900">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Public AI Model Training:</strong> We never use your private conversations, grievance reports, or personal documents to train public LLM models.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Data Minimization:</strong> We only collect data strictly necessary to assist you with government services or dispatch civic issues.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Complete Citizen Control:</strong> You can export or delete your profile, document checklists, and history at any time.</span>
                </li>
              </ul>
            </div>

            {/* Section 1 */}
            <section id="philosophy" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                1. Privacy Philosophy
              </h2>
              <p>
                Heimdall is engineered on privacy-by-design principles. We exist to empower citizens to navigate public services with clarity, without having their personal inquiries commodified or monitored.
              </p>
              <p>
                We do not serve advertisements, sell personal profiles to data brokers, or monetize citizen engagement data.
              </p>
            </section>

            {/* Section 2 */}
            <section id="collection" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                2. Information We Collect
              </h2>
              <p>We collect only the following limited categories of information:</p>
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <h4 className="font-medium text-slate-900 text-sm">A. Account & Profile Information</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    When you sign in via Google OAuth, we receive your email address, verified name, and profile photo URL. When completing your profile, you provide your full name and phone number for identity linking.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <h4 className="font-medium text-slate-900 text-sm">B. Telegram Identity</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    When you connect Telegram, we store your numeric Telegram User ID and username to securely route responses and proactive notifications to your chat.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <h4 className="font-medium text-slate-900 text-sm">C. Civic Inquiries & Grievance Data</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Conversational prompts, document questions, and submitted civic issues (including optional geographical locations and photos submitted to report municipal hazards).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="usage" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                3. How We Use Data
              </h2>
              <p>We process your data strictly for legitimate civic assistance purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>To provide accurate civic guidance and tailored document checklists based on your specific requirements.</li>
                <li>To format and transmit civic grievance tickets to municipal administrative authorities.</li>
                <li>To deliver instant notifications when an official document status changes or when a municipal worker updates your ticket.</li>
                <li>To maintain system health, detect abuse, and prevent denial-of-service attempts.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="oauth" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                4. Google OAuth & Scopes Explanation
              </h2>
              <p>
                Heimdall uses Supabase Auth with Google OAuth for streamlined citizen authentication. We request standard identity scopes (email, profile) to authenticate your account.
              </p>
              <p>
                Where optional assistant features require checking appointment schedules or document emails, OAuth tokens are stored in encrypted form using AES-256 with strict per-user database row-level security.
              </p>
            </section>

            {/* Section 5 */}
            <section id="telegram" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                5. Telegram Bot Interactions
              </h2>
              <p>
                When interacting with <code>@HeimdallCivicBot</code>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Account linking is achieved via cryptographically secure single-use tokens expiring within 15 minutes.</li>
                <li>Messages sent to the bot are processed ephemerally to generate immediate answers and update your grievance records.</li>
                <li>We do not have access to your personal Telegram private chats, contacts, or channels outside of direct interactions with the Heimdall bot.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="ai-privacy" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                6. AI Processing & Zero-Training Policy
              </h2>
              <p>
                Heimdall uses enterprise inference APIs (Groq / Llama) with strict zero-data-retention agreements:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Your queries and uploaded document details are processed solely to compute the immediate response.</li>
                <li>API providers are bound by contractual agreements prohibiting the use of citizen inputs for training foundation models.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="security" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                7. Data Security & Encryption
              </h2>
              <p>
                We implement industry-grade technical and organizational safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>In Transit:</strong> All web and API traffic is encrypted using Transport Layer Security (TLS 1.3).</li>
                <li><strong>At Rest:</strong> Databases and authentication tokens are encrypted using AES-256 encryption.</li>
                <li><strong>Access Controls:</strong> Database connections enforce strict least-privilege policies and granular authentication tokens.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="retention" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                8. Data Retention & Deletion
              </h2>
              <p>
                We retain your profile information as long as your account remains active. If you choose to delete your account, all associated session records, document checklists, and Telegram associations are permanently purged from our primary database within 30 days.
              </p>
            </section>

            {/* Section 9 */}
            <section id="rights" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                9. Citizen Rights (GDPR, CCPA & Global Norms)
              </h2>
              <p>Regardless of your geographic location, you enjoy the following rights:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Right to Access:</strong> Request a full copy of all data Heimdall stores regarding your account.</li>
                <li><strong>Right to Rectification:</strong> Update or correct your contact details at any time in your profile.</li>
                <li><strong>Right to Erasure (Right to Be Forgotten):</strong> Request permanent deletion of all stored data.</li>
                <li><strong>Right to Restrict Processing:</strong> Disconnect Telegram integration or revoke OAuth tokens immediately.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="contact" className="space-y-4 pt-2 pb-6 border-b border-slate-200">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                10. Data Protection Officer & Inquiries
              </h2>
              <p>
                To exercise any of your privacy rights or submit questions regarding this policy, please contact our Data Protection Officer:
              </p>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1 text-xs sm:text-sm">
                <p className="font-medium text-slate-900">Data Protection Officer</p>
                <p className="text-slate-600">Heimdall Civic Technologies</p>
                <p className="text-slate-600">Email: privacy@heimdallcivic.org</p>
                <p className="text-slate-600">Response Window: Within 48 business hours</p>
              </div>
            </section>

            {/* Bottom Nav Links */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => handleNavigate('/')}
                className="rounded-full border-slate-200 text-slate-700 cursor-pointer"
              >
                Return to Homepage
              </Button>
              <Button
                onClick={() => handleNavigate('/terms')}
                className="rounded-full bg-[#0F172A] text-white hover:bg-[#1E293B] cursor-pointer"
              >
                View Terms & Conditions
              </Button>
            </div>

          </main>

        </div>
      </div>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
