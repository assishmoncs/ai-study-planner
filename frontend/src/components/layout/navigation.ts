import {
  BarChart3,
  BookOpen,
  CheckSquare,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/study-plans', label: 'Study Plan', icon: BookOpen },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function isRouteActive(pathname: string, href: string) {
  return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
}
