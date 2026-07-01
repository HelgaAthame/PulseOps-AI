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
  { title: "Обзор", href: "/", icon: LayoutDashboard },
  { title: "События", href: "/events", icon: Activity },
  { title: "Аналитика", href: "/analytics", icon: BarChart3 },
  { title: "AI-аналитик", href: "/ai", icon: Sparkles },
  { title: "Настройки", href: "/settings", icon: Settings },
];
