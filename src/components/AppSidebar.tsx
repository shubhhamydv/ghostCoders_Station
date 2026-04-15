import { Home, CalendarDays, Brain, Mic, FileText, BookOpen, Users, User, Settings, Building, Briefcase, AudioLines, Video, AlertTriangle, Award, Calendar, Target } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Home', url: '/dashboard', icon: Home },
  { title: 'Weekly Plan', url: '/dashboard/weekly', icon: CalendarDays },
  { title: 'Quizzes', url: '/dashboard/quizzes', icon: Brain },
  { title: 'Interview Prep', url: '/dashboard/interview', icon: Mic },
  { title: 'Mock Interview', url: '/dashboard/mock-interview', icon: Video },
  { title: 'Speech Practice', url: '/dashboard/speech', icon: AudioLines },
  { title: 'Weakness Detector', url: '/dashboard/weakness', icon: AlertTriangle },
  { title: 'Readiness Score', url: '/dashboard/readiness', icon: Award },
  { title: 'Company Prep', url: '/dashboard/company-prep', icon: Target },
  { title: 'Last 7 Days', url: '/dashboard/last-7-days', icon: Calendar },
  { title: 'Resume', url: '/dashboard/resume', icon: FileText },
  { title: 'Knowledge Vault', url: '/dashboard/vault', icon: BookOpen },
  { title: 'Companies', url: '/dashboard/companies', icon: Building },
  { title: 'Jobs', url: '/dashboard/jobs', icon: Briefcase },
  { title: 'Social Hub', url: '/dashboard/social', icon: Users },
  { title: 'Profile', url: '/dashboard/profile', icon: User },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { domain } = useStationStore();
  const config = domainConfig[domain];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="flex items-center gap-2">
<<<<<<< HEAD
=======
                <img src="/logo.svg" alt="Station logo" className="h-8 w-8 rounded-md border border-border bg-background" />
>>>>>>> 396a475fd94fdd8c2da98391546caf3cb2ae119d
                <span className="font-bold text-sidebar-primary">STATION</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-primary/20 text-sidebar-primary font-medium">{config.tag}</span>
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/dashboard'} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <div className="p-3">
            <ThemeSwitcher />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
