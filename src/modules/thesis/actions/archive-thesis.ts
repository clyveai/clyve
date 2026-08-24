"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { archiveThesis } from "../services/archive-thesis";

export type ArchiveThesisActionState = {
  error?: string;
};

export async function archiveThesisAction(
  thesisId: string,
  version: number,
  _previousState: ArchiveThesisActionState,
  _formData: FormData,
): Promise<ArchiveThesisActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session has expired. Please sign in again." };
  }

  try {
    await archiveThesis(user.id, thesisId, version);
  } catch (error) {
    console.error("Failed to archive thesis", error);
    return { error: error instanceof Error ? error.message : "We could not archive this thesis. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/thesis/${thesisId}`);
  redirect("/dashboard");
}
