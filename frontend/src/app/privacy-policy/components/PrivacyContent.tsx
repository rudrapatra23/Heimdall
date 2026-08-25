import React from 'react';

const sections = [
  {
    id: 'information',
    number: '01',
    title: 'Information We Collect',
    content: [
      'When you create a Sery account, we collect information necessary to provide and secure the Service, including your name, email address, account information, and authentication details.',
      'When you connect third-party services such as Gmail, Google Calendar, or other supported communication and productivity platforms, Sery may access information and content from those services according to the permissions you grant.',
      'Depending on the integrations and features you use, this may include email messages and metadata, calendar events and metadata, contact information, files or documents you explicitly make available to Sery, and information required to perform authorized actions.',
      'We also collect technical information such as IP address, browser type, device information, log data, and information about how you interact with the Service. This information is used for security, reliability, diagnostics, and product improvement.',
    ],
  },
  {
    id: 'google-data',
    number: '02',
    title: 'Google User Data and OAuth Access',
    content: [
      'If you connect a Google account to Sery, Sery requests access only to the Google data and permissions necessary to provide the features you explicitly enable.',
      'Depending on the permissions granted, Sery may access Gmail messages and metadata, Google Calendar information, and other Google account information required for authorized functionality.',
      'Sery uses Google user data to provide the functionality requested by you, including understanding relevant communications, preparing or dispatching authorized actions, managing calendar-related operations, maintaining audit records, and providing related Service features.',
      'Sery does not sell Google user data. Sery does not use Google user data for advertising purposes or to build advertising profiles.',
      'Sery does not transfer Google user data to third parties except where necessary to provide the Service, comply with applicable law, protect the security of the Service, or as otherwise expressly authorized by you.',
      'You may revoke Sery’s access to your Google account at any time through your Google Account permissions. Revoking access may prevent Sery from performing features that depend on that authorization.',
    ],
  },
  {
    id: 'use',
    number: '03',
    title: 'How We Use Information',
    content: [
      'We use information collected through the Service to operate, maintain, secure, and improve Sery and to provide the functionality you request.',
      'This includes processing information necessary to understand and execute authorized instructions, generate responses or drafts, coordinate calendar and communication activities, maintain audit trails, authenticate users, prevent abuse, troubleshoot technical issues, and provide customer support.',
      'Where Sery uses artificial intelligence or third-party processing services to provide a feature, information is processed only to the extent reasonably necessary to provide that feature and in accordance with the applicable service configuration and contractual safeguards.',
      'We may also use aggregated or de-identified information for analytics, reliability measurement, security, and product improvement where the information can no longer reasonably be used to identify you.',
    ],
  },
  {
    id: 'autonomous-actions',
    number: '04',
    title: 'Autonomous Actions and Audit Logs',
    content: [
      'Sery is designed to perform actions on your behalf within the permissions and authority boundaries you configure. Depending on your settings, these actions may include composing or sending email, creating or modifying calendar events, and coordinating information with designated parties.',
      'To provide accountability and oversight, Sery maintains audit records describing relevant actions performed through the Service. These records may include the action taken, the connected service involved, timestamps, and other information necessary to understand the operation.',
      'You are responsible for maintaining appropriate authorization settings and reviewing audit information when required for your organization or use case.',
      'Sery does not intentionally perform actions outside the integrations and authorization boundaries configured for your account, except where necessary for security, fraud prevention, or operation of the Service.',
    ],
  },
  {
    id: 'sharing',
    number: '05',
    title: 'Data Sharing and Third Parties',
    content: [
      'We do not sell or rent your personal information or connected-service data.',
      'We may share information with service providers that process information on our behalf, such as infrastructure providers, database providers, authentication providers, analytics providers, security providers, and AI or machine-learning service providers used to operate specific Sery features.',
      'Service providers receive only the information reasonably necessary to perform their contracted services and are expected to maintain appropriate confidentiality and security protections.',
      'We may also disclose information when reasonably necessary to comply with applicable law, respond to lawful requests, protect the rights or safety of Sery, our users, or others, investigate abuse or security incidents, or enforce our Terms and Conditions.',
      'If Sery is involved in a merger, acquisition, financing, reorganization, sale of assets, or similar transaction, information may be transferred as part of that transaction subject to applicable confidentiality and privacy requirements.',
    ],
  },
  {
    id: 'security',
    number: '06',
    title: 'Data Security',
    content: [
      'Sery uses reasonable administrative, technical, and organizational safeguards designed to protect information against unauthorized access, alteration, disclosure, or destruction.',
      'Access to production systems and sensitive information is restricted based on operational requirements. Authentication credentials and access tokens are protected using appropriate security controls.',
      'No method of transmission or electronic storage is completely secure. Accordingly, while we work to protect your information, we cannot guarantee absolute security.',
      'If we become aware of a security incident that requires notification under applicable law, we will provide notice as required by law and take reasonable steps to investigate and mitigate the incident.',
    ],
  },
  {
    id: 'retention',
    number: '07',
    title: 'Data Retention and Deletion',
    content: [
      'We retain personal information and connected-service data only for as long as reasonably necessary to provide the Service, maintain security and audit records, comply with legal obligations, resolve disputes, and enforce our agreements.',
      'When you disconnect an integration, Sery will stop requesting new data from that integration. Certain information may remain in backups, security logs, audit records, or other systems for a limited period where reasonably necessary for legitimate operational or legal purposes.',
      'You may request deletion of your Sery account and associated personal information by contacting our support or legal team. We will process deletion requests subject to applicable legal, security, and contractual requirements.',
      'Deleting your Sery account does not necessarily delete information held directly by third-party services such as Google. You may need to manage or delete that information through the relevant third-party provider.',
    ],
  },
  {
    id: 'rights',
    number: '08',
    title: 'Your Rights and Choices',
    content: [
      'Depending on your location and applicable law, you may have rights regarding your personal information, including rights to access, correct, delete, restrict, or object to certain processing of your information.',
      'You may manage connected-account permissions through Sery and may revoke third-party authorization through the relevant provider, including your Google Account settings.',
      'You may also contact us to request information about how your personal data is processed or to exercise rights available to you under applicable privacy laws.',
      'We may need to verify your identity before completing certain requests. Some rights may be limited where we are legally required or permitted to retain or process particular information.',
    ],
  },
  {
    id: 'children',
    number: '09',
    title: "Children's Privacy",
    content: [
      'Sery is intended for professional and organizational use and is not directed to children under the age required by applicable law.',
      'We do not knowingly collect personal information from children in violation of applicable privacy laws. If you believe a child has provided personal information to Sery, please contact us so that we can investigate and take appropriate action.',
    ],
  },
  {
    id: 'international',
    number: '10',
    title: 'International Data Processing',
    content: [
      'Sery may process and store information in countries other than the country in which you live. As a result, your information may be subject to the laws of those jurisdictions.',
      'Where required by applicable law, Sery will use appropriate safeguards for international transfers of personal information.',
    ],
  },
  {
    id: 'changes',
    number: '11',
    title: 'Changes to This Privacy Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes to the Service, applicable law, or our privacy practices.',
      'When we make material changes, we will provide notice through the Service, by email, or by another reasonable method as required by applicable law.',
      'Your continued use of Sery after the effective date of an updated Privacy Policy constitutes acknowledgment of the updated policy to the extent permitted by applicable law.',
    ],
  },
  {
    id: 'contact',
    number: '12',
    title: 'Contact Us',
    content: [
      'If you have questions about this Privacy Policy, your personal information, or Sery’s privacy practices, you may contact our legal team at legal@sery.ai.',
      'For privacy-related requests concerning your account or connected integrations, please include enough information for us to identify your account and understand your request without sending unnecessary sensitive information.',
      'Last updated: August 25, 2026. Effective date: September 1, 2026.',
    ],
  },
];

export default function PrivacyContent() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 pb-12 border-b border-border/30">
          <p className="text-label-upper text-primary mb-4">Legal Document</p>

          <h1 className="text-section-title text-foreground uppercase mb-6">
            Privacy
            <br />
            <span className="text-muted-foreground">Policy.</span>
          </h1>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground font-500">
            <span>
              <span className="text-foreground font-600">Effective:</span>{' '}
              September 1, 2026
            </span>

            <span>
              <span className="text-foreground font-600">Last Updated:</span>{' '}
              August 25, 2026
            </span>

            <span>
              <span className="text-foreground font-600">Version:</span> 1.0
            </span>
          </div>

          <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-2xl">
            This Privacy Policy explains how Sery collects, uses, stores,
            protects, and discloses information when you use Sery, an
            autonomous AI operations platform.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="glass-card rounded-2xl p-8 border border-border/50 mb-12">
          <h2 className="text-sm font-800 text-foreground uppercase tracking-widest mb-5">
            Table of Contents
          </h2>

          <nav className="grid sm:grid-cols-2 gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-3 text-sm font-500 text-muted-foreground hover:text-primary transition-colors py-1.5 group"
              >
                <span className="text-label-upper text-primary/60 group-hover:text-primary transition-colors">
                  {s.number}
                </span>

                {s.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="scroll-mt-28 pb-12 border-b border-border/20 last:border-0"
            >
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-label-upper text-primary">
                  {section.number}
                </span>

                <h2 className="text-xl md:text-2xl font-800 text-foreground">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.content.map((para, i) => (
                  <p
                    key={i}
                    className="text-base text-muted-foreground leading-relaxed"
                  >
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
            Questions about this Privacy Policy? Contact our legal team at{' '}
            <a
              href="mailto:legal@sery.ai"
              className="text-primary hover:underline"
            >
              legal@sery.ai
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}