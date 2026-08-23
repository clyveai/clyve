import {
  DashboardWorkspaceSkeleton,
  WorkspaceLoading,
} from "@/app/(app)/_components/app-shell/WorkspaceLoading";

export default function AppWorkspaceLoading() {
  return (
    <WorkspaceLoading>
      <DashboardWorkspaceSkeleton />
    </WorkspaceLoading>
  );
}
