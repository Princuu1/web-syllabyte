import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useLocation } from 'wouter';
import { PageTransition } from '@/components/layout/PageTransition';
import { AppShell } from '@/components/layout/AppShell';
import { LogOut, Shield, FileText, ChevronRight, User, Bell, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetProfile } from '@workspace/api-client-react';

export default function Settings() {
  const { signOut, user, rollNo } = useAuth();
  const { isReady } = useAuthGuard();
  const [, setLocation] = useLocation();
  const [policyOpen, setPolicyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const { data: profile } = useGetProfile(rollNo || '', {
    query: { enabled: !!rollNo } as any,
  });

  const handleLogout = async () => {
    await signOut();
    setLocation('/');
  };

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = profile?.student_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <AppShell>
      <PageTransition className="flex flex-col min-h-[100dvh] md:min-h-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-6 md:px-10 pt-12 pb-10">
          <h1 className="text-3xl font-serif font-bold mb-6">Settings</h1>

          {/* Account card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-white/30 shrink-0">
              <AvatarImage src={profile?.photo_url || ''} className="object-cover" />
              <AvatarFallback className="bg-white/20 text-white font-bold text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-white truncate">{profile?.student_name || 'Student'}</p>
              <p className="text-sm text-white/60 truncate">{user?.email}</p>
              {rollNo && <p className="text-xs text-white/40 mt-0.5">Roll No: {rollNo}</p>}
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
              onClick={() => setLocation('/profile')}
            />
          </Section>

          {/* Legal section */}
          <Section label="Legal">
            <SettingsRow
              icon={<Shield size={18} />}
              iconBg="bg-purple-100 text-purple-600"
              label="Privacy Policy"
              onClick={() => setPolicyOpen(true)}
            />
            <SettingsRow
              icon={<FileText size={18} />}
              iconBg="bg-indigo-100 text-indigo-600"
              label="Terms & Conditions"
              onClick={() => setTermsOpen(true)}
              last
            />
          </Section>

          {/* About */}
          <Section label="About">
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Info size={18} />
                </div>
                <span className="font-semibold text-foreground text-sm">Version</span>
              </div>
              <span className="text-sm text-muted-foreground font-medium">1.0.0</span>
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
              <span className="font-bold text-destructive text-sm">Log Out</span>
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
  </a>{" "}
  
</p>
        </div>

        {/* Modals */}
        <LegalDialog open={policyOpen} onOpenChange={setPolicyOpen} title="Privacy Policy">
          <div className="prose prose-sm dark:prose-invert text-muted-foreground space-y-4">
            <p>Welcome to Syllabyte. Your privacy is important to us.</p>
            <h3 className="font-bold text-foreground">1. Information Collection</h3>
            <p>We collect information you provide, including your Google account email and your academic profile linked by roll number. No additional data is shared with third parties.</p>
            <h3 className="font-bold text-foreground">2. Use of Information</h3>
            <p>Your data is used solely to personalise your syllabus experience and link your account to your student record.</p>
            <h3 className="font-bold text-foreground">3. Data Protection</h3>
            <p>Sessions are globally invalidated on logout. Fresh Google authentication is required for every new session.</p>
            <h3 className="font-bold text-foreground">4. Third-Party Services</h3>
            <p>Syllabyte uses Google OAuth for authentication. No personal data is shared with advertisers.</p>
          </div>
        </LegalDialog>

        <LegalDialog open={termsOpen} onOpenChange={setTermsOpen} title="Terms & Conditions">
          <div className="prose prose-sm dark:prose-invert text-muted-foreground space-y-4">
            <p>These terms govern your use of the Syllabyte application.</p>
            <h3 className="font-bold text-foreground">1. Acceptance of Terms</h3>
            <p>By accessing Syllabyte, you agree to these Terms and Conditions in full.</p>
            <h3 className="font-bold text-foreground">2. User Responsibilities</h3>
            <p>You are responsible for all activity under your account. Log out from shared devices after use.</p>
            <h3 className="font-bold text-foreground">3. Content Accuracy</h3>
            <p>Syllabus content is provided in good faith. We do not guarantee completeness or accuracy.</p>
            <h3 className="font-bold text-foreground">4. Modifications</h3>
            <p>We reserve the right to modify these terms. Continued use constitutes acceptance.</p>
          </div>
        </LegalDialog>
      </PageTransition>
    </AppShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{label}</p>}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border/50">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, iconBg, label, onClick, last = false }: {
  icon: React.ReactNode; iconBg: string; label: string; onClick: () => void; last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-3.5 text-left active:bg-muted/50 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
        <span className="font-semibold text-foreground text-sm">{label}</span>
      </div>
      <ChevronRight size={17} className="text-muted-foreground" />
    </button>
  );
}

function LegalDialog({ open, onOpenChange, title, children }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3 border-b border-border">
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-5">{children}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
