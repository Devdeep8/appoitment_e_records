"use client";

import * as React from "react";
import {
  Activity,
  Calendar,
  FileHeart,
  GalleryVerticalEnd,
  HeartPlus,
  MessagesSquare,
  Settings2,
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
    { name: "HealthHub", logo: GalleryVerticalEnd, plan: "Premium" },
    { name: "CarePoint", logo: HeartPlus, plan: "Standard" },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/patients/dashboard",
      icon: Activity,
      items: [
        { title: "Overview", url: "/patients/dashboard" },
        { title: "My Vitals", url: "/patients/dashboard/vitals" },
        { title: "Health Goals", url: "/patients/dashboard/goals" },
      ],
    },
    {
      title: "Appointments",
      url: "/patients/appointments",
      icon: Calendar,
      items: [
        { title: "Upcoming", url: "/patients/appointments/upcoming" },
        { title: "Past", url: "/patients/appointments/past" },
        { title: "Book New", url: "/patients/appointments/book" },
      ],
    },
    {
      title: "Medical",
      url: "/patients/medical",
      icon: FileHeart,
      items: [
        { title: "Prescriptions", url: "/patients/medical/prescriptions" },
        { title: "Lab Results", url: "/patients/medical/labs" },
        { title: "History", url: "/patients/medical/history" },
      ],
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
