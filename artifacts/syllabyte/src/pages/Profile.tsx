import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Camera,
  User as UserIcon,
  Mail,
  GraduationCap,
  Users,
  CalendarDays,
  Building2,
  Hash,
  BookOpen,
  Loader2,
  ShieldCheck,
  Sparkles,
  PenSquare,
} from 'lucide-react';

import { useAuth } from '@/components/AuthProvider';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  useGetProfile,
  useUpdateProfilePhoto,
  getGetProfileQueryKey,
} from '@workspace/api-client-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'uploads';
const PHOTO_FOLDER = 'profile-photo';

export default function Profile() {
  const { rollNo, user } = useAuth();
  const { isReady } = useAuthGuard();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);
  const [photoVersion, setPhotoVersion] = useState<number>(Date.now());

  const { data: profile, isLoading } = useGetProfile(rollNo || '', {
    query: { enabled: !!rollNo } as any,
  });

  useEffect(() => {
    return () => {
      if (localPhotoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localPhotoPreview);
      }
    };
  }, [localPhotoPreview]);

  const updatePhoto = useUpdateProfilePhoto({
    mutation: {
      onSuccess: (data) => {
        toast.success('Profile photo updated');

        if (rollNo) {
          queryClient.setQueryData(getGetProfileQueryKey(rollNo), data);
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey(rollNo) });
        }

        setPhotoVersion(Date.now());

        if (data?.photo_url) {
          setLocalPhotoPreview(
            `${data.photo_url}${data.photo_url.includes('?') ? '&' : '?'}v=${Date.now()}`
          );
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error('Failed to save photo URL in database.');
      },
    },
  });

  const initials = useMemo(() => {
    const name = profile?.student_name?.trim();
    if (!name) return '?';

    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.student_name]);

  const photoSrc = useMemo(() => {
    const base = localPhotoPreview || profile?.photo_url || '';
    if (!base) return '';
    if (base.startsWith('blob:')) return base;
    return `${base}${base.includes('?') ? '&' : '?'}v=${photoVersion}`;
  }, [localPhotoPreview, profile?.photo_url, photoVersion]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !rollNo) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    const maxSizeMb = 5;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Please upload an image smaller than ${maxSizeMb}MB.`);
      e.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPhotoPreview(objectUrl);
    setIsUploadingPhoto(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `${PHOTO_FOLDER}/${rollNo}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);

      const finalUrl = `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;

      updatePhoto.mutate({
        rollNo,
        data: { photo_url: finalUrl },
      });
    } catch (error) {
      console.error(error);
      toast.error('Photo upload failed.');

      if (objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }

      setLocalPhotoPreview(
        profile?.photo_url
          ? `${profile.photo_url}${profile.photo_url.includes('?') ? '&' : '?'}v=${Date.now()}`
          : null
      );
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <PageTransition className="min-h-[100dvh] md:min-h-0 bg-background">
        <div className="relative min-h-[100dvh] md:min-h-0">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-primary via-indigo-700 to-indigo-950" />
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.20),transparent_45%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)]" />

          <div className="relative z-10 px-4 sm:px-6 md:px-10 pt-6 pb-28 md:pb-12">
            <div className="mx-auto max-w-5xl">
              <div className="rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden">
                <div className="px-5 sm:px-6 md:px-8 pt-6 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs text-white/90">
                      <Sparkles size={13} />
                      Profile Center
                    </div>
                    <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-100 border border-emerald-300/20">
                      <ShieldCheck size={13} />
                      Verified account
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col md:flex-row md:items-end gap-6">
                    <div className="relative w-fit mx-auto md:mx-0">
                      {isLoading ? (
                        <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/15" />
                      ) : (
                        <div className="relative">
                          <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-[5px] border-white/35 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                            <AvatarImage
                              src={photoSrc}
                              alt={profile?.student_name || 'Profile photo'}
                              className="object-cover"
                              key={photoSrc || 'avatar'}
                            />
                            <AvatarFallback className="bg-white/15 text-white text-2xl sm:text-3xl font-bold backdrop-blur-md">
                              {isUploadingPhoto || updatePhoto.isPending ? (
                                <Loader2 className="w-7 h-7 animate-spin" />
                              ) : initials ? (
                                initials
                              ) : (
                                <UserIcon size={32} />
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto || updatePhoto.isPending}
                            aria-label="Change profile photo"
                            className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-white text-primary shadow-lg flex items-center justify-center active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isUploadingPhoto || updatePhoto.isPending ? (
                              <Loader2 className="w-4.5 h-4.5 animate-spin" />
                            ) : (
                              <Camera size={17} />
                            )}
                          </button>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      {isLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-9 w-52 mx-auto md:mx-0 bg-white/15" />
                          <Skeleton className="h-4 w-36 mx-auto md:mx-0 bg-white/15" />
                          <Skeleton className="h-4 w-64 mx-auto md:mx-0 bg-white/15" />
                        </div>
                      ) : (
                        <>
                          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {profile?.student_name || 'Student'}
                          </h1>

                          <div className="mt-2 flex flex-wrap items-center gap-2 justify-center md:justify-start text-sm text-white/80">
                            <span className="inline-flex items-center gap-1.5">
                              <Mail size={14} className="text-white/60" />
                              {user?.email || '—'}
                            </span>
                            <span className="hidden sm:inline text-white/35">•</span>
                            <span className="inline-flex items-center gap-1.5">
                              <Hash size={14} className="text-white/60" />
                              {rollNo || '—'}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingPhoto || updatePhoto.isPending}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-md hover:shadow-lg active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <PenSquare size={15} />
                              Change photo
                            </button>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 border border-white/10">
                              <GraduationCap size={15} />
                              {profile?.course_name || 'Student profile'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4 space-y-4">
                  <InfoPanel title="Quick Info" icon={<Sparkles size={16} />}>
                    <div className="grid grid-cols-2 gap-3">
                      <MiniStat
                        label="Roll No"
                        value={profile?.class_roll_no || rollNo || '—'}
                        icon={<Hash size={14} />}
                        isLoading={isLoading}
                      />
                      <MiniStat
                        label="Semester"
                        value={profile?.sem ? `Sem ${profile.sem}` : '—'}
                        icon={<GraduationCap size={14} />}
                        isLoading={isLoading}
                      />
                    </div>
                  </InfoPanel>

                  <InfoPanel title="Account" icon={<Mail size={16} />}>
                    <RowItem icon={<Mail size={14} />} label="Email" value={user?.email} isLoading={false} />
                    <RowItem icon={<Hash size={14} />} label="Roll No" value={rollNo} isLoading={false} />
                  </InfoPanel>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <InfoPanel title="Personal Information" icon={<Users size={16} />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                      <RowItem icon={<Users size={14} />} label="Gender" value={profile?.gender} isLoading={isLoading} />
                      <RowItem
                        icon={<CalendarDays size={14} />}
                        label="Date of Birth"
                        value={formatDate(profile?.date_of_birth)}
                        isLoading={isLoading}
                      />
                    </div>
                  </InfoPanel>

                  <InfoPanel title="Academic Information" icon={<GraduationCap size={16} />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                      <RowItem
                        icon={<Building2 size={14} />}
                        label="College"
                        value={profile?.college_name}
                        isLoading={isLoading}
                      />
                      <RowItem
                        icon={<BookOpen size={14} />}
                        label="Course"
                        value={profile?.course_name}
                        isLoading={isLoading}
                      />
                      <RowItem
                        icon={<GraduationCap size={14} />}
                        label="Semester"
                        value={profile?.sem ? `Semester ${profile.sem}` : null}
                        isLoading={isLoading}
                      />
                    </div>
                  </InfoPanel>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}

function InfoPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] bg-card border border-border shadow-sm overflow-hidden">
      <header className="px-5 py-4 border-b border-border/60 bg-muted/30 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </header>
      <div className="px-5 py-2">{children}</div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-3/4" />
      ) : (
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      )}
    </div>
  );
}

function RowItem({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
        {icon}
        <span className="text-sm whitespace-nowrap">{label}</span>
      </div>

      <div className="min-w-0 max-w-[55%] text-right">
        {isLoading ? (
          <Skeleton className="h-4 w-28 ml-auto" />
        ) : (
          <span className="text-sm font-semibold text-foreground truncate block">
            {value || '—'}
          </span>
        )}
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}