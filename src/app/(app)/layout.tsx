import { SidebarProvider } from "@/context/SidebarContext";

/** Shared authenticated-app shell state. Route pages only compose domain UI. */
export default function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
