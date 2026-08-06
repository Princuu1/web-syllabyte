import React from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  GraduationCap,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <main className="min-h-[100dvh] bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2.5"
            aria-label="Go to Syllabyte home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <GraduationCap size={20} />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Syllabyte
            </span>
          </button>

          <nav className="flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={() => setLocation("/privacy-policy")}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block"
            >
              Privacy
            </button>

            <button
              type="button"
              onClick={() => setLocation("/terms-and-conditions")}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block"
            >
              Terms
            </button>

            <button
              type="button"
              onClick={() => setLocation("/")}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Sparkles size={15} />
            Built for students
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl">
            Meet{" "}
            <span className="text-blue-600">
              Syllabyte
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            An academic learning platform that helps students access their
            syllabus, explore course content, and keep their academic
            information organized in one place.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setLocation("/")}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
            >
              Get Started
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
            >
              Learn More
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              Academic focused
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              Secure authentication
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              Student friendly
            </span>
          </div>
        </div>
      </section>

      {/* What is Syllabyte */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              About Syllabyte
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Your academic experience, simplified.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              Syllabyte is designed to make academic information easier for
              students to access and understand. Instead of navigating
              scattered information, students can use Syllabyte to access
              syllabus and course-related information connected to their
              academic profile.
            </p>
          </div>

          {/* Features */}
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<BookOpen size={22} />}
              title="Syllabus Access"
              description="Access syllabus and subject information in a clear, organized experience built around your studies."
            />

            <FeatureCard
              icon={<Layers3 size={22} />}
              title="Academic Profile"
              description="Connect your student profile so Syllabyte can provide information relevant to your academic record."
            />

            <FeatureCard
              icon={<Brain size={22} />}
              title="Built for Learning"
              description="A focused academic experience designed to make finding and navigating course information simpler."
            />
          </div>
        </div>
      </section>

      {/* How Google Sign-In works */}
      <section id="how-it-works" className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LockKeyhole size={23} />
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              Google Sign-In
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Secure and simple authentication.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Syllabyte uses Google OAuth to securely authenticate users and
              identify their Syllabyte account. Google Sign-In allows students
              to access the application without creating a separate Syllabyte
              password.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Information received through Google is used for authentication,
              account identification, and the functionality described in our
              Privacy Policy.
            </p>

            <button
              type="button"
              onClick={() => setLocation("/privacy-policy")}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              Read our Privacy Policy
              <ChevronArrow />
            </button>
          </div>

          {/* Security card */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  Your privacy matters
                </p>
                <p className="text-sm text-slate-500">
                  Clear and transparent data practices
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <SecurityItem text="Google OAuth is used for secure authentication." />
              <SecurityItem text="Google user data is not sold to advertisers." />
              <SecurityItem text="Your information is used to provide Syllabyte functionality." />
              <SecurityItem text="You can request deletion of your Syllabyte account data." />
            </div>

            <div className="mt-7 border-t border-slate-200 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setLocation("/privacy-policy")}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Privacy Policy
                </button>

                <button
                  type="button"
                  onClick={() => setLocation("/terms-and-conditions")}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Terms & Conditions
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center text-white sm:px-12 sm:py-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <GraduationCap size={24} />
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Start using Syllabyte
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
            Sign in securely with Google and access your academic experience
            through Syllabyte.
          </p>

          <button
            type="button"
            onClick={() => setLocation("/")}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98]"
          >
            Continue to Syllabyte
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <GraduationCap size={17} />
                </div>

                <span className="font-bold text-slate-900">Syllabyte</span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Academic learning made simpler.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              <button
                type="button"
                onClick={() => setLocation("/privacy-policy")}
                className="font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Privacy Policy
              </button>

              <button
                type="button"
                onClick={() => setLocation("/terms-and-conditions")}
                className="font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Terms & Conditions
              </button>

              <button
                type="button"
                onClick={() => setLocation("/")}
                className="font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Syllabyte. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Feature Card                                */
/* -------------------------------------------------------------------------- */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-slate-900">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Security Item                                */
/* -------------------------------------------------------------------------- */

function SecurityItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2
        size={18}
        className="mt-0.5 shrink-0 text-emerald-500"
      />

      <p className="text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Small Arrow                                 */
/* -------------------------------------------------------------------------- */

function ChevronArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}