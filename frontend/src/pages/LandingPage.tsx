import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PhoneMockup } from '@/components/PhoneMockup';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Building2, 
  MapPin, 
  FileText, 
  MessageCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Bot,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onNavigate?: (path: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const faqs = [
    {
      q: "What is Heimdall?",
      a: "Heimdall is an AI-powered civic companion designed to help citizens effortlessly access government services, find verified public information, report local civic grievances, and understand required document checklists in real time."
    },
    {
      q: "How do I report a civic issue?",
      a: "You can describe your issue (e.g., broken streetlight, water leakage, road hazard) directly in natural language on the web or via our Telegram assistant. Heimdall automatically identifies the responsible municipal department, geo-tags the issue, and generates a tracking ticket."
    },
    {
      q: "How does the Telegram companion work?",
      a: "After signing in, click 'Connect Telegram' to link your account. You can then text or send voice messages to @HeimdallCivicBot anytime to ask civic questions, log issues, or receive proactive status updates on your requests."
    },
    {
      q: "Is my personal information secure?",
      a: "Yes, completely. We adhere to strict data privacy standards. We do not sell user information or train public AI models on citizen communications. All communications are encrypted in transit and at rest."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#0F172A] font-sans antialiased selection:bg-[#0F172A] selection:text-white">
      <Navbar currentPath="/" onNavigate={handleNavigate} />

      {/* Hero Section — Minimal White, Centered Hero, Large Whitespace */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Main Hero Heading */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[74px] font-normal tracking-tight text-[#0F172A] leading-[1.08] mb-6">
            Meet Heimdall, your<br />
            <span className="italic font-normal">AI-powered civic companion.</span>
          </h1>

          {/* Hero Description */}
          <p className="text-slate-600 text-base sm:text-lg md:text-[19px] font-light max-w-2xl mx-auto leading-relaxed mb-8">
            Heimdall helps you access government services, report civic issues, and get instant information, all through one intelligent platform.
          </p>

          {/* Rounded Get Started CTA Button */}
          <div className="flex items-center justify-center mb-14">
            <button
              onClick={() => handleNavigate('/login')}
              className="group inline-flex items-center gap-2.5 bg-[#0F172A] hover:bg-black text-white rounded-full px-7 py-3.5 text-[15px] font-medium shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Exact Phone Animation Video Mockup */}
          <div className="relative pt-2">
            <PhoneMockup />
          </div>

        </div>
      </section>

      {/* Testimonial / Social Proof Quote Section */}
      <section className="py-20 md:py-28 bg-[#FFFFFF] border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          
          {/* Soft Glow Avatar */}
          <div className="relative mx-auto w-16 h-16 rounded-full p-0.5 bg-linear-to-tr from-blue-400 via-purple-400 to-amber-300 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
              alt="Sarah Chen"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Testimonial Quote in Large Serif */}
          <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#0F172A] font-normal leading-snug max-w-2xl mx-auto">
            &ldquo;Heimdall makes civic follow-ups easy, marks the important updates and sends them straight to my messages. It&apos;s so intuitive to use.&rdquo;
          </blockquote>

          {/* Author attribution */}
          <div className="text-xs text-slate-400 font-medium tracking-wide">
            Sarah Chen &middot; Citizen &amp; Verified User
          </div>

        </div>
      </section>

      {/* Core Civic Capabilities Showcase Container */}
      <section className="py-20 bg-[#FFFFFF] border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Civic Infrastructure
            </h2>
            <p className="font-serif text-4xl sm:text-5xl text-[#0F172A] font-normal tracking-tight">
              Bridging the gap between citizens and public administration.
            </p>
            <p className="text-slate-600 text-base font-light leading-relaxed">
              No more confusing bureaucratic portals or endless queues. Heimdall gives you clear answers and actionable guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[#FAFAFA] rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-5 hover:border-slate-300 transition-all hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#0F172A] flex items-center justify-center border border-slate-200 shadow-2xs">
                <Building2 className="w-6 h-6 text-slate-900" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-slate-900 font-normal">
                  Public Services Directory
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Navigate municipal, state, and central programs effortlessly. Check eligibility criteria, fee structures, and step-by-step procedures in plain language.
                </p>
              </div>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-600 border-t border-slate-200/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant eligibility calculation for public welfare schemes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct links to verified official government portals</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAFAFA] rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-5 hover:border-slate-300 transition-all hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#0F172A] flex items-center justify-center border border-slate-200 shadow-2xs">
                <MapPin className="w-6 h-6 text-slate-900" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-slate-900 font-normal">
                  Civic Grievance &amp; Issue Reporting
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Spot a broken road, water leakage, or power hazard? Tell Heimdall in natural language. We automatically categorize the issue, geo-tag it, and route it to your municipal department.
                </p>
              </div>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-600 border-t border-slate-200/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automatic ward and departmental grievance assignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time resolution status updates and tracking</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAFAFA] rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-5 hover:border-slate-300 transition-all hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#0F172A] flex items-center justify-center border border-slate-200 shadow-2xs">
                <FileText className="w-6 h-6 text-slate-900" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-slate-900 font-normal">
                  Document Intelligence &amp; Checklists
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Never have an application rejected. Get customized, interactive checklists of identity proofs, affidavits, and utility documents required for any civic transaction.
                </p>
              </div>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-600 border-t border-slate-200/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prerequisite validation before visiting government offices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Format guides for notary affidavits and declarations</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FAFAFA] rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-5 hover:border-slate-300 transition-all hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#0F172A] flex items-center justify-center border border-slate-200 shadow-2xs">
                <MessageCircle className="w-6 h-6 text-slate-900" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-slate-900 font-normal">
                  Omnichannel Telegram Assistant
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Connect your Telegram account with a single click. Chat with Heimdall on the go, send voice notes or photos of hazards, and receive instant updates.
                </p>
              </div>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-600 border-t border-slate-200/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Natural conversational assistant available 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Works natively on mobile, desktop, and web</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 bg-[#FFFFFF] border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Questions &amp; Answers
            </h2>
            <p className="font-serif text-3xl sm:text-4xl text-[#0F172A] font-normal">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-slate-900 text-sm sm:text-base">
                      {faq.q}
                    </span>
                    <div className="text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed font-light border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-[#0F172A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight">
            Ready to experience Heimdall?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
            Access public services, report issues, and stay informed through messages in seconds.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => handleNavigate('/login')}
              className="rounded-full bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <span>Get Started with Heimdall</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
