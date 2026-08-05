import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, ArrowLeft, CalendarDays, GraduationCap } from 'lucide-react';

interface StudentProfile {
  class_roll_no: string;
  student_name?: string | null;
  gender?: string | null;
  date_of_birth?: string | null; // stored as MM/DD/YYYY
  college_name?: string | null;
  course_name?: string | null;
  sem?: number | null;
  photo_url?: string | null;
  email?: string | null;
  linked_email?: string | null;
}

type Step = 'enter-roll' | 'verify';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/60 last:border-0">
      <span className="text-xs sm:text-sm text-muted-foreground font-medium w-28 sm:w-32 shrink-0">
        {label}
      </span>
      <span className="text-sm sm:text-[15px] font-semibold text-foreground text-right break-words">
        {value || '—'}
      </span>
    </div>
  );
}

function parseDateByFormat(value: string, format: 'DD/MM/YYYY' | 'MM/DD/YYYY') {
  const cleaned = value.trim().replace(/-/g, '/').replace(/\s+/g, '');
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  let day: number;
  let month: number;
  const year = Number(match[3]);

  if (format === 'DD/MM/YYYY') {
    day = Number(match[1]);
    month = Number(match[2]);
  } else {
    month = Number(match[1]);
    day = Number(match[2]);
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function isSameDate(a: string, b: string) {
  const dateA = parseDateByFormat(a, 'DD/MM/YYYY');
  const dateB = parseDateByFormat(b, 'MM/DD/YYYY');
  if (!dateA || !dateB) return false;
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function convertDateInputToDDMMYYYY(value: string) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function convertDDMMYYYYToDateInput(value: string) {
  const date = parseDateByFormat(value, 'DD/MM/YYYY');
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLinkedEmail(profile: StudentProfile) {
  return profile.email || profile.linked_email || null;
}

function normalizeRollNumber(value: string) {
  return value.toUpperCase();
}

function BrandMark() {
  return (
    <div className="w-12 h-12 rounded-2xl  text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center shrink-0">
      <img
    src="/syllabyte.png"
    alt="Syllabyte Logo"
    className="w-full h-full object-contain -rotate-3"
  />
    </div>
  );
}

export default function Onboarding() {
  const { setRollNo, session } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>('enter-roll');
  const [rollNumber, setRollNumberInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dobDateInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!session) {
      setLocation('/');
    }
  }, [session, setLocation]);

  const clearError = () => setErrorMessage(null);

  const handleFindProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const roll = rollNumber.trim();

    if (!roll) {
      setErrorMessage('Please enter your class roll number.');
      return;
    }

    if (!dobInput.trim()) {
      setErrorMessage('Please enter your date of birth.');
      return;
    }

    const enteredDob = parseDateByFormat(dobInput, 'DD/MM/YYYY');
    if (!enteredDob) {
      setErrorMessage('Please enter date of birth in DD/MM/YYYY format.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = (await getProfile(roll)) as StudentProfile | null;

      if (!data) {
        setErrorMessage('No student found with that roll number.');
        toast.error('No student found with that roll number. Please check and try again.');
        return;
      }

      if (!data.date_of_birth) {
        setErrorMessage('This profile does not have a date of birth stored.');
        toast.error('This profile does not have a date of birth stored.');
        return;
      }

      if (!isSameDate(dobInput, data.date_of_birth)) {
        setErrorMessage('Roll number and date of birth do not match.');
        toast.error('Roll number and date of birth do not match.');
        return;
      }

      const linkedEmail = getLinkedEmail(data);
      const currentEmail = session?.user?.email?.toLowerCase() || null;
      const linkedEmailLower = linkedEmail?.toLowerCase() || null;

      if (linkedEmailLower && linkedEmailLower !== currentEmail) {
        setErrorMessage(`An account for this profile already exists.`);
        toast.error(`An account for this profile already exists.`);
        return;
      }

      if (linkedEmailLower && linkedEmailLower === currentEmail) {
        setRollNo(data.class_roll_no);
        toast.success('This profile is already linked to your account.');
        setLocation('/home');
        return;
      }

      setProfile(data);
      setStep('verify');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to find profile. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleConfirmLink = async () => {
if (!session || !profile) return;

clearError();
setIsLinking(true);

try {
const currentEmail = session.user?.email;


if (!currentEmail) {
  throw new Error('No email found in your login session.');
}

const linkedEmail = getLinkedEmail(profile);

if (
  linkedEmail &&
  linkedEmail.toLowerCase() !== currentEmail.toLowerCase()
) {
  throw new Error('This profile is already linked to another account.');
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001';

const res = await fetch(
  `${API_URL}/api/profile/${encodeURIComponent(
    profile.class_roll_no
  )}/link-email`,
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: currentEmail,
    }),
  }
);

if (!res.ok) {
  let message = 'Failed to link account';

  try {
    const err = await res.json();

    if (err?.error) {
      message = err.error;
    }
  } catch {
    // Response was not JSON
  }

  throw new Error(message);
}

const updatedProfile = await res.json();

console.log('Linked profile:', updatedProfile);

setRollNo(profile.class_roll_no);

toast.success('Account linked! Welcome to Syllabyte 🎉');

setLocation('/home');


} catch (err: unknown) {
console.error('Account linking failed:', err);


const msg =
  err instanceof Error
    ? err.message
    : 'Something went wrong. Please try again.';

setErrorMessage(msg);
toast.error(msg);


} finally {
setIsLinking(false);
}
};


  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-muted/40 via-background to-background flex justify-center">
      <div className="w-full max-w-5xl min-h-[100dvh] md:min-h-0 md:my-8 md:rounded-[2rem] md:shadow-2xl bg-background flex flex-col overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-56 bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <AnimatePresence mode="wait">
            {step === 'enter-roll' && (
              <motion.div
                key="enter-roll"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="w-full max-w-xl">
                  <div className="rounded-[2rem] border border-border/60 bg-card/70 backdrop-blur-xl shadow-sm p-5 sm:p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <BrandMark />
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                          Welcome to Syllabyte
                        </p>
                        <h1 className="mt-1 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
                          Link Your Profile
                        </h1>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base leading-6 text-muted-foreground mb-6 max-w-lg">
                      Enter your class roll number and date of birth to verify your student record.
                    </p>

                    <form onSubmit={handleFindProfile} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="rollNumber" className="text-sm font-medium text-foreground">
                          Class Roll Number
                        </label>
                        <Input
                          id="rollNumber"
                          type="text"
                          placeholder="e.g. 25-CSE-6082"
                          value={rollNumber}
                          onChange={(e) => {
                            setRollNumberInput(normalizeRollNumber(e.target.value));
                            clearError();
                          }}
                          className="h-14 text-base sm:text-lg rounded-2xl bg-background border-border shadow-sm px-4 uppercase tracking-wider"
                          autoCapitalize="characters"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck={false}
                          autoFocus
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="dob" className="text-sm font-medium text-foreground">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <Input
                            id="dob"
                            type="text"
                            inputMode="numeric"
                            placeholder="DD/MM/YYYY"
                            value={dobInput}
                            onChange={(e) => {
                              setDobInput(e.target.value);
                              clearError();
                            }}
                            className="h-14 text-base sm:text-lg rounded-2xl bg-background border-border shadow-sm px-4 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => dobDateInputRef.current?.showPicker?.()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Open calendar"
                          >
                            <CalendarDays size={18} />
                          </button>
                          <input
                            ref={dobDateInputRef}
                            type="date"
                            className="sr-only"
                            value={convertDDMMYYYYToDateInput(dobInput)}
                            onChange={(e) => {
                              setDobInput(convertDateInputToDDMMYYYY(e.target.value));
                              clearError();
                            }}
                          />
                        </div>
                      </div>

                      {errorMessage && (
                        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                          {errorMessage}
                        </div>
                      )}

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-base rounded-2xl shadow-md"
                        disabled={!rollNumber.trim() || !dobInput.trim() || isSubmitting}
                      >
                        {isSubmitting ? 'Searching…' : 'Find My Profile'}
                      </Button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'verify' && profile && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="w-full max-w-3xl">
                  <div className="rounded-[2rem] border border-border/60 bg-card/70 backdrop-blur-xl shadow-sm p-5 sm:p-6 md:p-8">
                    <button
                      onClick={() => {
                        setStep('enter-roll');
                        clearError();
                      }}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>

                    <div className="mb-6">
                      <p className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                        Welcome to Syllabyte
                      </p>
                      <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                        Is this you?
                      </h1>
                      <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                        Review your details below and confirm to link your account.
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-5">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                      <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex flex-col items-center md:items-start gap-3 w-full">
                          <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-background shadow-md">
                            <AvatarImage
                              src={profile.photo_url || ''}
                              alt={profile.student_name || 'Student'}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif">
                              {profile.student_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>

                          <div className="text-center md:text-left">
                            <div className="text-lg sm:text-xl font-semibold text-foreground">
                              {profile.student_name || 'Student'}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {profile.class_roll_no}
                            </div>
                          </div>
                        </div>

                       
                      </div>

                      <div className="flex flex-col gap-5">
                        <div className="bg-background border border-border rounded-3xl p-4 sm:p-5 shadow-sm">
                          <InfoRow label="Name" value={profile.student_name} />
                          <InfoRow label="Roll No" value={profile.class_roll_no} />
                          <InfoRow label="Course" value={profile.course_name} />
                          <InfoRow label="Semester" value={profile.sem ? `Semester ${profile.sem}` : null} />
                          <InfoRow label="College" value={profile.college_name} />
                          <InfoRow label="Gender" value={profile.gender} />
                          <InfoRow label="Date of Birth" value={profile.date_of_birth} />
                        </div>

                        <div className="space-y-3">
                          <Button
                            size="lg"
                            className="w-full h-14 text-base rounded-2xl shadow-md"
                            onClick={handleConfirmLink}
                            disabled={isLinking}
                          >
                            {isLinking ? 'Linking account…' : 'Yes, this is me — Link Account'}
                          </Button>

                          <p className="text-xs leading-5 text-center text-muted-foreground px-2 pb-2">
                            Your Google account ({session?.user?.email}) will be linked to this profile.
                            Next time you log in, you will go straight to your dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}