import {
  LayoutDashboard, Megaphone, Bell, Newspaper, Users, Building2,
  Video, CalendarDays, PlaneTakeoff, ShieldCheck, MessageSquareHeart,
  Settings, Crown,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    label: "Command",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/ceo", label: "CEO Messages", icon: Crown },
    ],
  },
  {
    label: "Communications",
    items: [
      { to: "/announcements", label: "Announcements", icon: Megaphone },
      { to: "/notices", label: "Notices", icon: Bell },
      { to: "/news", label: "News", icon: Newspaper },
    ],
  },
  {
    label: "Organization",
    items: [
      { to: "/departments", label: "Departments", icon: Building2 },
      { to: "/employees", label: "Employees", icon: Users },
      { to: "/safety", label: "Safety", icon: ShieldCheck },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/meetings", label: "Meeting Platform", icon: Video },
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/leave", label: "Leave", icon: PlaneTakeoff },
      { to: "/feedback", label: "Feedback", icon: MessageSquareHeart },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const NAV_FLAT = NAV_GROUPS.flatMap((g) => g.items);
