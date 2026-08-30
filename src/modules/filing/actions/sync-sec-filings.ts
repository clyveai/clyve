"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { ingestSecFilingsForThesis, SecFilingIngestionError } from "../services/ingest-sec-filings-for-thesis";
import type { SecFilingSyncResult } from "../types";

export type SyncSecFilingsActionState = {
  error?: string;
  result?: SecFilingSyncResult;
};

export async function syncSecFilingsAction(
  thesisId: string,
  _previousState: SyncSecFilingsActionState,
  _formData: FormData,
): Promise<SyncSecFilingsActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session has expired. Please sign in again." };
  }

  try {
    const result = await ingestSecFilingsForThesis(user.id, thesisId);
    revalidatePath("/dashboard");
    revalidatePath(`/thesis/${thesisId}`);
    return { result };
  } catch (error) {
    console.error("Failed to sync SEC filings", error);
    return {
      error: error instanceof SecFilingIngestionError
        ? error.message
        : "We could not sync SEC filings. Please try again.",
    };
  }
}
