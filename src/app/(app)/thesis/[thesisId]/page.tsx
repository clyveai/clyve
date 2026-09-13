import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import { SecFilingHistory } from "@/modules/filing/components/SecFilingHistory";
import { getSecFilingHistoryForThesis } from "@/modules/filing/services/get-sec-filing-history-for-thesis";
import { NewsHistory } from "@/modules/news/components/NewsHistory";
import { getNewsHistoryForThesis } from "@/modules/news/services/get-news-history-for-thesis";
import { ThesisDocument } from "@/modules/thesis/components/ThesisDocument";
import { getThesisByIdForUser } from "@/modules/thesis/services/get-thesis-by-id";

export default async function ThesisDetailPage({ params }: { params: Promise<{ thesisId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { thesisId } = await params;
  const [thesis, filings, newsHistory] = await Promise.all([
    getThesisByIdForUser(thesisId, user.id),
    getSecFilingHistoryForThesis(user.id, thesisId),
    getNewsHistoryForThesis(user.id, thesisId),
  ]);

  if (!thesis) {
    notFound();
  }

  return (
    <ThesisDocument
      thesis={thesis}
      filingHistory={
        <SecFilingHistory
          ticker={thesis.ticker}
          hasSecIdentity={Boolean(thesis.companyCik)}
          isArchived={thesis.status === "archived"}
          filings={filings}
        />
      }
      newsHistory={
        <NewsHistory
          thesisId={thesis.id}
          ticker={thesis.ticker}
          companyName={thesis.companyName}
          canSync={thesis.status === "active" && Boolean(thesis.companyName && thesis.companyCik)}
          isArchived={thesis.status === "archived"}
          history={newsHistory}
        />
      }
    />
  );
}
