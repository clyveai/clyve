"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { ingestNewsForThesis, NewsIngestionError } from "../services/ingest-news-for-thesis";
import type { NewsSyncResult } from "../types";

export type NewsSyncActionState = {
  error?: string;
  result?: NewsSyncResult;
  retryAt?: string;
};

export async function syncNewsAction(
  thesisId: string,
  _previousState: NewsSyncActionState,
  _formData: FormData,
): Promise<NewsSyncActionState> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(thesisId)) {
    return { error: "This thesis could not be found." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session has expired. Please sign in again." };
  }

  try {
    const result = await ingestNewsForThesis(user.id, thesisId);
    revalidatePath(`/thesis/${thesisId}`);
    return { result };
  } catch (error) {
    return {
      error: error instanceof NewsIngestionError ? error.message : "We could not sync news. Please try again.",
      retryAt: error instanceof NewsIngestionError ? error.retryAt : undefined,
    };
  }
}
