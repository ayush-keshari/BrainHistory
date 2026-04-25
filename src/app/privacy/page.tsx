import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — BrainHistory",
  description:
    "Learn how BrainHistory collects, uses, and protects your personal data. We are committed to your privacy.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-30 h-14 flex items-center px-6
                      bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm
                      border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600
                            flex items-center justify-center shadow-md shadow-violet-500/30">
              <BrainIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              Brain<span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">History</span>
            </span>
          </Link>
          <Link
            href="/auth/signin"
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400
                       hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Back to app →
          </Link>
        </div>
      </nav>

      {/* ── Hero header ───────────────────────────────────────────────── */}
      <section className="pt-28 pb-10 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600
                            flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
              <ShieldIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Last updated: <time dateTime="2026-04">April 2026</time>
              </p>
            </div>
          </div>

          {/* Compliance badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {["GDPR Compliant", "CCPA Compliant", "No Data Selling", "No Ads"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                           bg-emerald-50 dark:bg-emerald-500/10
                           text-emerald-700 dark:text-emerald-400
                           border border-emerald-200 dark:border-emerald-500/20"
              >
                <CheckIcon className="h-3 w-3" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800
                          shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">

            {/* 1. Introduction */}
            <PolicySection number="1" title="Introduction">
              <p>
                BrainHistory (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;, or &ldquo;Company&rdquo;) operates the BrainHistory
                website and Chrome extension. This page informs you of our policies regarding the collection, use,
                and disclosure of personal data when you use our Service and the choices you have associated with
                that data.
              </p>
            </PolicySection>

            {/* 2. Data We Collect */}
            <PolicySection number="2" title="Data We Collect">
              <SubHeading>2.1 Information You Provide</SubHeading>
              <ul className="space-y-2 mt-2">
                {[
                  { label: "Account Information", desc: "When you create an account, we collect your email address and password (encrypted)." },
                  { label: "Content Data", desc: "URLs, page titles, document content, images, videos, and files you save to BrainHistory." },
                  { label: "User Notes", desc: "Any annotations, tags, or notes you add when organizing your saved content." },
                  { label: "Collections", desc: "Information about how you organize and categorize your saved content." },
                  { label: "Profile Information", desc: "Your name, profile picture, and other details you add to your profile." },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex gap-2">
                    <DotIcon />
                    <span><strong className="font-semibold text-zinc-800 dark:text-zinc-200">{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>

              <SubHeading className="mt-5">2.2 Information Collected Automatically</SubHeading>
              <ul className="space-y-2 mt-2">
                {[
                  { label: "Session Data", desc: "Authentication tokens and session cookies to keep you logged in." },
                  { label: "Usage Analytics", desc: "Which features you use, how often you save content, search patterns (anonymized)." },
                  { label: "Device Information", desc: "Browser type, operating system, device identifiers (from Chrome extension)." },
                  { label: "Log Data", desc: "IP address, access times, error reports, and usage patterns." },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex gap-2">
                    <DotIcon />
                    <span><strong className="font-semibold text-zinc-800 dark:text-zinc-200">{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </PolicySection>

            {/* 3. How We Use Your Data */}
            <PolicySection number="3" title="How We Use Your Data">
              <ul className="space-y-2">
                {[
                  { label: "Service Delivery", desc: "To store, retrieve, and organize your saved content." },
                  { label: "AI Features", desc: "To power semantic search and AI-powered chat features over your content." },
                  { label: "Authentication", desc: "To verify your identity and manage your account securely." },
                  { label: "Improvement", desc: "To analyze usage patterns and improve our service (using anonymized data)." },
                  { label: "Communication", desc: "To send you service updates, security alerts, or respond to support requests." },
                  { label: "Legal Compliance", desc: "To comply with applicable laws and regulations." },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex gap-2">
                    <DotIcon />
                    <span><strong className="font-semibold text-zinc-800 dark:text-zinc-200">{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </PolicySection>

            {/* 4. Data Security */}
            <PolicySection number="4" title="Data Security">
              <ul className="space-y-2">
                {[
                  "All data transmitted between your device and our servers uses HTTPS encryption.",
                  "Passwords are hashed using industry-standard algorithms.",
                  "Session tokens are stored as secure HTTP-only cookies.",
                  "We implement access controls to limit who can access your data.",
                  "Regular security audits and penetration testing are conducted.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <ShieldCheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 italic">
                No method of transmission over the internet or electronic storage is 100% secure. While we strive
                to use commercially acceptable means to protect your Personal Data, we cannot guarantee its
                absolute security.
              </p>
            </PolicySection>

            {/* 5. Data Sharing */}
            <PolicySection number="5" title="Data Sharing and Disclosure">
              <SubHeading>5.1 We Do NOT Share Your Data</SubHeading>
              <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10
                              border border-emerald-100 dark:border-emerald-500/20 p-4 space-y-2">
                {[
                  "We do NOT sell your personal data to third parties.",
                  "We do NOT share your content with other users or external services.",
                  "We do NOT use your data for marketing to third parties.",
                ].map((item) => (
                  <p key={item} className="flex gap-2 text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckIcon className="h-4 w-4 shrink-0 mt-0.5" />
                    {item}
                  </p>
                ))}
              </div>

              <SubHeading className="mt-5">5.2 Limited Disclosure</SubHeading>
              <ul className="space-y-2 mt-2">
                {[
                  { label: "Service Providers", desc: "We may share limited data with third-party services (hosting, analytics) under strict confidentiality agreements. Only necessary data is shared." },
                  { label: "Legal Requirements", desc: "We may disclose data if required by law, subpoena, or government request." },
                  { label: "Safety", desc: "We may disclose data to protect our rights, privacy, safety, or property." },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex gap-2">
                    <DotIcon />
                    <span><strong className="font-semibold text-zinc-800 dark:text-zinc-200">{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </PolicySection>

            {/* 6. Data Retention */}
            <PolicySection number="6" title="Data Retention">
              <ul className="space-y-2">
                {[
                  "Your content remains stored as long as your account is active.",
                  "You can delete individual content items at any time.",
                  "If you delete your account, all associated data is permanently deleted within 30 days.",
                  "Session logs and analytics data are retained for up to 90 days for security and improvement purposes.",
                  "Backups may retain data for up to 30 days after deletion for disaster recovery.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <DotIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </PolicySection>

            {/* 7. Your Rights */}
            <PolicySection number="7" title="Your Rights and Choices">
              <div className="space-y-5">
                {[
                  {
                    sub: "7.1 Access and Portability",
                    body: "You have the right to request a copy of all data we hold about you in a portable format.",
                  },
                  {
                    sub: "7.2 Correction and Deletion",
                    body: "You can update or correct your account information at any time. You can also request deletion of your data.",
                  },
                ].map(({ sub, body }) => (
                  <div key={sub}>
                    <SubHeading>{sub}</SubHeading>
                    <p className="mt-1">{body}</p>
                  </div>
                ))}

                <div>
                  <SubHeading>7.3 Opt-Out</SubHeading>
                  <ul className="mt-2 space-y-1.5">
                    <li className="flex gap-2"><DotIcon /><span>You can opt out of marketing emails in your account settings.</span></li>
                    <li className="flex gap-2"><DotIcon /><span>You can disable analytics tracking in your preferences.</span></li>
                  </ul>
                </div>

                <div>
                  <SubHeading>7.4 GDPR and CCPA Rights</SubHeading>
                  <p className="mt-1">
                    If you are in the EU or California, you have additional rights under GDPR and CCPA.
                    Contact us to exercise these rights.
                  </p>
                </div>
              </div>
            </PolicySection>

            {/* 8. Chrome Extension */}
            <PolicySection number="8" title="Chrome Extension Specific">
              <ul className="space-y-3">
                {[
                  { label: "activeTab Permission", desc: "Used only to read the current page's URL and title when you click the extension icon. This is never stored without your explicit save action." },
                  { label: "storage Permission", desc: "Used to store your session token locally, allowing seamless login." },
                  { label: "Host Permission", desc: "Required to communicate with our BrainHistory servers. Data is only sent when you explicitly save content." },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex gap-2">
                    <ExtensionIcon />
                    <span><strong className="font-semibold text-zinc-800 dark:text-zinc-200">{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-500/10
                              border border-amber-100 dark:border-amber-500/20 p-4 space-y-1.5">
                {[
                  "The extension does NOT track your browsing history unless you save content.",
                  "The extension does NOT run scripts on web pages you visit.",
                ].map((item) => (
                  <p key={item} className="flex gap-2 text-sm text-amber-800 dark:text-amber-300 font-medium">
                    <LockIcon className="h-4 w-4 shrink-0 mt-0.5" />
                    {item}
                  </p>
                ))}
              </div>
            </PolicySection>

            {/* 9. Third-Party Links */}
            <PolicySection number="9" title="Third-Party Links">
              <p>
                Our Service may contain links to other websites. We are not responsible for the privacy practices
                of these external sites. We encourage you to review their privacy policies before providing any
                personal information.
              </p>
            </PolicySection>

            {/* 10. Children's Privacy */}
            <PolicySection number="10" title="Children&apos;s Privacy">
              <p>
                BrainHistory is not intended for users under 13 years old. We do not knowingly collect personal
                information from children under 13. If we become aware of such collection, we will take steps to
                delete such information.
              </p>
            </PolicySection>

            {/* 11. Changes */}
            <PolicySection number="11" title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date. Your continued use of
                BrainHistory following the posting of revised Privacy Policy means that you accept and agree to
                the changes.
              </p>
            </PolicySection>

            {/* 12. Contact */}
            <PolicySection number="12" title="Contact Us">
              <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us at:</p>
              <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60
                              border border-zinc-100 dark:border-zinc-700 p-4 space-y-2">
                <p className="flex items-center gap-2 text-sm">
                  <MailIcon className="h-4 w-4 text-violet-500 shrink-0" />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Email:</span>
                  <a
                    href="mailto:srv.br009@gmail.com"
                    className="text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    srv.br009@gmail.com
                  </a>
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <GlobeIcon className="h-4 w-4 text-violet-500 shrink-0" />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Website:</span>
                  <a
                    href="https://brain-history-2.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    brain-history-2.onrender.com
                  </a>
                </p>
              </div>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                We will respond to your inquiry within 30 days.
              </p>
            </PolicySection>
          </div>

          {/* ── Compliance statement ─────────────────────────────────── */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50
                          dark:from-emerald-500/10 dark:to-teal-500/10
                          border border-emerald-100 dark:border-emerald-500/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIconLarge className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Compliance Statement</h3>
            </div>
            <ul className="space-y-2">
              {[
                "We do not sell or transfer user data to third parties",
                "We do not use user data for purposes unrelated to our service",
                "We do not use user data to determine creditworthiness or for lending",
                "We comply with GDPR, CCPA, and other privacy regulations",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-emerald-800 dark:text-emerald-300">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600
                            flex items-center justify-center">
              <BrainIcon className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              Brain<span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">History</span>
            </span>
          </Link>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Your content is private and only visible to you.
          </p>
        </div>
      </footer>
    </main>
  );
}

// ─── Layout helpers ────────────────────────────────────────────────────────────

function PolicySection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 sm:p-8 space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] font-black font-mono text-violet-400 dark:text-violet-500
                         bg-violet-50 dark:bg-violet-500/10
                         border border-violet-100 dark:border-violet-500/20
                         px-1.5 py-0.5 rounded shrink-0">
          {number}
        </span>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
          {title}
        </h2>
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 pl-0.5">
        {children}
      </div>
    </div>
  );
}

function SubHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 ${className}`}>
      {children}
    </h3>
  );
}

function DotIcon() {
  return <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}
function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4 text-emerald-500 shrink-0 mt-0.5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function ShieldCheckIconLarge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.061L5.636 5.197a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.061-1.061l1.591-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.678zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.061 0z" clipRule="evenodd" />
    </svg>
  );
}
function ExtensionIcon() {
  return (
    <svg className="h-4 w-4 text-violet-400 dark:text-violet-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
  );
}
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
