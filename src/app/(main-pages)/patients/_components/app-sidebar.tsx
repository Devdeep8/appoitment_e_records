"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/app/(main-pages)/doctors/_components/nav-main";
// import { NavProjects } from "@/app/(main-pages)/doctors/_components/nav-projects"
import { NavUser } from "@/app/(main-pages)/doctors/_components/nav-user";
import { TeamSwitcher } from "@/app/(main-pages)/doctors/_components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Define the user type
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
};

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Appointment",
          url: "#",
        },
        {
          title: "Patient",
          url: "#",
        },
        {
          title: "Available",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Patient Report",
          url: "#",
        },
        {
          title: "Daily Time",
          url: "#",
        },
        {
          title: "Tomorrow Appointment",
          url: "#",
        },
      ],
    },
    {
      title: "Medical Record",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "All Patient",
          url: "#",
        },
        {
          title: "Upload",
          url: "#",
        },
        {
          title: "Guide",
          url: "#",
        },
        
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Notification",
          url: "#",
        },
        {
          title: "Supscreption",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User | null;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
