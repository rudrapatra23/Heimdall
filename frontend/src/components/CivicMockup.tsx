import { useState } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MapPin, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Building2, 
  Search,
  Check
} from 'lucide-react';

export function CivicMockup() {
  const [activeTab, setActiveTab] = useState<'grievance' | 'documents' | 'services'>('grievance');
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleDoc = (index: number) => {
    setCheckedDocs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Outer Glow & Window Frame */}
      <div className="relative rounded-3xl bg-white p-2.5 sm:p-4 border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08)] transition-all duration-300">
        
        {/* Top Window Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-200" />
            <div className="w-3 h-3 rounded-full bg-slate-200" />
            <div className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="ml-2 text-xs font-medium text-slate-400 font-mono">
              heimdall.civic/companion
            </span>
          </div>
          
          {/* Interactive Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-full text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('grievance')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'grievance'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Issue Reporting
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Doc Checklist
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Gov Services
            </button>
          </div>
        </div>

        {/* Main Mockup Body */}
        <div className="bg-[#FBFBFC] rounded-2xl border border-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Conversational Query Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 text-xs sm:text-sm text-slate-700 font-normal truncate">
              {activeTab === 'grievance' && "Citizen: \"Reporting broken streetlights and blocked drain near 4th Cross, Ward 12.\""}
              {activeTab === 'documents' && "Citizen: \"What documents do I need to renew my municipal commercial trade license?\""}
              {activeTab === 'services' && "Citizen: \"Check eligibility for PM Solar Rooftop Subsidy scheme in my state.\""}
            </div>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/80 shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified AI
            </span>
          </div>

          {/* Dynamic Content based on Active Tab */}
          {activeTab === 'grievance' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* AI Analysis Summary */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    Heimdall Civic Engine
                    <span className="text-slate-400 font-normal">· Instant Dispatch</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    I have categorized your report into 2 civic grievances and routed them directly to the Department of Municipal Administration with automated priority tags.
                  </p>
                </div>
              </div>

              {/* Grid of Issues */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Grievance 1 */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #CIVIC-89241
                    </span>
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      In Progress (SLA: 24h)
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">
                      Electrical Hazard / Streetlight Outage
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Ward 12, 4th Cross Rd (GPS Tagged)
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Dept: Urban Power Works</span>
                    <span className="text-slate-900 font-medium">Auto-Dispatched</span>
                  </div>
                </div>

                {/* Grievance 2 */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #CIVIC-89242
                    </span>
                    <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Acknowledged
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">
                      Drainage Desilting & Overflow
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Stormwater Junction 4B
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Dept: Public Sanitation</span>
                    <span className="text-slate-900 font-medium">Crew Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-900">
                    Document Readiness Navigator
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Here is the exact document checklist required by your municipal corporation for 2026 trade renewals:
                  </p>
                </div>
              </div>

              {/* Checklist items */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
                {[
                  { title: "Premises Ownership Deed or Lease Agreement", note: "Must show valid tenure for the fiscal year" },
                  { title: "Previous Municipal Tax Clearance Certificate (NOC)", note: "Property tax receipt updated through Q3" },
                  { title: "Pollution Control Board & Fire Safety Certificate", note: "Required for commercial units > 500 sq ft" },
                  { title: "Authorized Signatory Aadhaar / PAN Verification", note: "Digitally verifiable via DigiLocker" },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleDoc(idx)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all mt-0.5 ${
                      checkedDocs[idx] 
                        ? 'bg-[#0F172A] border-[#0F172A] text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {checkedDocs[idx] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs sm:text-sm font-medium ${checkedDocs[idx] ? 'text-slate-900 line-through opacity-75' : 'text-slate-800'}`}>
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{doc.note}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {checkedDocs[idx] ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-900">
                    Public Services Directory
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Eligibility verified for PM Surya Ghar: Free Electricity Scheme.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">
                      Rooftop Solar Subsidy (Residential)
                    </h4>
                    <p className="text-xs text-slate-500">Ministry of New & Renewable Energy</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Eligible: Up to ₹78,000 Direct Benefit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-slate-400">Processing Time</p>
                    <p className="font-medium text-slate-800 mt-0.5">14–21 Days</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Official Portal</p>
                    <p className="font-medium text-slate-800 mt-0.5">pmsuryaghar.gov.in</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Heimdall Integration</p>
                    <p className="font-medium text-emerald-700 mt-0.5">Auto-Fill Ready</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Telegram Companion Strip */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Synced with Heimdall Telegram Bot (<code>@HeimdallCivicBot</code>)</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span>⚡ Zero paperwork friction</span>
              <span>🔒 100% Citizen Privacy</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
