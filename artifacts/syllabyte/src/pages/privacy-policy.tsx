import React from "react";

const PrivacyPolicy: React.FC = () => {
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

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>Syllabyte</div>
      </header>

      <div style={styles.container}>
        <span style={styles.badge}>Legal</span>

        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.updated}>Last updated: {lastUpdated}</p>

        <p style={styles.intro}>
          Welcome to Syllabyte. Your privacy is important to us. This Privacy
          Policy explains what information we collect, how we use it, how we
          store it, and how you can control it when using Syllabyte.
        </p>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>1. Information We Collect</h2>
          <p style={styles.paragraph}>
            When you sign in to Syllabyte using Google OAuth, we may receive
            basic account information associated with your Google account,
            such as your email address, name, Google account identifier, and
            profile image if provided by Google. We may also collect academic
            information you provide or that is linked to your student account,
            such as your roll number and course-related profile details.
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>2. How We Use Information</h2>
          <p style={styles.paragraph}>
            We use this information only to:
          </p>
          <ul style={styles.list}>
            <li>Authenticate your account securely.</li>
            <li>Link your Syllabyte account to your student record.</li>
            <li>Personalise your syllabus and academic experience.</li>
            <li>Maintain service security, reliability, and account integrity.</li>
          </ul>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>3. Google User Data</h2>
          <p style={styles.paragraph}>
            Syllabyte uses Google OAuth solely for sign-in and account
            identification. We do not sell Google user data, and we do not use
            Google user data for advertising, personalized ads, or retargeting.
            We do not share Google user data with advertisers, data brokers, or
            other unrelated third parties.
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>4. Data Retention and Deletion</h2>
          <p style={styles.paragraph}>
            We keep personal information only as long as needed to provide
            Syllabyte, comply with legal obligations, resolve disputes, and
            maintain security. You may request deletion of your Syllabyte
            account and associated personal information by contacting us at the
            email address below. You may also revoke Syllabyte&apos;s access to
            your Google account through your Google account settings.
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>5. Security</h2>
          <p style={styles.paragraph}>
            We use reasonable technical and organizational measures to help
            protect your information. Session tokens are invalidated on logout,
            and a fresh Google authentication is required for a new session.
            However, no method of transmission or storage is completely secure.
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>6. Third-Party Services</h2>
          <p style={styles.paragraph}>
            Syllabyte relies on Google OAuth for authentication. Your use of
            Google services is also subject to Google&apos;s own privacy
            practices and terms.
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>7. Children&apos;s Privacy</h2>
          <p style={styles.paragraph}>
            Syllabyte is intended for academic use. Users should only provide
            information they are authorized to share.
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>8. Changes to This Policy</h2>
          <p style={styles.paragraph}>
            We may update this Privacy Policy from time to time. When we do, we
            will revise the “Last updated” date on this page. Continued use of
            Syllabyte after changes means you accept the updated policy.
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>9. Contact Us</h2>
          <p style={styles.paragraph}>
            If you have questions about this Privacy Policy or want to request
            deletion of your data, contact us at{" "}
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

export default PrivacyPolicy;