import React from 'react';
import { Link, useLocation } from 'wouter';
import { BookOpen, User, Settings } from 'lucide-react';

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: '/home', icon: BookOpen, label: 'Home' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-16 h-full gap-1">
              <div className={`flex items-center justify-center p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
