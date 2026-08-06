import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/layout/PageTransition";
import { AppShell } from "@/components/layout/AppShell";
import {
  LogOut,
  Shield,
  FileText,
  ChevronRight,
  User,
  Info,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetProfile } from "@workspace/api-client-react";

export default function Settings() {
  const { signOut, user, rollNo } = useAuth();
  const { isReady } = useAuthGuard();
  const [, setLocation] = useLocation();

  const { data: profile } = useGetProfile(rollNo || "", {
    query: { enabled: !!rollNo } as any,
  });

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials =
    profile?.student_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <AppShell>
      <PageTransition className="flex flex-col min-h-[100dvh] md:min-h-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-6 md:px-10 pt-12 pb-10">
          <h1 className="text-3xl font-serif font-bold mb-6">Settings</h1>

          {/* Account card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-white/30 shrink-0">
              <AvatarImage
                src={profile?.photo_url || ""}
                className="object-cover"
              />
              <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-white truncate">
                {profile?.student_name || "Student"}
              </p>
              <p className="text-sm text-white/60 truncate">{user?.email}</p>
              {rollNo && (
                <p className="text-xs text-white/40 mt-0.5">Roll No: {rollNo}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-10 py-6 pb-28 md:pb-10 max-w-lg space-y-5">
          {/* Account section */}
          <Section label="Account">
            <SettingsRow
              icon={<User size={18} />}
              iconBg="bg-blue-100 text-blue-600"
              label="My Profile"
              onClick={() => setLocation("/profile")}
            />
          </Section>

          {/* Legal section */}
          <Section label="Legal">
            <SettingsRow
              icon={<Shield size={18} />}
              iconBg="bg-purple-100 text-purple-600"
              label="Privacy Policy"
              onClick={() => setLocation("/privacy-policy")}
            />
            <SettingsRow
              icon={<FileText size={18} />}
              iconBg="bg-indigo-100 text-indigo-600"
              label="Terms & Conditions"
              onClick={() => setLocation("/terms-and-conditions")}
            />
          </Section>

          {/* About */}
          <Section label="About">
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Info size={18} />
                </div>
                <span className="font-semibold text-foreground text-sm">
                  Version
                </span>
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                1.0.0
              </span>
            </div>
          </Section>

          {/* Logout */}
          <Section label="">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 text-left group transition-colors hover:bg-destructive/5 active:bg-destructive/10"
            >
              <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-colors">
                <LogOut size={18} />
              </div>
              <span className="font-bold text-destructive text-sm">
                Log Out
              </span>
            </button>
          </Section>

          <p className="text-[11px] text-center text-muted-foreground/50 pt-2 tracking-widest">
            Created with ❤️ by{" "}
            <a
              href="https://parbhansh.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:underline"
            >
              Parbhansh sharma
            </a>
          </p>
        </div>
      </PageTransition>
    </AppShell>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {label}
        </p>
      )}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border/50">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  icon,
  iconBg,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-3.5 text-left active:bg-muted/50 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          {icon}
        </div>
        <span className="font-semibold text-foreground text-sm">{label}</span>
      </div>
      <ChevronRight size={17} className="text-muted-foreground" />
    </button>
  );
}