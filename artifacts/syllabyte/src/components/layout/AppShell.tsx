import React from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Settings, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/AuthProvider";
import { useGetProfile } from "@workspace/api-client-react";

type NavItem =
  | {
      href: string;
      label: string;
      icon: LucideIcon;
      image?: never;
    }
  | {
      href: string;
      label: string;
      image: string;
      icon?: never;
    };

const navItems: NavItem[] = [
  { href: "/home", icon: BookOpen, label: "Home" },
  {
    href: "/chatbot",
    image: "/syllabyteai.png",
    label: "Syllabyte Ai",
  },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function SidebarNav({ photoUrl }: { photoUrl?: string }) {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-background border-r border-border h-[100dvh] sticky top-0">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border/60">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm rotate-3 overflow-hidden">
          <img
            src="/syllabyte.png"
            alt="Syllabyte Logo"
            className="w-full h-full object-contain -rotate-3"
          />
        </div>
        <span className="font-serif font-bold text-xl text-foreground">
          SyllaByte
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {"image" in item ? (
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pb-5 pt-3 border-t border-border/60 space-y-3">
       

        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 hover:bg-muted/40 transition-colors"
        >
          <Avatar className="w-11 h-11 rounded-full border border-border shrink-0">
            <AvatarImage src={photoUrl || ""} className="object-cover" />
            <AvatarFallback className="text-sm font-semibold">U</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              Profile Center
            </p>
            
          </div>
        </Link>
      </div>
    </aside>
  );
}

function BottomNav({ photoUrl }: { photoUrl?: string }) {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50">
      <div className="bg-background/90 backdrop-blur-xl border border-border rounded-3xl shadow-lg overflow-hidden">
        <div className="px-3 h-16 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-14 h-full gap-1"
              >
                <div
                  className={`flex items-center justify-center p-1.5 rounded-2xl transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {"image" in item ? (
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-[20px] h-[20px] object-contain"
                    />
                  ) : (
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  )}
                </div>

                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center w-14 h-full gap-1"
          >
            <Avatar className="w-7 h-7 rounded-full border border-border shadow-sm">
              <AvatarImage src={photoUrl || ""} className="object-cover" />
              <AvatarFallback className="text-[10px] font-semibold">
                U
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium text-muted-foreground">
              Profile
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { rollNo } = useAuth();
  const { data: profile } = useGetProfile(rollNo || "", {
    query: { enabled: !!rollNo } as any,
  });

  const photoUrl = profile?.photo_url || "";

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden">
      <SidebarNav photoUrl={photoUrl} />

      <main className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>

      <BottomNav photoUrl={photoUrl} />
    </div>
  );
}