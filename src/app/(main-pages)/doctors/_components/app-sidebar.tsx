"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  FileText,
  GalleryVerticalEnd,
  Home,
  User,
  Settings,
  Activity,
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
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Appointments",
          url: "#appointments",
        },
        {
          title: "Book Appointment",
          url: "#book",
          isActive: true,
        },
        {
          title: "Available Slots",
          url: "#available",
        },
      ],
    },
    {
      title: "Medical Records",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "My Records",
          url: "#records",
        },
        {
          title: "Test Reports",
          url: "#reports",
        },
        {
          title: "Prescriptions",
          url: "#prescriptions",
        },
      ],
    },
    {
      title: "Health",
      url: "#",
      icon: Activity,
      items: [
        {
          title: "Vital Signs",
          url: "#vitals",
        },
        {
          title: "Medications",
          url: "#medications",
        },
        {
          title: "Allergies",
          url: "#allergies",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Profile",
          url: "#profile",
        },
        {
          title: "Notifications",
          url: "#notifications",
        },
        {
          title: "Privacy",
          url: "#privacy",
        },
      ],
    },
  ],
  // quickActions: [
  //   {
  //     name: "Book Appointment",
  //     icon: Calendar,
  //     color: "blue"
  //   },
  //   {
  //     name: "View Records",
  //     icon: FileText,
  //     color: "green"
  //   },
  //   {
  //     name: "Medications",
  //     icon: Pill,
  //     color: "purple"
  //   },
  // ],
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
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
