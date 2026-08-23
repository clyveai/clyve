import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { ThesisSidebarList } from "@/modules/thesis/components/ThesisSidebarList";
import { getUserTheses } from "@/modules/thesis/services/get-user-theses";
import { WorkspaceShell } from "./WorkspaceShell";

/** Server composition point for the thesis workspace and its scoped navigation data. */
export default async function ThesisWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const theses = await getUserTheses(user.id);

  return (
    <WorkspaceShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      }}
      thesisNavigation={<ThesisSidebarList theses={theses} />}
    >
      {children}
    </WorkspaceShell>
  );
}
