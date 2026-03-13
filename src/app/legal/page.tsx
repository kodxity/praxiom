'use client';
import { useState } from 'react';

const SECTIONS = [
    { id: 'privacy',  label: 'Privacy Policy' },
    { id: 'tos',      label: 'Terms of Service' },
    { id: 'cookies',  label: 'Cookie Notice' },
    { id: 'gdpr',     label: 'GDPR' },
];

const LAST_UPDATED = 'March 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--ink)', marginBottom: '12px', fontWeight: 400 }}>
                {title}
            </h2>
            <div style={{ fontFamily: 'var(--ff-body)', fontSize: '15px', lineHeight: 1.78, color: 'var(--ink2)', fontWeight: 300 }}>
                {children}
            </div>
        </section>
    );
}

function Para({ children }: { children: React.ReactNode }) {
    return <p style={{ marginBottom: '14px', margin: '0 0 14px' }}>{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul style={{ paddingLeft: '20px', margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {items.map((item, i) => (
                <li key={i} style={{ fontFamily: 'var(--ff-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink2)', fontWeight: 300 }}>{item}</li>
            ))}
        </ul>
    );
}

export default function LegalPage() {
    const [active, setActive] = useState('privacy');

    return (
        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Legal &middot; Documents
                </p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 'clamp(28px,3.5vw,40px)', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                    Legal Information
                </h1>
                <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--ink4)', fontFamily: 'var(--ff-mono)' }}>
                    Last updated: {LAST_UPDATED}
                </p>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {SECTIONS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActive(s.id)}
                        style={{
                            padding: '8px 16px', borderRadius: 'var(--r)', border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
                            background: active === s.id ? 'var(--ink)' : 'transparent',
                            color: active === s.id ? 'var(--bg)' : 'var(--ink4)',
                            boxShadow: active === s.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                        }}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="g" style={{ padding: '36px 40px', animation: 'fade-in 0.25s both' }} key={active}>

                {active === 'privacy' && (
                    <>
                        <Section title="Privacy Policy">
                            <Para>Praxiom (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</Para>
                        </Section>

                        <Section title="Information We Collect">
                            <Para>We collect information you provide directly to us, including:</Para>
                            <BulletList items={[
                                'Account information: username, email address (if provided), and password (hashed).',
                                'Profile information: any description or bio you choose to add to your profile.',
                                'Contest activity: your registrations, submissions, and scores.',
                                'Communications: any messages, comments, or feedback you submit to us.',
                            ]} />
                            <Para>We also collect certain information automatically when you use the platform:</Para>
                            <BulletList items={[
                                'Log data: IP address, browser type, pages visited, and timestamps.',
                                'Session data: authentication tokens stored in secure cookies.',
                            ]} />
                        </Section>

                        <Section title="How We Use Your Information">
                            <BulletList items={[
                                'To provide, maintain, and improve the Praxiom platform.',
                                'To authenticate your identity and manage your account.',
                                'To track contest participation and calculate ratings.',
                                'To display your username and statistics on public leaderboards.',
                                'To communicate with you about your account or the platform.',
                                'To detect and prevent fraud, abuse, or violations of our Terms.',
                            ]} />
                        </Section>

                        <Section title="Data Sharing">
                            <Para>We do not sell your personal information. We may share your information with:</Para>
                            <BulletList items={[
                                'Service providers who assist us in operating the platform (e.g., hosting, database).',
                                'Law enforcement or government agencies when required by applicable law.',
                                'Other users: your username, rating, and public contest performance are visible to other users.',
                            ]} />
                        </Section>

                        <Section title="Data Retention">
                            <Para>We retain your personal information for as long as your account is active or as needed to provide services. You may delete your account at any time directly from your profile settings. Deleting your account anonymizes your profile — your username, email, and bio are wiped and you are removed from any groups, but your contest history remains attributed to a deleted-user placeholder to preserve leaderboard integrity.</Para>
                        </Section>

                        <Section title="Security">
                            <Para>We implement reasonable technical and organizational measures to protect your information. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</Para>
                        </Section>

                        <Section title="Contact">
                            <Para>If you have questions about this Privacy Policy, please contact us through the platform&rsquo;s contact channels.</Para>
                        </Section>
                    </>
                )}

                {active === 'tos' && (
                    <>
                        <Section title="Terms of Service">
                            <Para>By using Praxiom, you agree to these Terms of Service. Please read them carefully. If you do not agree, do not use the platform.</Para>
                        </Section>

                        <Section title="Account Registration">
                            <BulletList items={[
                                'You must be approved by an administrator before accessing contest features.',
                                'You are responsible for maintaining the confidentiality of your login credentials.',
                                'You must not share your account with others or create multiple accounts.',
                                'You must provide accurate information when registering.',
                            ]} />
                        </Section>

                        <Section title="Acceptable Use">
                            <Para>You agree not to:</Para>
                            <BulletList items={[
                                'Use automated tools to submit answers or scrape content.',
                                'Attempt to access other users&rsquo; accounts or private data.',
                                'Share contest problems or answers during active contests.',
                                'Harass, threaten, or abuse other users.',
                                'Upload or transmit illegal, harmful, or offensive content.',
                                'Impersonate any person or entity.',
                                'Attempt to reverse-engineer or interfere with the platform.',
                            ]} />
                        </Section>

                        <Section title="Contest Rules">
                            <BulletList items={[
                                'All submissions must be your own independent work.',
                                'Collaborating with others during individual contests is prohibited.',
                                'Ratings are calculated based on your contest performance and are binding.',
                                'We reserve the right to disqualify participants for rule violations.',
                            ]} />
                        </Section>

                        <Section title="Intellectual Property">
                            <Para>All contest problems, editorial content, and platform materials are owned by Praxiom or its licensors. You may not reproduce, distribute, or create derivative works without our express written permission.</Para>
                            <Para>By submitting content (comments, posts), you grant us a non-exclusive, royalty-free license to display and distribute that content on the platform.</Para>
                        </Section>

                        <Section title="Limitation of Liability">
                            <Para>Praxiom is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you have paid us in the past 12 months (which, as a free service, is zero).</Para>
                        </Section>

                        <Section title="Termination">
                            <Para>You may delete your own account at any time from your profile settings. Account deletion is permanent and immediate — your personal information will be anonymized and you will be signed out.</Para>
                            <Para>We also reserve the right to suspend or terminate accounts that violate these Terms or that we determine to be abusive or harmful, at our sole discretion.</Para>
                        </Section>

                        <Section title="Changes to Terms">
                            <Para>We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</Para>
                        </Section>
                    </>
                )}

                {active === 'cookies' && (
                    <>
                        <Section title="Cookie Notice">
                            <Para>This notice explains how Praxiom uses cookies and similar technologies on our platform.</Para>
                        </Section>

                        <Section title="What Are Cookies?">
                            <Para>Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work, or to work more efficiently, and to provide information to site owners.</Para>
                        </Section>

                        <Section title="Cookies We Use">
                            <Para><strong>Essential Cookies (Required)</strong></Para>
                            <BulletList items={[
                                'Session token (next-auth.session-token): Required to maintain your authenticated session. Without this cookie, you cannot log in.',
                                'CSRF token (next-auth.csrf-token): Security token to prevent cross-site request forgery attacks.',
                                'Callback URL (next-auth.callback-url): Stores the URL to redirect to after login.',
                            ]} />
                            <Para>We do not use analytics, advertising, or third-party tracking cookies. The cookies listed above are strictly necessary for the platform to function.</Para>
                        </Section>

                        <Section title="Cookie Duration">
                            <BulletList items={[
                                'Session cookies: Expire when you close your browser.',
                                'Persistent session tokens: Expire after 30 days (or earlier if you log out).',
                            ]} />
                        </Section>

                        <Section title="Managing Cookies">
                            <Para>You can control and delete cookies through your browser settings. However, disabling essential cookies will prevent you from logging in to the platform.</Para>
                            <Para>Most browsers allow you to refuse cookies or delete existing cookies. Consult your browser&rsquo;s help documentation for instructions.</Para>
                        </Section>
                    </>
                )}

                {active === 'gdpr' && (
                    <>
                        <Section title="GDPR Compliance">
                            <Para>If you are a resident of the European Economic Area (EEA) or United Kingdom, this section provides additional information about your rights under the General Data Protection Regulation (GDPR) and the UK GDPR.</Para>
                        </Section>

                        <Section title="Legal Basis for Processing">
                            <Para>We process your personal data on the following legal bases:</Para>
                            <BulletList items={[
                                'Contractual necessity: Processing required to provide the service you have registered for.',
                                'Legitimate interests: Processing necessary for our legitimate business interests, such as improving the platform and preventing fraud.',
                                'Legal obligation: Processing required to comply with applicable law.',
                                'Consent: For any processing not covered above, we will seek your explicit consent.',
                            ]} />
                        </Section>

                        <Section title="Your Rights">
                            <Para>Under GDPR, you have the following rights:</Para>
                            <BulletList items={[
                                'Right of access: You may request a copy of the personal data we hold about you.',
                                'Right to rectification: You may request correction of inaccurate or incomplete data.',
                                'Right to erasure: You may request deletion of your personal data (\u201cright to be forgotten\u201d). You can exercise this right directly from your account settings at any time.',
                                'Right to restriction: You may request that we restrict processing of your data in certain circumstances.',
                                'Right to data portability: You may request your data in a machine-readable format.',
                                'Right to object: You may object to processing based on legitimate interests.',
                                'Right to withdraw consent: Where processing is based on consent, you may withdraw it at any time.',
                            ]} />
                        </Section>

                        <Section title="Data Transfers">
                            <Para>Your data may be transferred to and processed in countries outside the EEA. When this occurs, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission.</Para>
                        </Section>

                        <Section title="Data Protection Officer">
                            <Para>As a small-scale educational platform, we do not currently have a designated Data Protection Officer. For data-related inquiries, please contact us through the platform&rsquo;s available channels.</Para>
                        </Section>

                        <Section title="Supervisory Authority">
                            <Para>If you believe we have not handled your data in accordance with GDPR, you have the right to lodge a complaint with your local data protection supervisory authority.</Para>
                        </Section>

                        <Section title="Exercising Your Rights">
                            <Para>For the right to erasure, you can delete your account directly from your profile settings — no need to contact us. For all other rights, please contact us through the platform. We will respond within 30 days. We may need to verify your identity before processing your request.</Para>
                        </Section>
                    </>
                )}

            </div>

            {/* Footer navigation */}
            <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {SECTIONS.filter(s => s.id !== active).map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActive(s.id)}
                        className="btn btn-ghost btn-sm"
                    >
                        {s.label}
                    </button>
                ))}
            </div>

        </div>
    );
}
