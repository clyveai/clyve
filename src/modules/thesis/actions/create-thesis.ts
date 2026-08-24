"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import {
  CompanyIdentityNotFoundError,
  CompanyIdentityUnavailableError,
} from "@/modules/company/services/resolve-sec-company-identity";
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
    if (error instanceof CompanyIdentityNotFoundError) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: { ticker: "This ticker is not listed in the SEC company directory." },
      };
    }

    if (error instanceof CompanyIdentityUnavailableError) {
      return {
        error: "We could not verify this ticker with the SEC. Please try again.",
        fieldErrors: { ticker: "SEC ticker verification is unavailable." },
      };
    }

    return { error: "We could not save your thesis. Please try again." };
  }

  redirect(`/thesis/${thesisId}`);
}
