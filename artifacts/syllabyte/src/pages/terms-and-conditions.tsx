import React from "react";

const TermsAndConditions: React.FC = () => {
const lastUpdated = "August 6, 2026";

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
backgroundColor: "#f8fafc",
color: "#0f172a",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
header: {
backgroundColor: "#ffffff",
borderBottom: "1px solid #e2e8f0",
padding: "20px 24px",
},
headerInner: {
maxWidth: "820px",
margin: "0 auto",
fontSize: "22px",
fontWeight: 700,
},
container: {
maxWidth: "820px",
margin: "0 auto",
padding: "64px 24px 80px",
},
badge: {
display: "inline-block",
padding: "6px 12px",
borderRadius: "999px",
backgroundColor: "#e0f2fe",
color: "#0369a1",
fontSize: "13px",
fontWeight: 600,
marginBottom: "16px",
},
title: {
margin: "0 0 12px",
fontSize: "42px",
lineHeight: 1.15,
letterSpacing: "-0.03em",
},
updated: {
margin: "0 0 40px",
color: "#64748b",
fontSize: "14px",
},
intro: {
fontSize: "18px",
lineHeight: 1.75,
color: "#334155",
marginBottom: "40px",
},
card: {
backgroundColor: "#ffffff",
border: "1px solid #e2e8f0",
borderRadius: "16px",
padding: "28px",
marginBottom: "18px",
boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
},
sectionTitle: {
margin: "0 0 12px",
fontSize: "20px",
fontWeight: 700,
},
paragraph: {
margin: 0,
color: "#475569",
fontSize: "16px",
lineHeight: 1.75,
},
list: {
margin: "12px 0 0 20px",
padding: 0,
color: "#475569",
fontSize: "16px",
lineHeight: 1.75,
},
footer: {
marginTop: "48px",
paddingTop: "24px",
borderTop: "1px solid #e2e8f0",
color: "#64748b",
fontSize: "14px",
textAlign: "center",
},
link: {
color: "#0369a1",
textDecoration: "none",
fontWeight: 600,
},
};

return ( <main style={styles.page}> <header style={styles.header}> <div style={styles.headerInner}>Syllabyte</div> </header>


  <div style={styles.container}>
    <span style={styles.badge}>Legal</span>

    <h1 style={styles.title}>Terms &amp; Conditions</h1>

    <p style={styles.updated}>Last updated: {lastUpdated}</p>

    <p style={styles.intro}>
      These Terms &amp; Conditions govern your use of the Syllabyte application.
      By accessing or using Syllabyte, you agree to comply with these terms.
      If you do not agree, you should not use the service.
    </p>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
      <p style={styles.paragraph}>
        By accessing or using Syllabyte, you confirm that you have read,
        understood, and agree to be bound by these Terms &amp; Conditions and
        our Privacy Policy.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>2. User Responsibilities</h2>
      <p style={styles.paragraph}>
        You are responsible for all activity under your account. You must
        keep your login credentials secure and log out from shared or public
        devices after use. You must not attempt to access another user's
        account or impersonate another person.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>3. Content Accuracy</h2>
      <p style={styles.paragraph}>
        Syllabus and academic content are provided in good faith for
        informational purposes. We do not guarantee completeness, accuracy,
        or that all information will always be up to date. You should verify
        important academic information with your institution or official
        sources when necessary.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>4. Acceptable Use</h2>
      <p style={styles.paragraph}>
        You agree not to misuse Syllabyte or interfere with its normal
        operation. You must not attempt unauthorized access to the service,
        other user accounts, servers, or data, and you must not use the
        service for unlawful, harmful, fraudulent, or abusive activity.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>5. Third-Party Services</h2>
      <p style={styles.paragraph}>
        Syllabyte may use third-party services, including Google OAuth, to
        provide authentication and related functionality. Your use of those
        services may also be subject to the third party's own terms and
        privacy policies.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>6. Intellectual Property</h2>
      <p style={styles.paragraph}>
        Unless otherwise stated, the Syllabyte name, logo, interface, design,
        and original software are owned by or licensed to Syllabyte and are
        protected by applicable intellectual property laws. You may not copy,
        modify, distribute, or commercially exploit our protected content
        without permission.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>7. Service Availability</h2>
      <p style={styles.paragraph}>
        We aim to keep Syllabyte available and reliable, but we do not
        guarantee uninterrupted or error-free operation. The service may be
        unavailable from time to time for maintenance, updates, technical
        issues, or reasons beyond our control.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>8. Suspension and Termination</h2>
      <p style={styles.paragraph}>
        We may suspend or terminate access to Syllabyte if we believe a user
        has violated these Terms &amp; Conditions, misused the service, or
        created a security, legal, or operational risk. You may stop using
        the service at any time.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>9. Changes to These Terms</h2>
      <p style={styles.paragraph}>
        We reserve the right to modify these Terms &amp; Conditions at any
        time. Continued use of Syllabyte after changes are posted means you
        accept the updated terms.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>10. Privacy</h2>
      <p style={styles.paragraph}>
        Your use of Syllabyte is also governed by our{" "}
        <a href="/privacy-policy" style={styles.link}>
          Privacy Policy
        </a>
        , which explains how we collect, use, store, and protect personal
        information.
      </p>
    </section>

    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>11. Contact Us</h2>
      <p style={styles.paragraph}>
        If you have questions about these Terms &amp; Conditions, contact us
        at{" "}
        <a href="mailto:Princuu29@gmail.com" style={styles.link}>
          Princuu29@gmail.com
        </a>
        .
      </p>
    </section>

    <footer style={styles.footer}>
      © {new Date().getFullYear()} Syllabyte. All rights reserved.
    </footer>
  </div>
</main>


);
};

export default TermsAndConditions;
