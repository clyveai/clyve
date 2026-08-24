import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { ThesisEditForm } from "@/modules/thesis/components/ThesisEditForm";
import { getThesisByIdForUser } from "@/modules/thesis/services/get-thesis-by-id";

export default async function EditThesisPage({ params }: { params: Promise<{ thesisId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { thesisId } = await params;
  const thesis = await getThesisByIdForUser(thesisId, user.id);

  if (!thesis) {
    notFound();
  }

  if (thesis.status !== "active") {
    redirect(`/thesis/${thesis.id}`);
  }

  return <ThesisEditForm thesis={thesis} />;
}
