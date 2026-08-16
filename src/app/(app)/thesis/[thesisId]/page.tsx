import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { ThesisDocument } from "@/modules/thesis/components/ThesisDocument";
import { getThesisByIdForUser } from "@/modules/thesis/services/get-thesis-by-id";

export default async function ThesisDetailPage({ params }: { params: Promise<{ thesisId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { thesisId } = await params;
  const thesis = await getThesisByIdForUser(thesisId, user.id);

  if (!thesis) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-[var(--bg-primary)] px-4 py-24 text-white sm:px-6">
      <ThesisDocument thesis={thesis} />
    </main>
  );
}
