import React from 'react';

const sections = [
  {
    id: 'scope',
    number: '01',
    title: 'Scope of Autonomous Authorization',
    content: [
      'By activating Sery and connecting your communication credentials (email, calendar, messaging), you explicitly authorize Sery AI, Inc. ("Sery") to perform operations on your behalf within the scope you define.',
      'Authorized actions include, but are not limited to: composing and dispatching email communications, creating and modifying calendar events, generating internal status updates, and coordinating with designated team members.',
      'Sery operates within the authority boundaries you configure during onboarding. Actions outside your defined scope require explicit re-authorization. You may modify or revoke authorization at any time via your account settings.',
      'Sery will never initiate financial transactions, access systems outside your designated integrations, or communicate with parties outside your defined organizational scope without explicit per-action approval.',
    ],
  },
  {
    id: 'responsibility',
    number: '02',
    title: 'User Responsibility for Dispatched Actions',
    content: [
      'All communications dispatched by Sery on your behalf are legally and professionally attributed to you. By authorizing Sery to act, you accept full responsibility for the content and consequences of those communications.',
      'You are responsible for reviewing Sery\'s audit trail regularly and flagging any actions that do not align with your intent. Sery provides real-time audit logs precisely to enable this oversight.',
      'You must ensure that your use of Sery complies with your organization\'s communication policies, applicable employment law, and any contractual obligations you have with third parties.',
      'Sery is a tool that amplifies your authority. Misuse, including directing Sery to send misleading, harassing, or illegal communications, constitutes a material breach of these Terms and will result in immediate account termination.',
    ],
  },
  {
    id: 'availability',
    number: '03',
    title: 'Service Availability',
    content: [
      'Sery targets 99.9% uptime on a monthly basis for all paid tiers. Scheduled maintenance windows will be communicated with a minimum of 48 hours\' notice via email and in-app notification.',
      'In the event of unplanned service disruption, Sery will post status updates at status.sery.ai within 15 minutes of detection. Affected users will receive email notification within 30 minutes.',
      'Service availability excludes circumstances beyond our reasonable control, including but not limited to: third-party email provider outages, force majeure events, and actions by government authorities.',
      'For Enterprise tier subscribers, specific uptime commitments and remedies are governed by your separately negotiated Service Level Agreement, which supersedes these general terms.',
    ],
  },
  {
    id: 'liability',
    number: '04',
    title: 'Limitation of Liability',
    content: [
      'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SERY AI, INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.',
      'Sery\'s total cumulative liability for any claim arising from or related to these Terms or the Service shall not exceed the greater of (a) the amount you paid to Sery in the twelve months preceding the claim, or (b) USD $100.',
      'This limitation applies regardless of the form of action, whether in contract, tort, strict liability, or otherwise, and even if Sery has been advised of the possibility of such damages.',
      'Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above limitation may not apply to you. In such cases, Sery\'s liability is limited to the fullest extent permitted by applicable law.',
    ],
  },
  {
    id: 'sla',
    number: '05',
    title: 'Enterprise SLA Terms',
    content: [
      'Enterprise customers with an executed Master Services Agreement receive a dedicated Service Level Agreement that governs uptime commitments, response times, escalation paths, and service credits.',
      'Standard Enterprise SLA commitments include: 99.95% monthly uptime, dedicated support channel with 2-hour response SLA for critical issues, and a designated customer success manager.',
      'Service credits are calculated as follows: downtime between 99.9%–99.95% earns 5% monthly fee credit; downtime between 99.0%–99.9% earns 15% credit; downtime below 99.0% earns 25% credit. Credits are applied to the following billing cycle.',
      'Enterprise customers may request custom SLA terms, including custom uptime thresholds, data residency requirements, and dedicated infrastructure. Contact enterprise@sery.ai to initiate a custom SLA negotiation.',
      'All SLA credits must be requested within 30 days of the qualifying event. Credits are the sole and exclusive remedy for service availability failures.',
    ],
  },
  {
    id: 'general',
    number: '06',
    title: 'General Provisions',
    content: [
      'These Terms constitute the entire agreement between you and Sery AI, Inc. with respect to the Service and supersede all prior agreements, representations, and understandings.',
      'Sery reserves the right to modify these Terms at any time. Material changes will be communicated via email with 30 days\' notice. Continued use of the Service after the effective date constitutes acceptance.',
      'These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration in accordance with JAMS rules.',
      'If any provision of these Terms is held to be unenforceable, the remaining provisions will continue in full force and effect. Sery\'s failure to enforce any provision shall not constitute a waiver.',
      'Last updated: August 25, 2026. Effective date: September 1, 2026.',
    ],
  },
];

export default function TermsContent() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 pb-12 border-b border-border/30">
          <p className="text-label-upper text-primary mb-4">Legal Document</p>
          <h1 className="text-section-title text-foreground uppercase mb-6">
            Terms &amp;
            <br />
            <span className="text-muted-foreground">Conditions.</span>
          </h1>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground font-500">
            <span>
              <span className="text-foreground font-600">Effective:</span> September 1, 2026
            </span>
            <span>
              <span className="text-foreground font-600">Last Updated:</span> August 25, 2026
            </span>
            <span>
              <span className="text-foreground font-600">Version:</span> 2.1
            </span>
          </div>
          <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-2xl">
            These Terms and Conditions govern your use of Sery, an autonomous AI operations platform. Please read them carefully. By using Sery, you agree to be bound by these terms.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="glass-card rounded-2xl p-8 border border-border/50 mb-12">
          <h2 className="text-sm font-800 text-foreground uppercase tracking-widest mb-5">Table of Contents</h2>
          <nav className="grid sm:grid-cols-2 gap-2">
            {sections?.map((s) => (
              <a
                key={s?.id}
                href={`#${s?.id}`}
                className="flex items-center gap-3 text-sm font-500 text-muted-foreground hover:text-primary transition-colors py-1.5 group"
              >
                <span className="text-label-upper text-primary/60 group-hover:text-primary transition-colors">{s?.number}</span>
                {s?.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections?.map((section) => (
            <div
              key={section?.id}
              id={section?.id}
              className="scroll-mt-28 pb-12 border-b border-border/20 last:border-0"
            >
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-label-upper text-primary">{section?.number}</span>
                <h2 className="text-xl md:text-2xl font-800 text-foreground">{section?.title}</h2>
              </div>
              <div className="space-y-4">
                {section?.content?.map((para, i) => (
                  <p key={i} className="text-base text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 glass-card rounded-2xl p-8 border border-border/50">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Questions about these Terms? Contact our legal team at{' '}
            <a href="mailto:legal@sery.ai" className="text-primary hover:underline">
              legal@sery.ai
            </a>
            . For enterprise-specific terms, contact{' '}
            <a href="mailto:enterprise@sery.ai" className="text-primary hover:underline">
              enterprise@sery.ai
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}