"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { parseUpdateThesisFormData } from "../schemas/update-thesis";
import { updateThesis } from "../services/update-thesis";

export type UpdateThesisActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateThesisAction(
  thesisId: string,
  _previousState: UpdateThesisActionState,
  formData: FormData,
): Promise<UpdateThesisActionState> {
  const parsed = parseUpdateThesisFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session has expired. Please sign in again." };
  }

  try {
    await updateThesis(user.id, thesisId, parsed.data);
  } catch (error) {
    console.error("Failed to update thesis", error);
    return { error: error instanceof Error ? error.message : "We could not save your changes. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/thesis/${thesisId}`);
  redirect(`/thesis/${thesisId}`);
}
