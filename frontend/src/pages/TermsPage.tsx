import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TermsPageProps {
  onNavigate?: (path: string) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  const [activeSection, setActiveSection] = useState('acceptance');

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'purpose', title: '2. Purpose & Civic Scope' },
    { id: 'disclaimer', title: '3. Government Non-Affiliation' },
    { id: 'ai-accuracy', title: '4. AI Guidance & Verification' },
    { id: 'grievance', title: '5. Civic Issue Reporting Rules' },
    { id: 'account', title: '6. User Account & Telegram Sync' },
    { id: 'conduct', title: '7. Acceptable Citizen Conduct' },
    { id: 'ip', title: '8. Intellectual Property & Open Data' },
    { id: 'liability', title: '9. Limitation of Liability' },
    { id: 'amendments', title: '10. Amendments & Governing Law' },
    { id: 'contact', title: '11. Civic Inquiries & Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0F172A]">
      <Navbar currentPath="/terms" onNavigate={handleNavigate} />

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
            <span className="text-slate-900 font-medium">Terms & Conditions</span>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              <Shield className="w-3.5 h-3.5" />
              <span>Civic Platform Agreement</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Last Updated: August 2026</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#0F172A]">
              Terms & Conditions
            </h1>

            <p className="text-slate-600 text-base sm:text-lg font-light max-w-3xl leading-relaxed">
              Please read these terms carefully. By accessing or using Heimdall across our web application or Telegram companion, you agree to be bound by these legal conditions.
            </p>
          </div>

        </div>
      </section>

      {/* Main Content with Sticky Sidebar Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Desktop Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 pb-2 border-b border-slate-100 mb-2">
                Table of Contents
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

          {/* Legal Text Content */}
          <main className="lg:col-span-8 space-y-12 text-slate-700 text-sm sm:text-[15px] leading-relaxed">
            
            {/* Callout Notice */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 space-y-2 text-amber-900 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Important Citizen Notice</span>
              </div>
              <p className="leading-relaxed text-amber-800">
                Heimdall is an independent civic intelligence companion and is not an official government entity or agency. We aggregate and synthesize open public data to help citizens understand and access civic infrastructure.
              </p>
            </div>

            {/* Section 1 */}
            <section id="acceptance" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                1. Acceptance of Terms
              </h2>
              <p>
                These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Citizen&quot;, &quot;User&quot;, or &quot;You&quot;) and Heimdall Civic Technologies (&quot;Heimdall&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
              </p>
              <p>
                By creating an account, accessing the Heimdall web portal, linking your Telegram account, or utilizing any automated civic assistance features, you affirm that you have read, understood, and agreed to these Terms and our Privacy Policy.
              </p>
            </section>

            {/* Section 2 */}
            <section id="purpose" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                2. Purpose & Civic Scope
              </h2>
              <p>
                Heimdall is designed to provide civic assistance, including but not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Explaining statutory regulations, eligibility standards, and municipal bylaws.</li>
                <li>Generating customized checklists of documents required for government applications.</li>
                <li>Facilitating the categorization and dispatch of civic maintenance grievances.</li>
                <li>Providing real-time conversational assistance via web interfaces and the Telegram bot.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="disclaimer" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                3. Government Non-Affiliation Disclaimer
              </h2>
              <p>
                Heimdall operates as an independent public-interest technology service. Unless explicitly stated in a published municipal partnership agreement, Heimdall does not represent, act on behalf of, or possess legal authority from any municipal corporation, state government, or central department.
              </p>
              <p>
                Decisions regarding application approvals, licenses, permits, certificates, and enforcement actions remain solely within the jurisdiction of respective public authorities.
              </p>
            </section>

            {/* Section 4 */}
            <section id="ai-accuracy" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                4. AI Guidance & Verification
              </h2>
              <p>
                Heimdall utilizes advanced artificial intelligence models to synthesize public documentation. While we continuously benchmark and verify our knowledge base against official gazettes and departmental websites:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Administrative guidelines, government fees, and document prerequisites are subject to periodic bureaucratic updates without notice.</li>
                <li>Heimdall&apos;s guidance does not constitute certified legal, financial, or tax advice.</li>
                <li>Users are encouraged to verify critical application deadlines with official government gazettes prior to statutory submissions.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="grievance" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                5. Civic Issue Reporting Rules
              </h2>
              <p>
                When submitting civic grievances (e.g., potholes, utility failures, waste accumulation):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>You agree to provide accurate, truthful descriptions and accurate location data.</li>
                <li>You must not submit fraudulent, frivolous, or malicious reports intended to harass municipal workers or third parties.</li>
                <li>Do not use Heimdall for immediate life-threatening emergencies. In situations requiring police, fire, or emergency medical services, contact official emergency telephone numbers (e.g., 911 / 112) immediately.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="account" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                6. User Account & Telegram Sync
              </h2>
              <p>
                To utilize personalized features such as persistent document checklists and Telegram notifications, you must authenticate via Google OAuth and provide your name and phone number.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your session and connected Telegram account. Any actions originating from your linked Telegram identity will be attributed to your citizen profile.
              </p>
            </section>

            {/* Section 7 */}
            <section id="conduct" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                7. Acceptable Citizen Conduct
              </h2>
              <p>
                You agree not to engage in any activity that compromises the security, stability, or integrity of Heimdall, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Reverse-engineering, scraping, or launching automated attacks against our API infrastructure.</li>
                <li>Attempting to bypass access controls or inject malicious payloads into civic intake forms.</li>
                <li>Impersonating public officials, law enforcement personnel, or other citizens.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="ip" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                8. Intellectual Property & Open Data
              </h2>
              <p>
                The Heimdall software interface, visual identity, branding, algorithms, and documentation are the proprietary intellectual property of Heimdall Civic Technologies.
              </p>
              <p>
                Public government notices, legislation, and civic datasets referenced within the platform remain in the public domain or under their respective open government data licenses.
              </p>
            </section>

            {/* Section 9 */}
            <section id="liability" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                9. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Heimdall and its contributors shall not be liable for any indirect, incidental, special, or consequential damages resulting from:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Government agency delays or rejections of citizen applications.</li>
                <li>Temporary disruptions or downtime in municipal APIs or Telegram messaging services.</li>
                <li>Inaccuracies in open government databases referenced by the AI model.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="amendments" className="space-y-4 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                10. Amendments & Governing Law
              </h2>
              <p>
                We reserve the right to revise these Terms at any time. Notice of significant amendments will be communicated via the web application or your connected Telegram channel. Continued use of Heimdall following any modification constitutes acceptance of the amended Terms.
              </p>
            </section>

            {/* Section 11 */}
            <section id="contact" className="space-y-4 pt-2 pb-6 border-b border-slate-200">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-normal">
                11. Civic Inquiries & Contact
              </h2>
              <p>
                If you have questions regarding these Terms or wish to inquire about municipal integration, please contact our legal and civic engagement team:
              </p>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1 text-xs sm:text-sm">
                <p className="font-medium text-slate-900">Heimdall Civic Technologies</p>
                <p className="text-slate-600">Email: legal@heimdallcivic.org</p>
                <p className="text-slate-600">Inquiry Response Window: 1–2 business days</p>
              </div>
            </section>

            {/* Back to top CTA */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => handleNavigate('/')}
                className="rounded-full border-slate-200 text-slate-700 cursor-pointer"
              >
                Return to Homepage
              </Button>
              <Button
                onClick={() => handleNavigate('/privacy')}
                className="rounded-full bg-[#0F172A] text-white hover:bg-[#1E293B] cursor-pointer"
              >
                View Privacy Policy
              </Button>
            </div>

          </main>

        </div>
      </div>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
