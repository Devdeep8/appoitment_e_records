import { AppSidebar } from "@/app/(main-pages)/patients/_components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Navbar05 } from "@/components/ui/shadcn-io/navbar-05";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DoctorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session
  const session = await getServerSession(authOptions)
    
  if (!session || session.user.role !== "PATIENT") {
    redirect("/sign-in");
  }

  // Prepare user data with proper null checks
  const userData = {
    id: session.user.id,
    name: session.user.name || "", // Ensure name is a string
    email: session.user.email || "", // Ensure email is a string
    avatar: session.user.avatar || null, // Keep null as a valid value
    role: session.user.role,
  };


  // Otherwise, show onboarding form
  return (
    <div className="min-h-screen ">
      <SidebarProvider>
        <AppSidebar  user={userData}/>
        <SidebarInset>
          <header className="flex flex-col h-16 shrink-0  gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <Navbar05 />
            <div className="flex gap-2 items-center px-4">
              <SidebarTrigger className="" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="my-10">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
