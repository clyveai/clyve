"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { parseCreateThesisFormData } from "../schemas/create-thesis";
import { createThesis } from "../services/create-thesis";

export type CreateThesisActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createThesisAction(
  _previousState: CreateThesisActionState,
  formData: FormData,
): Promise<CreateThesisActionState> {
  const parsed = parseCreateThesisFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session has expired. Please sign in again." };
  }

  let thesisId: string;

  try {
    const thesis = await createThesis(user.id, parsed.data);
    thesisId = thesis.id;
  } catch (error) {
    console.error("Failed to create thesis", error);
    return { error: "We could not save your thesis. Please try again." };
  }

  redirect(`/thesis/${thesisId}`);
}
