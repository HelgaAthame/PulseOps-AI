import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

/** Пункты бокового меню дашборда. */
export const navItems: NavItem[] = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Events", href: "/events", icon: Activity },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "AI Analyst", href: "/ai", icon: Sparkles },
  { title: "Settings", href: "/settings", icon: Settings },
];
