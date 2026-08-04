import React from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/layout/PageTransition";
import { AppShell } from "@/components/layout/AppShell";
import { syllabus } from "@/data";
import { motion } from "framer-motion";
import { ChevronRight, GraduationCap, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGetProfile } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const subjectGradients: Record<
  string,
  {
    card: string;
    badge: string;
    icon: string;
  }
> = {
  blue: {
    card: "from-blue-50 via-white to-indigo-50 border-blue-100",
    badge: "bg-blue-100 text-blue-700",
    icon: "bg-blue-500",
  },
  green: {
    card: "from-emerald-50 via-white to-teal-50 border-emerald-100",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "bg-emerald-500",
  },
  purple: {
    card: "from-purple-50 via-white to-violet-50 border-purple-100",
    badge: "bg-purple-100 text-purple-700",
    icon: "bg-purple-500",
  },
  orange: {
    card: "from-orange-50 via-white to-amber-50 border-orange-100",
    badge: "bg-orange-100 text-orange-700",
    icon: "bg-orange-500",
  },
  red: {
    card: "from-rose-50 via-white to-pink-50 border-rose-100",
    badge: "bg-rose-100 text-rose-700",
    icon: "bg-rose-500",
  },
  yellow: {
    card: "from-yellow-50 via-white to-amber-50 border-yellow-100",
    badge: "bg-yellow-100 text-yellow-700",
    icon: "bg-yellow-500",
  },
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function PageGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      <div className="absolute inset-0 bg-[#fbfaf6]/85 [mask-image:radial-gradient(ellipse_at_center,transparent_15%,black)] dark:bg-black/80" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { isReady } = useAuthGuard();
  const { rollNo } = useAuth();

  const { data: profile } = useGetProfile(rollNo || "", {
    query: { enabled: !!rollNo } as any,
  });

  const firstName = profile?.student_name?.split(" ")[0] || "Student";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf6]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="relative min-h-screen w-full overflow-hidden bg-[#fbfaf6]">
          <PageGridBackground />

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-5 sm:py-6 lg:py-8">
            {/* HERO */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[#fbfaf6]/80 backdrop-blur-md text-foreground shadow-sm"
            >
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
              <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-10 p-5 sm:p-6 lg:p-7 xl:p-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-[#fbfaf6]/90 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span className="text-xs sm:text-sm font-semibold text-indigo-700">
                      Welcome Back
                    </span>
                  </div>

                  <p className="mt-4 text-sm sm:text-base text-slate-500">
                    {greeting},
                  </p>

                  <h1 className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-900">
                    {firstName} 👋
                  </h1>

                  <p className="mt-3 max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-slate-600">
                    Welcome to SyllaByte. Your one-stop platform for B.Tech education.
                    Access curated notes, topics, and important questions organized
                    by subject and chapter to enhance your engineering journey.
                  </p>
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="hidden lg:flex h-24 w-24 xl:h-28 xl:w-28 items-center justify-center rounded-3xl bg-[#fbfaf6]/90 border border-slate-200 shadow-sm shrink-0"
                >
                  <GraduationCap size={44} className="text-indigo-600" />
                </motion.div>
              </div>
            </motion.div>

            {/* SECTION */}
            <div className="mt-8 sm:mt-10 lg:mt-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Semester Subjects
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Choose a subject to explore its units and study notes.
              </p>
            </div>

            {/* GRID */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 xl:gap-7 pb-8"
            >
              {syllabus.map((subject) => {
                const colors =
                  subjectGradients[subject.colorClass] ?? subjectGradients.blue;

                return (
                  <motion.button
                    key={subject.id}
                    variants={cardVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setLocation(`/subject/${subject.id}`)}
                    className={[
                      "group relative overflow-hidden rounded-3xl border bg-gradient-to-br text-left shadow-sm",
                      colors.card,
                      "transition-all duration-300 hover:shadow-2xl hover:border-primary/20",
                      "p-4 sm:p-5 lg:p-7",
                      "min-h-[120px] sm:min-h-[150px] lg:min-h-[180px]",
                    ].join(" ")}
                  >
                    {/* Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/40 via-transparent to-transparent" />

                    {/* Floating Circle */}
                    <div
                      className={[
                        "absolute -right-10 -top-10 h-28 w-28 sm:h-36 sm:w-36 rounded-full",
                        colors.icon,
                        "opacity-[0.08] transition-transform duration-500 group-hover:scale-125",
                      ].join(" ")}
                    />

                    <div className="relative z-10 flex h-full flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold tracking-wider uppercase",
                            colors.badge,
                          ].join(" ")}
                        >
                          {subject.code}
                        </span>

                        <motion.div
                          whileHover={{ rotate: -8, scale: 1.08 }}
                          className={[
                            "flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-lg shrink-0",
                            colors.icon,
                          ].join(" ")}
                        >
                          <ChevronRight size={18} className="sm:hidden" />
                          <ChevronRight size={22} className="hidden sm:block" />
                        </motion.div>
                      </div>

                      {/* Title */}
                      <div className="mt-4 sm:mt-7">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                          {subject.name}
                        </h3>
                      </div>

                      {/* Divider */}
                      <div className="my-4 sm:my-6 h-px bg-gradient-to-r from-foreground/10 via-foreground/5 to-transparent" />

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-end gap-1.5 sm:gap-2 text-sm font-semibold text-primary">
                        <span className="text-xs sm:text-sm">Open</span>
                        <ChevronRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}